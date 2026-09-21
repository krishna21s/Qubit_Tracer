import React, { useMemo, useState, useCallback } from 'react';
import {
  Check,
  Copy,
  Cpu,
  Zap,
  Coins,
  FlaskConical,
  Layers,
  Atom,
  Clock,
  Hourglass,
  CheckCircle2,
  AlertCircle,
  Terminal,
  BarChart3,
  Activity,
  X,
  Code
} from 'lucide-react';
import MeasurementChart from './MeasurementChart';
import ProbabilityDistribution from './ProbabilityDistribution';
import './qlive.css';

/**
 * Job Details Card - High-end analytical mission control view for completed QLive jobs
 */
export default function JobDetailsCard({ jobDetail, selectedJobId, onClose }) {
  const result = jobDetail?.result || {};
  const details = result.details || {};
  const counts = result.measurement_counts || result.counts_raw || {};
  const probabilities = result.measurement_probabilities || {};
  const metadata = details.metadata || {};
  const timeStamps = details.timeStamps || {};

  const [copiedJobId, setCopiedJobId] = useState(false);
  const [copiedQasm, setCopiedQasm] = useState(false);

  const totalShots = useMemo(() => {
    const val = Number(details.shots ?? jobDetail?.shots ?? result.data?.shots ?? result.shots ?? 0);
    return isNaN(val) ? 0 : val;
  }, [details, jobDetail, result]);

  const status = (jobDetail?.status || 'Unknown').toLowerCase();

  const statusConfig = useMemo(() => {
    switch (status) {
      case 'completed':
        return { label: 'COMPLETED', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.35)', icon: CheckCircle2 };
      case 'running':
        return { label: 'RUNNING', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.35)', icon: Activity };
      case 'queued':
        return { label: 'QUEUED', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.35)', icon: Hourglass };
      case 'failed':
        return { label: 'FAILED', color: '#ef4444', bg: 'rgba(239, 68, 68, 0.12)', border: 'rgba(239, 68, 68, 0.35)', icon: AlertCircle };
      case 'cancelled':
        return { label: 'CANCELLED', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.12)', border: 'rgba(107, 114, 128, 0.35)', icon: AlertCircle };
      default:
        return { label: status.toUpperCase(), color: '#8b949e', bg: 'rgba(255, 255, 255, 0.08)', border: 'rgba(255, 255, 255, 0.2)', icon: Activity };
    }
  }, [status]);

  const StatusIcon = statusConfig.icon;

  const handleCopyJobId = useCallback(() => {
    if (selectedJobId) {
      navigator.clipboard.writeText(selectedJobId);
      setCopiedJobId(true);
      setTimeout(() => setCopiedJobId(false), 2000);
    }
  }, [selectedJobId]);

  const handleCopyQasm = useCallback(() => {
    if (metadata.openQasm) {
      navigator.clipboard.writeText(metadata.openQasm);
      setCopiedQasm(true);
      setTimeout(() => setCopiedQasm(false), 2000);
    }
  }, [metadata.openQasm]);

  // Robust duration calculation to eliminate "Invalid Date"
  const durationText = useMemo(() => {
    const start = timeStamps.createdAt || jobDetail?.submitted_at;
    const end = timeStamps.endedAt || jobDetail?.end_at;
    if (start && end) {
      const diffMs = new Date(end).getTime() - new Date(start).getTime();
      if (!isNaN(diffMs) && diffMs >= 0) {
        if (diffMs < 1000) return `${diffMs} ms`;
        return `${(diffMs / 1000).toFixed(2)} s`;
      }
    }
    const rawDur = timeStamps.executionDuration ?? jobDetail?.run_duration ?? jobDetail?.time_stamps?.execution_duration_ms;
    if (typeof rawDur === 'number') {
      return rawDur < 10 ? `${rawDur.toFixed(2)} s` : `${rawDur} ms`;
    }
    if (typeof rawDur === 'string' && !rawDur.toLowerCase().includes('invalid')) {
      return rawDur;
    }
    return '—';
  }, [timeStamps, jobDetail]);

  const formatTimestamp = (val) => {
    if (!val) return '—';
    try {
      const d = new Date(val);
      if (isNaN(d.getTime())) return String(val);
      return d.toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit'
      });
    } catch {
      return String(val);
    }
  };

  const quickStats = [
    {
      label: 'Target Device',
      value: jobDetail?.device_id || jobDetail?.deviceId || '—',
      icon: Cpu,
      color: '#6366f1'
    },
    {
      label: 'Circuit Shots',
      value: totalShots > 0 ? totalShots.toLocaleString() : '—',
      icon: Zap,
      color: '#06b6d4'
    },
    {
      label: 'Estimated Cost',
      value: details.cost ? `$${Number(details.cost).toFixed(3)}` : 'Free / Included',
      icon: Coins,
      color: '#10b981'
    },
    {
      label: 'Experiment Type',
      value: details.experimentType || jobDetail?.experiment_type || 'gate_model',
      icon: FlaskConical,
      color: '#8b5cf6'
    },
    {
      label: 'Circuit Depth',
      value: metadata.circuitDepth ?? jobDetail?.transpile_stats?.depth_estimate ?? '—',
      icon: Layers,
      color: '#f59e0b'
    },
    {
      label: 'Qubits Allocated',
      value: metadata.circuitNumQubits ?? '—',
      icon: Atom,
      color: '#ec4899'
    },
  ];

  const countsCount = Object.keys(counts).length;
  const probCount = Object.keys(probabilities).length;

  return (
    <div className="qlive-job-details-root qlive-fade-in">
      {/* 1. Hero Card - Header & Stat Highlights */}
      <div className="qlive-hero-card">
        <div className="qlive-hero-header-row">
          <div className="qlive-hero-status-group">
            <span
              className="qlive-status-badge"
              style={{
                backgroundColor: statusConfig.bg,
                borderColor: statusConfig.border,
                color: statusConfig.color,
              }}
            >
              <StatusIcon size={14} className={status === 'running' ? 'qlive-spin-icon' : ''} />
              {statusConfig.label}
            </span>

            <div className="qlive-job-id-box">
              <span className="qlive-job-id-text" title={selectedJobId}>
                {selectedJobId}
              </span>
              <button
                type="button"
                className="qlive-copy-btn"
                onClick={handleCopyJobId}
                title="Copy full Job ID"
              >
                {copiedJobId ? <Check size={14} style={{ color: '#10b981' }} /> : <Copy size={14} />}
                <span>{copiedJobId ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {onClose && (
            <button
              type="button"
              className="qlive-close-btn"
              onClick={onClose}
              title="Close details"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* 6 Quick Stat Cards */}
        <div className="qlive-hero-stats-grid">
          {quickStats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="qlive-stat-card">
              <div className="qlive-stat-card-top">
                <span className="qlive-stat-card-label">{label}</span>
                <div
                  className="qlive-stat-icon-wrapper"
                  style={{
                    backgroundColor: `${color}16`,
                    color: color,
                    borderColor: `${color}30`,
                  }}
                >
                  <Icon size={15} />
                </div>
              </div>
              <div className="qlive-stat-card-value">
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. Middle Row: Analytics Grid (Measurement Counts & Probability Distribution) */}
      <div className="qlive-grid qlive-grid-2" style={{ marginBottom: 24 }}>
        {/* Measurement Counts */}
        <div className="qlive-panel-card">
          <div className="qlive-panel-header">
            <div className="qlive-panel-title-row">
              <div className="qlive-panel-icon-badge" style={{ color: '#38bdf8' }}>
                <BarChart3 size={18} />
              </div>
              <div>
                <h3 className="qlive-panel-title">Measurement Counts</h3>
                <p className="qlive-panel-desc">Observed computational basis states</p>
              </div>
            </div>
            <span className="qlive-panel-count-pill">
              {countsCount} {countsCount === 1 ? 'outcome' : 'outcomes'}
            </span>
          </div>

          <div className="qlive-panel-body">
            <MeasurementChart 
              data={counts} 
              totalShots={totalShots}
              showProbabilities={false}
            />
          </div>
        </div>

        {/* Probability Distribution */}
        <div className="qlive-panel-card">
          <div className="qlive-panel-header">
            <div className="qlive-panel-title-row">
              <div className="qlive-panel-icon-badge" style={{ color: '#06b6d4' }}>
                <Activity size={18} />
              </div>
              <div>
                <h3 className="qlive-panel-title">Probability Distribution</h3>
                <p className="qlive-panel-desc">Quantum state amplitudes & likelihood</p>
              </div>
            </div>
            <span className="qlive-panel-count-pill">
              {probCount} {probCount === 1 ? 'state' : 'states'}
            </span>
          </div>

          <div className="qlive-panel-body">
            <ProbabilityDistribution 
              data={probabilities}
            />
          </div>
        </div>
      </div>

      {/* 3. Bottom Row: Execution Timeline & Circuit Insight */}
      <div className="qlive-grid qlive-grid-2">
        {/* Execution Timeline */}
        <div className="qlive-panel-card">
          <div className="qlive-panel-header">
            <div className="qlive-panel-title-row">
              <div className="qlive-panel-icon-badge" style={{ color: '#f59e0b' }}>
                <Clock size={18} />
              </div>
              <div>
                <h3 className="qlive-panel-title">Execution Timeline</h3>
                <p className="qlive-panel-desc">Lifecycle timestamps and hardware latency</p>
              </div>
            </div>
            {durationText !== '—' && (
              <span className="qlive-duration-badge">
                <Hourglass size={12} />
                {durationText}
              </span>
            )}
          </div>

          <div className="qlive-panel-body">
            <div className="qlive-timeline-container">
              {/* Step 1: Submitted */}
              <div className="qlive-timeline-node">
                <div className="qlive-timeline-indicator submitted">
                  <Clock size={14} />
                </div>
                <div className="qlive-timeline-info">
                  <span className="qlive-timeline-step-title">Job Submitted</span>
                  <span className="qlive-timeline-step-time">
                    {formatTimestamp(timeStamps.createdAt || jobDetail?.submitted_at)}
                  </span>
                </div>
              </div>

              {/* Step 2: Processing */}
              <div className="qlive-timeline-node">
                <div className="qlive-timeline-indicator running">
                  <Activity size={14} />
                </div>
                <div className="qlive-timeline-info">
                  <span className="qlive-timeline-step-title">Hardware Execution</span>
                  <span className="qlive-timeline-step-time">
                    Dispatched to {jobDetail?.device_id || 'QPU simulator'}
                  </span>
                </div>
              </div>

              {/* Step 3: Ended */}
              <div className="qlive-timeline-node">
                <div className="qlive-timeline-indicator completed">
                  <CheckCircle2 size={14} />
                </div>
                <div className="qlive-timeline-info">
                  <span className="qlive-timeline-step-title">Execution Finalized</span>
                  <span className="qlive-timeline-step-time">
                    {formatTimestamp(timeStamps.endedAt || jobDetail?.end_at)}
                  </span>
                </div>
              </div>

              {/* Total Duration Row */}
              <div className="qlive-timeline-duration-summary">
                <span className="qlive-dur-label">Elapsed Hardware Duration:</span>
                <span className="qlive-dur-value">{durationText}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Circuit Insight & OpenQASM Code */}
        <div className="qlive-panel-card">
          <div className="qlive-panel-header">
            <div className="qlive-panel-title-row">
              <div className="qlive-panel-icon-badge" style={{ color: '#ec4899' }}>
                <Code size={18} />
              </div>
              <div>
                <h3 className="qlive-panel-title">Circuit Insight</h3>
                <p className="qlive-panel-desc">Gate breakdown and OpenQASM payload</p>
              </div>
            </div>
            <span className="qlive-panel-count-pill">
              OpenQASM 3.0
            </span>
          </div>

          <div className="qlive-panel-body">
            {/* Quick Metrics Bar */}
            <div className="qlive-circuit-meta-row">
              <div className="qlive-circuit-pill">
                <span className="qlive-meta-k">Depth:</span>
                <span className="qlive-meta-v">
                  {metadata.circuitDepth ?? jobDetail?.transpile_stats?.depth_estimate ?? '—'}
                </span>
              </div>
              <div className="qlive-circuit-pill">
                <span className="qlive-meta-k">Qubits:</span>
                <span className="qlive-meta-v">{metadata.circuitNumQubits ?? '—'}</span>
              </div>
              <div className="qlive-circuit-pill">
                <span className="qlive-meta-k">Preflight:</span>
                <span className="qlive-meta-v">
                  {details.preflight === undefined ? '—' : details.preflight ? 'Passed' : 'No'}
                </span>
              </div>
              {jobDetail?.transpile_stats && (
                <div className="qlive-circuit-pill">
                  <span className="qlive-meta-k">Gates:</span>
                  <span className="qlive-meta-v">
                    1q: {jobDetail.transpile_stats.one_qubit_gates ?? 0} · 2q: {jobDetail.transpile_stats.two_qubit_gates ?? 0}
                  </span>
                </div>
              )}
            </div>

            {/* macOS-style Code Window */}
            {metadata.openQasm ? (
              <div className="qlive-code-window">
                <div className="qlive-code-window-header">
                  <div className="qlive-window-dots">
                    <span className="dot red" />
                    <span className="dot yellow" />
                    <span className="dot green" />
                  </div>
                  <span className="qlive-code-filename">payload.qasm</span>
                  <button
                    type="button"
                    className="qlive-code-copy-btn"
                    onClick={handleCopyQasm}
                    title="Copy OpenQASM payload"
                  >
                    {copiedQasm ? <Check size={13} style={{ color: '#10b981' }} /> : <Copy size={13} />}
                    <span>{copiedQasm ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="qlive-code-content">
                  {metadata.openQasm}
                </pre>
              </div>
            ) : (
              <div className="qlive-no-qasm-msg">
                <Terminal size={20} style={{ opacity: 0.5, marginBottom: 6 }} />
                <span>No OpenQASM payload attached to this job</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
