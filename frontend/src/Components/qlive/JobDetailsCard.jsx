import React, { useMemo } from 'react';
import MeasurementChart from './MeasurementChart';
import ProbabilityDistribution from './ProbabilityDistribution';
import './qlive.css';

/**
 * Job Details Card - Enhanced analytics view for completed QLive jobs
 */
export default function JobDetailsCard({ jobDetail, selectedJobId }) {
  const result = jobDetail?.result || {};
  const details = result.details || {};
  const counts = result.measurement_counts || result.counts_raw || {};
  const probabilities = result.measurement_probabilities || {};
  const metadata = details.metadata || {};
  const timeStamps = details.timeStamps || {};

  const totalShots = useMemo(() => {
    const val = Number(details.shots ?? jobDetail?.shots ?? result.data?.shots ?? result.shots ?? 0);
    return isNaN(val) ? 0 : val;
  }, [details, jobDetail, result]);

  const statusClass = useMemo(() => {
    const status = (jobDetail?.status || '').toLowerCase();
    if (status === 'completed') return 'completed';
    if (status === 'running') return 'running';
    if (status === 'queued') return 'queued';
    if (status === 'failed') return 'failed';
    if (status === 'cancelled') return 'cancelled';
    return '';
  }, [jobDetail?.status]);

  const quickStats = [
    { label: 'Device', value: jobDetail?.device_id || jobDetail?.deviceId || '—' },
    { label: 'Shots', value: totalShots > 0 ? totalShots.toLocaleString() : '—' },
    { label: 'Cost', value: details.cost ? `$${Number(details.cost).toFixed(3)}` : '—' },
    { label: 'Experiment', value: details.experimentType || jobDetail?.experiment_type || '—' },
    { label: 'Depth', value: metadata.circuitDepth ?? jobDetail?.transpile_stats?.depth_estimate ?? '—' },
    { label: 'Qubits', value: metadata.circuitNumQubits ?? '—' },
  ];

  const formatTimeValue = (val) => {
    if (!val) return '—';
    if (typeof val === 'string') {
      // Format ISO timestamp
      try {
        const d = new Date(val);
        return d.toLocaleString();
      } catch {
        return val;
      }
    }
    return String(val);
  };

  const timelineItems = [
    { label: 'Submitted', value: timeStamps.createdAt || jobDetail?.submitted_at },
    { label: 'Ended', value: timeStamps.endedAt || jobDetail?.end_at },
    { label: 'Duration', value: timeStamps.executionDuration ?? jobDetail?.run_duration ?? 
      jobDetail?.time_stamps?.execution_duration_ms ? `${jobDetail?.time_stamps?.execution_duration_ms}ms` : null },
  ];

  const countsCount = Object.keys(counts).length;
  const probCount = Object.keys(probabilities).length;

  return (
    <div className="qlive-fade-in">
      {/* Hero Card - Job Summary */}
      <div className="qlive-hero-card">
        <div className="qlive-hero-title">
          <span className={`qlive-status-badge ${statusClass}`}>
            {statusClass === 'running' && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="12" r="10" opacity="0.3"/>
                <circle cx="12" cy="12" r="4"/>
              </svg>
            )}
            {(jobDetail?.status || 'Unknown').toUpperCase()}
          </span>
          <span style={{ flex: 1, fontSize: 14, fontWeight: 500, opacity: 0.7, fontFamily: 'monospace' }}>
            {selectedJobId}
          </span>
        </div>
        <div className="qlive-hero-grid">
          {quickStats.map(({ label, value }) => (
            <div key={label} className="qlive-stat-item">
              <span className="qlive-stat-label">{label}</span>
              <span className={`qlive-stat-value ${label === 'Cost' && value !== '—' ? 'accent' : ''}`}>
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="qlive-grid qlive-grid-2" style={{ marginBottom: 20 }}>
        {/* Measurement Counts Chart */}
        <div className="qlive-chart-card">
          <div className="qlive-chart-title">
            <span>Measurement Counts</span>
            <span className="qlive-chart-subtitle">
              {countsCount} outcome{countsCount !== 1 ? 's' : ''}
            </span>
          </div>
          <MeasurementChart 
            data={counts} 
            totalShots={totalShots}
            showProbabilities={false}
          />
        </div>

        {/* Probability Distribution */}
        <div className="qlive-chart-card">
          <div className="qlive-chart-title">
            <span>Probability Distribution</span>
            <span className="qlive-chart-subtitle">
              {probCount} state{probCount !== 1 ? 's' : ''}
            </span>
          </div>
          <ProbabilityDistribution 
            data={probabilities}
          />
        </div>
      </div>

      {/* Info Row: Timeline + Circuit */}
      <div className="qlive-grid qlive-grid-2">
        {/* Timeline */}
        <div className="qlive-chart-card">
          <div className="qlive-chart-title">Timeline</div>
          <div className="qlive-timeline">
            {timelineItems.map(({ label, value }) => (
              <div key={label} className="qlive-timeline-item">
                <div className="qlive-timeline-dot" />
                <div className="qlive-timeline-content">
                  <div className="qlive-timeline-label">{label}</div>
                  <div className="qlive-timeline-value">{formatTimeValue(value)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Circuit Insight */}
        <div className="qlive-chart-card">
          <div className="qlive-chart-title">Circuit Insight</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div className="qlive-insight-row">
              <span className="qlive-insight-label">Depth</span>
              <span className="qlive-insight-value">
                {metadata.circuitDepth ?? jobDetail?.transpile_stats?.depth_estimate ?? '—'}
              </span>
            </div>
            <div className="qlive-insight-row">
              <span className="qlive-insight-label">Qubits</span>
              <span className="qlive-insight-value">{metadata.circuitNumQubits ?? '—'}</span>
            </div>
            <div className="qlive-insight-row">
              <span className="qlive-insight-label">Preflight</span>
              <span className="qlive-insight-value">
                {details.preflight === undefined ? '—' : details.preflight ? 'Yes' : 'No'}
              </span>
            </div>
            {jobDetail?.transpile_stats && (
              <div className="qlive-insight-row">
                <span className="qlive-insight-label">Transpile Gates</span>
                <span className="qlive-insight-value">
                  1q: {jobDetail.transpile_stats.one_qubit_gates ?? '—'} · 2q: {jobDetail.transpile_stats.two_qubit_gates ?? '—'}
                </span>
              </div>
            )}
          </div>
          {metadata.openQasm && (
            <pre className="qlive-code-block" style={{ marginTop: 12 }}>
              {metadata.openQasm}
            </pre>
          )}
        </div>
      </div>
    </div>
  );
}
