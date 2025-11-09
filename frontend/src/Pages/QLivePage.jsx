import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AppBar,
  Alert,
  Box,
  Button,
  Chip,
  Card,
  CardContent,
  CardHeader,
  CssBaseline,
  Grid,
  Divider,
  Drawer,
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
  useMediaQuery
} from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import RefreshIcon from '@mui/icons-material/Refresh';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ScienceIcon from '@mui/icons-material/Science';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';

import { useQLive } from '../context/QLiveContext';
import { useSimulation } from '../context/SimulationContext';
import SidebarNav from '../Components/navigation/SidebarNav';
import { ColorModeContext, ColorModeProvider } from '../theme';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

const SAMPLE_QASM = `OPENQASM 2.0;\ninclude "qelib1.inc";\nqreg q[2];\ncreg c[2];\nh q[0];\ncx q[0],q[1];\nmeasure q -> c;`;
const DRAWER_WIDTH = 250;

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

function QLiveMissionControlContent() {
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
            borderRadius: 3,
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

  const summarizeEntries = (data = {}) =>
    Object.entries(data)
      .map(([key, value]) => ({ key, value }))
      .sort((a, b) => Number(b.value) - Number(a.value));

  const formatProbability = (value) => {
    if (value === undefined || value === null || Number.isNaN(Number(value))) {
      return '—';
    }
    const numeric = Number(value);
    return `${(numeric * 100).toFixed(2)}%`;
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
        <Paper sx={{ p: 4, borderRadius: 4, textAlign: 'center' }}>
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
        <Typography variant="h4" sx={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ScienceIcon fontSize="large" /> QLive Mission Control
        </Typography>
        <Stack direction="row" spacing={1}>
          <Tooltip title="Refresh providers">
            <span>
              <IconButton onClick={refreshProviders} disabled={loading}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
          <Tooltip title="Refresh jobs">
            <span>
              <IconButton onClick={() => refreshJobs(selectedProviderId)} disabled={!selectedProviderId}>
                <RefreshIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {loading && <LinearProgress sx={{ mb: 2 }} />}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error.message}</Alert>}

      <Paper sx={{ p: 3, mb: 3, borderRadius: 4 }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
          <FormControl fullWidth>
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
          <FormControl fullWidth>
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
                    <Typography variant="caption" color="text.secondary">
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
          />
        </Stack>
        <TextField
          label="OpenQASM"
          multiline
          minRows={6}
          value={openqasm}
          onChange={(e) => setOpenqasm(e.target.value)}
          sx={{ mt: 2 }}
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

      <Paper sx={{ p: 3, borderRadius: 4, mb: 3 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>Job Queue</Typography>
          <Typography variant="body2" color="text.secondary">
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
                  <Typography variant="body2" color="text.secondary">
                    No jobs submitted yet. Use the form above to create one.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      {selectedJobId && jobDetail && (() => {
        const result = jobDetail.result || {};
        const details = result.details || {};
        const counts = result.measurement_counts || result.counts_raw || {};
        const probabilities = result.measurement_probabilities || {};
        const metadata = details.metadata || {};
        const timeStamps = details.timeStamps || {};
        const quickStats = [
          { label: 'Device', value: jobDetail.device_id || jobDetail.deviceId || '—' },
          { label: 'Shots', value: details.shots ?? jobDetail.shots ?? '—' },
          { label: 'Cost', value: details.cost ? `$${Number(details.cost).toFixed(3)}` : '—' },
          { label: 'Experiment', value: details.experimentType || jobDetail.experiment_type || '—' },
          {
            label: 'Success',
            value:
              result.success === undefined
                ? '—'
                : result.success
                  ? 'Yes'
                  : 'No',
          },
        ];
        const timeEntries = [
          { label: 'Submitted', value: timeStamps.createdAt || jobDetail.submitted_at || '—' },
          { label: 'Ended', value: timeStamps.endedAt || jobDetail.end_at || '—' },
          {
            label: 'Execution duration',
            value:
              timeStamps.executionDuration ?? jobDetail.run_duration ?? jobDetail.time_stamps?.execution_duration_ms ?? '—',
          },
        ];
  const totalShots = Number(details.shots ?? jobDetail.shots ?? result.data?.shots ?? result.shots ?? 0);
  const countsEntries = summarizeEntries(counts);
  const probabilityEntries = summarizeEntries(probabilities);

        return (
          <Paper sx={{ p: 3, borderRadius: 4, background: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.02)', border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" sx={{ mb: 1, fontWeight: 600 }}>
              Job Details · {selectedJobId}
            </Typography>
            <Divider sx={{ mb: 2 }} />
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 4, borderColor: 'divider' }}>
                  <CardHeader
                    title="Status & Progress"
                    titleTypographyProps={{ fontWeight: 600 }}
                    subheader={jobDetail.status || '—'}
                    action={<StatusChip status={jobDetail.status} />}
                    sx={{ pb: 0 }}
                  />
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.2 }}>
                        PROGRESS
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={Math.round((jobDetail.progress || 0) * 100)}
                        sx={{ mt: 0.75, borderRadius: 999, height: 8 }}
                      />
                    </Box>
                    <Stack spacing={1}>
                      {quickStats.map(({ label, value }) => (
                        <Stack key={label} direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                            {label}
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                            {value ?? '—'}
                          </Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 4, borderColor: 'divider' }}>
                  <CardHeader title="Circuit Insight" titleTypographyProps={{ fontWeight: 600 }} sx={{ pb: 0 }} />
                  <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                    <Stack spacing={0.75}>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Depth</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{metadata.circuitDepth ?? jobDetail.transpile_stats?.depth_estimate ?? '—'}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Qubits</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{metadata.circuitNumQubits ?? '—'}</Typography>
                      </Stack>
                      <Stack direction="row" justifyContent="space-between">
                        <Typography variant="body2" color="text.secondary">Preflight</Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {details.preflight === undefined ? '—' : details.preflight ? 'Yes' : 'No'}
                        </Typography>
                      </Stack>
                      {jobDetail.transpile_stats && (
                        <Typography variant="body2" color="text.secondary">
                          Transpile 1q: {jobDetail.transpile_stats.one_qubit_gates ?? '—'} · 2q: {jobDetail.transpile_stats.two_qubit_gates ?? '—'}
                        </Typography>
                      )}
                    </Stack>
                    {metadata.openQasm && (
                      <Box
                        component="pre"
                        sx={{
                          mt: 1,
                          p: 2,
                          bgcolor: 'background.default',
                          borderRadius: 3,
                          maxHeight: 180,
                          overflow: 'auto',
                          fontSize: 12,
                        }}
                      >
                        {metadata.openQasm}
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={4}>
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 4, borderColor: 'divider' }}>
                  <CardHeader title="Timeline" titleTypographyProps={{ fontWeight: 600 }} sx={{ pb: 0 }} />
                  <CardContent>
                    <Stack spacing={1.25}>
                      {timeEntries.map(({ label, value }) => (
                        <Stack key={label} spacing={0.25}>
                          <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 0.3 }}>
                            {label.toUpperCase()}
                          </Typography>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{value || '—'}</Typography>
                        </Stack>
                      ))}
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 4, borderColor: 'divider' }}>
                  <CardHeader title="Measurement Counts" titleTypographyProps={{ fontWeight: 600 }} sx={{ pb: 0 }} />
                  <CardContent sx={{ pt: 2 }}>
                    {countsEntries.length ? (
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell sx={{ fontWeight: 600 }}>Outcome</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Shots</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 600 }}>Share</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {countsEntries.map(({ key, value }) => {
                            const ratio = totalShots ? (Number(value) / totalShots) * 100 : null;
                            const isTop = countsEntries[0]?.key === key;
                            return (
                              <TableRow key={key} hover sx={{ '&:hover td': { bgcolor: 'action.hover' } }}>
                                <TableCell sx={{ fontFamily: 'monospace', fontWeight: isTop ? 600 : 400 }}>{key}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: isTop ? 600 : 400 }}>{value}</TableCell>
                                <TableCell align="right" sx={{ fontWeight: isTop ? 600 : 400 }}>
                                  {ratio === null || Number.isNaN(ratio) ? '—' : `${ratio.toFixed(2)}%`}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    ) : (
                      <Typography variant="body2" color="text.secondary">No measurement data yet.</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12} md={6}>
                <Card variant="outlined" sx={{ height: '100%', borderRadius: 4, borderColor: 'divider' }}>
                  <CardHeader title="Measurement Probabilities" titleTypographyProps={{ fontWeight: 600 }} sx={{ pb: 0 }} />
                  <CardContent sx={{ pt: 2 }}>
                    {probabilityEntries.length ? (
                      <Stack spacing={1.5}>
                        {probabilityEntries.map(({ key, value }) => (
                          <Box key={key}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography variant="body2" sx={{ fontFamily: 'monospace', fontWeight: 500 }}>{key}</Typography>
                              <Typography variant="body2" sx={{ fontWeight: 600 }}>{formatProbability(value)}</Typography>
                            </Stack>
                            <LinearProgress
                              variant="determinate"
                              value={Math.min(100, Math.max(0, Number(value) * 100))}
                              sx={{ mt: 0.5, borderRadius: 999, height: 8 }}
                            />
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">Probabilities unavailable.</Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card variant="outlined" sx={{ borderRadius: 4, borderColor: 'divider' }}>
                  <CardHeader title="Advanced Data" subheader="Inspect raw payloads returned by qBraid" titleTypographyProps={{ fontWeight: 600 }} sx={{ pb: 0 }} />
                  <CardContent>
                    <Accordion elevation={0} sx={{ background: 'transparent', boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 1.5 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Details payload</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {renderResultJson('Details', result.details) || (
                          <Typography variant="body2" color="text.secondary">No detail payload.</Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                    <Accordion elevation={0} sx={{ background: 'transparent', boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 3, mb: 1.5 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Data payload</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {renderResultJson('Data', result.data) || (
                          <Typography variant="body2" color="text.secondary">No data payload.</Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                    <Accordion elevation={0} sx={{ background: 'transparent', boxShadow: 'none', border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Raw result payload</Typography>
                      </AccordionSummary>
                      <AccordionDetails>
                        {renderResultJson('Raw', result.raw) || (
                          <Typography variant="body2" color="text.secondary">No raw payload.</Typography>
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Paper>
        );
      })()}

      {selectedJobId && !jobDetail && (
        <Paper sx={{ p: 3, borderRadius: 4 }}>
          <Typography variant="body2" color="text.secondary">
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

function QLiveShell() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));

  const handleDrawerToggle = () => setMobileOpen((prev) => !prev);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SidebarNav
        current={'qlive'}
        onSelect={(key) => {
          const go = (path) => {
            navigate(path);
            if (!isMdUp) setMobileOpen(false);
          };

          if (key === 'dashboard') { go('/'); return; }
          if (key === 'inspector') { go('/'); return; }
          if (key === 'docs') { go('/docs'); return; }
          if (key === 'qmemo') { go('/qmemo'); return; }
          if (key === 'custom-template') { go('/'); return; }
          if (key === 'chatbot') { go('/qtalk'); return; }
          if (key === 'gamify') { go('/gamify'); return; }
          if (key === 'gate-lab') { go('/gate-lab'); return; }
          if (key === 'oneq-studio') { go('/oneq-studio'); return; }
          if (key === 'qlive') { go('/qlive'); return; }
          go('/');
        }}
      />
      <Divider sx={{ mt: 'auto' }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} Qubit-Tracer
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }} className="qt-tmpl-dashboard-root">
      <CssBaseline />

      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="navigation"
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box'
            }
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box'
            }
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <AppBar
          position="fixed"
          color="transparent"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            backdropFilter: 'blur(12px)',
            background: (t) => `var(--qt-appbar-bg, ${t.palette.mode === 'dark'
              ? 'rgba(10,25,35,0.8)'
              : 'rgba(255,255,255,0.75)'})`,
            borderBottom: (t) => `1px solid ${t.palette.divider}`
          }}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 1, display: { md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              QLive Preview
            </Typography>

            <Tooltip title="Toggle light/dark">
              <IconButton onClick={colorMode.toggleColorMode} color="primary">
                {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Toolbar />

        <Box
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 3, md: 4 },
            background: (t) => `var(--qt-page-bg, ${t.palette.mode === 'dark'
              ? 'radial-gradient(circle at 25% 20%,#0b2734,#03141d)'
              : 'linear-gradient(180deg,#f0f6fa,#dfe9f1)'})`,
            display: 'flex',
            overflow: 'auto'
          }}
        >
          <Box sx={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <QLiveMissionControlContent />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function QLivePage() {
  return (
    <ColorModeProvider>
      <QLiveShell />
    </ColorModeProvider>
  );
}
