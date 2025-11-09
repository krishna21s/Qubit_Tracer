import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef
} from 'react';
import {
  fetchQLiveProviders,
  fetchQLiveDevices,
  fetchQLiveJobs,
  fetchQLiveJob,
  submitQLiveJob,
  cancelQLiveJob
} from '../utils/api';

const POLL_INTERVAL = 5000;
const TERMINAL_STATUSES = ["completed", "cancelled", "failed"];
const QLiveContext = createContext(null);

const isTerminalStatus = (status) => TERMINAL_STATUSES.includes((status || "").toLowerCase());

export function QLiveProvider({ children }) {
  const [isEnabled, setIsEnabled] = useState(null); // null until checked
  const [providers, setProviders] = useState([]);
  const [devices, setDevices] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedProviderId, setSelectedProviderId] = useState(null);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [jobDetail, setJobDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastAction, setLastAction] = useState(null);

  const pollingRef = useRef(null);
  const jobDetailIntervalRef = useRef(null);

  const runWithErrorHandling = useCallback(async (fn, defaultMessage) => {
    try {
      return await fn();
    } catch (err) {
      if (err && err.code === 'QLIVE_DISABLED') {
        setIsEnabled(false);
        setProviders([]);
        setDevices([]);
        setJobs([]);
        setSelectedProviderId(null);
        setSelectedJobId(null);
        setJobDetail(null);
        return null;
      }
      console.error(defaultMessage, err);
      setError(err instanceof Error ? err : new Error(defaultMessage));
      return null;
    }
  }, []);

  const refreshProviders = useCallback(async () => {
    setLoading(true);
    setError(null);
    const result = await runWithErrorHandling(
      async () => fetchQLiveProviders(),
      'Failed to fetch QLive providers'
    );
    if (!result) {
      setLoading(false);
      return;
    }
    const list = Array.isArray(result.providers) ? result.providers : [];
    setProviders(list);
    setIsEnabled(true);
    if (list.length > 0) {
      setSelectedProviderId((prev) => prev && list.some((p) => p.id === prev) ? prev : list[0].id);
    } else {
      setSelectedProviderId(null);
    }
    setLoading(false);
  }, [runWithErrorHandling]);

  const refreshDevices = useCallback(async (providerId) => {
    if (!providerId) {
      setDevices([]);
      return;
    }
    const result = await runWithErrorHandling(
      async () => fetchQLiveDevices(providerId),
      'Failed to fetch QLive devices'
    );
    if (result) {
      setDevices(Array.isArray(result.devices) ? result.devices : []);
    }
  }, [runWithErrorHandling]);

  const refreshJobs = useCallback(async (providerId) => {
    if (!providerId || isEnabled === false) {
      setJobs([]);
      return;
    }
    const result = await runWithErrorHandling(
      async () => fetchQLiveJobs(providerId),
      'Failed to fetch QLive jobs'
    );
    if (result) {
      const list = Array.isArray(result.jobs) ? result.jobs : [];
      setJobs(list);
      if (selectedJobId && !list.some((job) => job.job_id === selectedJobId)) {
        setSelectedJobId(null);
        setJobDetail(null);
      }
    }
  }, [runWithErrorHandling, selectedJobId, isEnabled]);

  const refreshJobDetail = useCallback(async (providerId, jobId) => {
    if (!providerId || !jobId) {
      setJobDetail(null);
      return null;
    }
    const result = await runWithErrorHandling(
      async () => fetchQLiveJob(jobId, providerId),
      'Failed to fetch QLive job detail'
    );
    if (result) {
      setJobDetail(result);
      if (isTerminalStatus(result.status) && jobDetailIntervalRef.current) {
        clearInterval(jobDetailIntervalRef.current);
        jobDetailIntervalRef.current = null;
      }
    }
    return result || null;
  }, [runWithErrorHandling]);

  // Initial load
  useEffect(() => {
    refreshProviders();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
      if (jobDetailIntervalRef.current) clearInterval(jobDetailIntervalRef.current);
    };
  }, [refreshProviders]);

  // Load devices and jobs when provider changes
  useEffect(() => {
    if (!selectedProviderId || !isEnabled) {
      setDevices([]);
      setJobs([]);
      return;
    }
    refreshDevices(selectedProviderId);
    refreshJobs(selectedProviderId);
  }, [selectedProviderId, refreshDevices, refreshJobs, isEnabled]);

  // Poll jobs while any are active
  useEffect(() => {
    if (!isEnabled || !selectedProviderId) {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      return;
    }
    const active = jobs.some((job) => !isTerminalStatus(job.status));
    if (active && !pollingRef.current) {
      pollingRef.current = setInterval(() => {
        refreshJobs(selectedProviderId);
      }, POLL_INTERVAL);
    }
    if (!active && pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  }, [jobs, selectedProviderId, refreshJobs, isEnabled]);

  // Poll selected job detail
  useEffect(() => {
    if (!isEnabled || !selectedProviderId || !selectedJobId) {
      if (jobDetailIntervalRef.current) {
        clearInterval(jobDetailIntervalRef.current);
        jobDetailIntervalRef.current = null;
      }
      return;
    }
    if (jobDetailIntervalRef.current) {
      clearInterval(jobDetailIntervalRef.current);
      jobDetailIntervalRef.current = null;
    }

    let cancelled = false;

    const startPolling = async () => {
      const detail = await refreshJobDetail(selectedProviderId, selectedJobId);
      if (cancelled) {
        return;
      }
      if (!detail || isTerminalStatus(detail.status)) {
        return;
      }
      jobDetailIntervalRef.current = setInterval(async () => {
        const latest = await refreshJobDetail(selectedProviderId, selectedJobId);
        if (latest && isTerminalStatus(latest.status) && jobDetailIntervalRef.current) {
          clearInterval(jobDetailIntervalRef.current);
          jobDetailIntervalRef.current = null;
        }
      }, POLL_INTERVAL);
    };

    startPolling();

    return () => {
      cancelled = true;
      if (jobDetailIntervalRef.current) {
        clearInterval(jobDetailIntervalRef.current);
        jobDetailIntervalRef.current = null;
      }
    };
  }, [selectedProviderId, selectedJobId, refreshJobDetail, isEnabled]);

  const submitJob = useCallback(async (payload) => {
    if (!selectedProviderId) {
      throw new Error('Select a provider before submitting a job');
    }
    setLastAction({ type: 'submit', status: 'pending' });
    const result = await runWithErrorHandling(
      async () => submitQLiveJob({ ...payload, provider_id: selectedProviderId }),
      'Failed to submit QLive job'
    );
    if (result) {
      setLastAction({ type: 'submit', status: 'success', job: result });
      await refreshJobs(selectedProviderId);
      setSelectedJobId(result.job_id);
    } else {
      setLastAction({ type: 'submit', status: 'error' });
    }
    return result;
  }, [selectedProviderId, runWithErrorHandling, refreshJobs]);

  const cancelJob = useCallback(async (jobId) => {
    if (!selectedProviderId || !jobId) return null;
    setLastAction({ type: 'cancel', status: 'pending', jobId });
    const result = await runWithErrorHandling(
      async () => cancelQLiveJob(jobId, selectedProviderId),
      'Failed to cancel QLive job'
    );
    if (result) {
      setLastAction({ type: 'cancel', status: 'success', job: result });
      await refreshJobs(selectedProviderId);
      if (selectedJobId === jobId) {
        setJobDetail(result);
      }
    } else {
      setLastAction({ type: 'cancel', status: 'error', jobId });
    }
    return result;
  }, [selectedProviderId, runWithErrorHandling, refreshJobs, selectedJobId]);

  const value = useMemo(() => ({
    isEnabled,
    loading,
    error,
    providers,
    devices,
    jobs,
    selectedProviderId,
    setSelectedProviderId,
    selectedJobId,
    setSelectedJobId,
    jobDetail,
    refreshProviders,
    refreshDevices,
    refreshJobs,
    refreshJobDetail,
    submitJob,
    cancelJob,
    lastAction
  }), [
    isEnabled,
    loading,
    error,
    providers,
    devices,
    jobs,
    selectedProviderId,
    selectedJobId,
    jobDetail,
    refreshProviders,
    refreshDevices,
    refreshJobs,
    refreshJobDetail,
    submitJob,
    cancelJob,
    lastAction
  ]);

  return (
    <QLiveContext.Provider value={value}>
      {children}
    </QLiveContext.Provider>
  );
}

export function useQLive() {
  const ctx = useContext(QLiveContext);
  if (!ctx) throw new Error('useQLive must be used within QLiveProvider');
  return ctx;
}
