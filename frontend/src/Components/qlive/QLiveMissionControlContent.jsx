import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  IconButton,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ScienceIcon from '@mui/icons-material/Science';

import { useQLive } from '../../context/QLiveContext';
import { useSimulation } from '../../context/SimulationContext';
import JobDetailsCard from './JobDetailsCard';

const SAMPLE_QASM = `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0],q[1];\nmeasure q -> c;`;

function StatusChip({ status }) {
  const normalized = (status || '').toLowerCase();
  const [color, label] = useMemo(() => {
    switch (normalized) {
      case 'queued':
        return ['default', 'Queued'];
      case 'running':
        return ['info', 'Running'];
      case 'completed':
        return ['success', 'Completed'];
      case 'cancelled':
        return ['warning', 'Cancelled'];
      case 'failed':
        return ['error', 'Failed'];
      default:
        return ['default', normalized || 'Unknown'];
    }
  }, [normalized]);
  return <Chip size="small" color={color} label={label} />;
}

export default function QLiveMissionControlContent() {
  const {
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
    refreshJobs,
    submitJob,
    cancelJob,
    lastAction
  } = useQLive();

  const { simulationResult } = useSimulation();

  const [openqasm, setOpenqasm] = useState('');
  const [shots, setShots] = useState(1024);
  const [deviceId, setDeviceId] = useState('');
  const [formError, setFormError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(null);

  useEffect(() => {
    if (simulationResult?.openqasm) {
      setOpenqasm((prev) => (prev ? prev : simulationResult.openqasm));
    }
  }, [simulationResult]);

  useEffect(() => {
    if (!deviceId && devices.length > 0) {
      setDeviceId(devices[0].id);
    }
  }, [devices, deviceId]);

  useEffect(() => {
    if (copyFeedback) {
      const timer = setTimeout(() => setCopyFeedback(null), 2000);
      return () => clearTimeout(timer);
    }
  }, [copyFeedback]);

  const handleSubmit = useCallback(async () => {
    setFormError(null);
    if (!openqasm.trim()) {
      setFormError('Provide an OpenQASM payload to submit.');
      return;
    }
    if (!deviceId) {
      setFormError('Select a target device.');
      return;
    }
    let parsedShots = Number(shots);
    if (!Number.isFinite(parsedShots) || parsedShots <= 0) {
      setFormError('Shots must be a positive integer.');
      return;
    }
    parsedShots = Math.floor(parsedShots);
    setIsSubmitting(true);
    try {
      const res = await submitJob({ openqasm, shots: parsedShots, device_id: deviceId });
      if (!res) {
        setFormError('Submission failed. Check logs for details.');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  }, [openqasm, shots, deviceId, submitJob]);

  const handleQuickStart = useCallback(() => {
    setOpenqasm(SAMPLE_QASM);
    setShots(1024);
  }, []);

  const handleSubmitSample = useCallback(async () => {
    setFormError(null);
    const targetDevice = deviceId || (devices[0] && devices[0].id);
    if (!targetDevice) {
      setFormError('No devices available for submission.');
      return;
    }
    setIsSubmitting(true);
    try {
      const res = await submitJob({ openqasm: SAMPLE_QASM, shots: 1024, device_id: targetDevice });
      if (!res) {
        setFormError('Sample job submission failed.');
      }
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Sample submission failed.');
    } finally {
      setIsSubmitting(false);
    }
  }, [deviceId, devices, submitJob]);

  const handleCopyQasm = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(openqasm);
      setCopyFeedback('Copied!');
    } catch (err) {
      setCopyFeedback('Copy failed');
    }
  }, [openqasm]);

  const handleSelectJob = useCallback((jobId) => {
    setSelectedJobId(jobId);
  }, [setSelectedJobId]);

  const activeJobs = useMemo(
    () => jobs.filter((job) => !['completed', 'cancelled', 'failed'].includes((job.status || '').toLowerCase())),
    [jobs]
  );

  const renderResultJson = (label, data) => {
    if (data === undefined || data === null) {
      return null;
    }
    if (typeof data === 'object' && !Array.isArray(data) && Object.keys(data).length === 0) {
      return null;
    }
    const normalized =
      typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean'
        ? String(data)
        : JSON.stringify(data, null, 2);
    return (
      <Stack spacing={0.5}>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>{label}</Typography>
        <Box
          component="pre"
          sx={{
            bgcolor: 'background.default',
            p: 2,
            borderRadius: 2,
            maxHeight: 220,
            overflow: 'auto',
            border: '1px solid',
            borderColor: 'divider',
            fontSize: 12,
          }}
        >
          {normalized}
        </Box>
      </Stack>
    );
  };

  const formatCurrency = (value) => {
    if (!Number.isFinite(value)) return null;
    const abs = Math.abs(value);
    const decimals = abs >= 1 ? 2 : abs >= 0.1 ? 3 : 4;
    const formatted = value.toFixed(decimals).replace(/0+$/, '').replace(/\.$/, '');
    return `$${formatted}`;
  };

  const formatDeviceCost = (device) => {
    const pricing = device?.metadata?.pricing;
    if (!pricing) {
      return 'Free';
    }
    const parsePrice = (val) => {
      const num = Number(val);
      return Number.isFinite(num) && num > 0 ? num : null;
    };
    const candidates = [
      { value: parsePrice(pricing.perShot), unit: 'shot' },
      { value: parsePrice(pricing.perTask), unit: 'task' },
      { value: parsePrice(pricing.perMinute), unit: 'min' },
    ];
    const found = candidates.find((candidate) => candidate.value !== null);
    if (!found) {
      return 'Free';
    }
    const currency = formatCurrency(found.value);
    return currency ? `${currency}/${found.unit}` : 'Free';
  };

  if (isEnabled === false) {
    return (
      <Box sx={{ maxWidth: 960, mx: 'auto', px: 3, py: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 2, textAlign: 'center' }}>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            QLive Preview Unavailable
          </Typography>
          <Typography variant="body1" sx={{ mb: 3 }}>
            This deployment has QLive Preview disabled. Set <code>QLIVE_ENABLED=true</code> and restart the backend to access live hardware workflows.
          </Typography>
          <Button variant="contained" onClick={refreshProviders}>
            Check Again
          </Button>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto', px: { xs: 2, md: 4 }, py: { xs: 4, md: 6 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5, color: "var(--qt-text)" }}>
          <ScienceIcon fontSize="large" sx={{ color: "var(--qt-accent)" }} /> QLive Mission Control
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh providers">
            <span>
              <IconButton onClick={refreshProviders} disabled={loading} sx={{ color: "var(--qt-text)" }}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Refresh jobs">
            <span>
              <IconButton onClick={() => refreshJobs(selectedProviderId)} disabled={!selectedProviderId} sx={{ color: "var(--qt-text)" }}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}

      <Paper sx={{ p: 3, mb: 3, borderRadius: 2, background: "var(--qt-surface, #0d1117)", border: "1px solid var(--qt-border)" }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormControl fullWidth sx={{ '& .MuiInputLabel-root': { color: 'var(--qt-text-dim)' }, '& .MuiOutlinedInput-root': { color: 'var(--qt-text)', '& fieldset': { borderColor: 'var(--qt-border)' }, '&:hover fieldset': { borderColor: 'var(--qt-accent)' } }, '& .MuiSelect-icon': { color: 'var(--qt-text-dim)' } }}>
            <InputLabel id="qlive-provider-label">Provider</InputLabel>
            <Select
              labelId="qlive-provider-label"
              label="Provider"
              value={selectedProviderId || ''}
              onChange={(e) => setSelectedProviderId(e.target.value || null)}
            >
              {providers.map((provider) => (
                <MenuItem key={provider.id} value={provider.id}>
                  {provider.name || provider.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl fullWidth sx={{ '& .MuiInputLabel-root': { color: 'var(--qt-text-dim)' }, '& .MuiOutlinedInput-root': { color: 'var(--qt-text)', '& fieldset': { borderColor: 'var(--qt-border)' }, '&:hover fieldset': { borderColor: 'var(--qt-accent)' } }, '& .MuiSelect-icon': { color: 'var(--qt-text-dim)' } }}>
            <InputLabel id="qlive-device-label">Device</InputLabel>
            <Select
              labelId="qlive-device-label"
              label="Device"
              value={deviceId}
              onChange={(e) => setDeviceId(e.target.value)}
            >
              {devices.map((device) => (
                <MenuItem key={device.id} value={device.id}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {device.name || device.id}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "var(--qt-text-dim)" }}>
                      Cost: {formatDeviceCost(device)}
                    </Typography>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Shots"
            type="number"
            value={shots}
            onChange={(e) => setShots(e.target.value)}
            inputProps={{ min: 1, step: 1 }}
            fullWidth
            sx={{ '& .MuiInputLabel-root': { color: 'var(--qt-text-dim)' }, '& .MuiOutlinedInput-root': { color: 'var(--qt-text)', '& fieldset': { borderColor: 'var(--qt-border)' }, '&:hover fieldset': { borderColor: 'var(--qt-accent)' } } }}
          />
        </Stack>
        <TextField
          label="OpenQASM"
          multiline
          minRows={6}
          value={openqasm}
          onChange={(e) => setOpenqasm(e.target.value)}
          sx={{ mt: 2, '& .MuiInputLabel-root': { color: 'var(--qt-text-dim)' }, '& .MuiOutlinedInput-root': { color: 'var(--qt-text)', '& fieldset': { borderColor: 'var(--qt-border)' }, '&:hover fieldset': { borderColor: 'var(--qt-accent)' } } }}
          fullWidth
        />
        {formError && <Alert severity="warning" sx={{ mt: 2 }}>{formError}</Alert>}
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<PlayArrowIcon />}
            onClick={handleSubmit}
            disabled={isSubmitting || !selectedProviderId}
          >
            Submit Job
          </Button>
          <Button variant="outlined" onClick={handleQuickStart}>Load Bell Pair Sample</Button>
          <Button
            variant="outlined"
            startIcon={<ScienceIcon />}
            onClick={handleSubmitSample}
            disabled={isSubmitting || !selectedProviderId}
          >
            Submit Bell Pair Mock Job
          </Button>
          <Button variant="text" startIcon={<ContentCopyIcon />} onClick={handleCopyQasm}>
            Copy QASM
          </Button>
          {copyFeedback && <Chip label={copyFeedback} size="small" color="success" />}
        </Stack>
      </Paper>

      <Paper sx={{ p: 3, borderRadius: 2, mb: 3, background: "var(--qt-surface, #0d1117)", border: "1px solid var(--qt-border)" }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--qt-text)" }}>Job Queue</Typography>
          <Typography variant="body2" sx={{ color: "var(--qt-text-dim)" }}>
            Active jobs: {activeJobs.length} · Total: {jobs.length}
          </Typography>
        </Stack>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Job ID</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Device</TableCell>
              <TableCell>Shots</TableCell>
              <TableCell>Submitted</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => {
              const jobId = job.job_id || job.id;
              const status = (job.status || '').toLowerCase();
              const disableCancel = ['completed', 'cancelled', 'failed'].includes(status);
              return (
                <TableRow
                  key={jobId}
                  hover
                  onClick={() => handleSelectJob(jobId)}
                  selected={selectedJobId === jobId}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell>{jobId}</TableCell>
                  <TableCell><StatusChip status={job.status} /></TableCell>
                  <TableCell>{job.device_id || job.deviceId || '—'}</TableCell>
                  <TableCell>{job.shots ?? '—'}</TableCell>
                  <TableCell>{job.submitted_at || job.submittedAt || '—'}</TableCell>
                  <TableCell align="right">
                    <Button
                      size="small"
                      color="warning"
                      disabled={disableCancel}
                      onClick={(event) => {
                        event.stopPropagation();
                        cancelJob(jobId);
                      }}
                    >
                      Cancel
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
            {jobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                  <Typography variant="body2" sx={{ color: "var(--qt-text-dim)" }}>
                    No jobs submitted yet. Use the form above to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {selectedJobId && jobDetail && (
        <JobDetailsCard jobDetail={jobDetail} selectedJobId={selectedJobId} />
      )}

      {selectedJobId && !jobDetail && (
        <Paper sx={{ p: 3, borderRadius: 2, background: "var(--qt-surface, #0d1117)", border: "1px solid var(--qt-border)" }}>
          <Typography variant="body2" sx={{ color: "var(--qt-text-dim)" }}>
            Loading job detail for {selectedJobId}...
          </Typography>
        </Paper>
      )}

      {lastAction && lastAction.status === 'success' && (
        <Alert sx={{ mt: 3 }} severity="success">
          Last action succeeded.
        </Alert>
      )}
    </Box>
  );
}
