import React from 'react';
import {
  Box,
  Paper,
  Typography,
  Chip,
  Alert,
  AlertTitle,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  LinearProgress,
  Stack,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon,
  BugReport as BugReportIcon,
  Speed as SpeedIcon,
  Code as CodeIcon,
  Lightbulb as LightbulbIcon,
  ArrowForward as ArrowForwardIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';

/**
 * DebugPanel - Advanced debugging interface for AlgoHub
 * Displays error analysis, code quality issues, circuit profiling, and optimization suggestions
 */
export default function DebugPanel({
  errorAnalysis,
  codeIssues,
  circuitProfile,
  onApplyFix,
}) {
  const [copiedSuggestion, setCopiedSuggestion] = React.useState(null);

  const handleCopyFix = (fix, index) => {
    navigator.clipboard.writeText(fix);
    setCopiedSuggestion(index);
    setTimeout(() => setCopiedSuggestion(null), 2000);
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <ErrorIcon color="error" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'info':
        return <InfoIcon color="info" />;
      default:
        return <InfoIcon color="info" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      case 'info':
        return 'info';
      default:
        return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return '#ff5252';
      case 'medium':
        return '#ffa726';
      case 'low':
        return '#66bb6a';
      default:
        return '#90caf9';
    }
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'low':
        return 'success';
      case 'medium':
        return 'warning';
      case 'high':
        return 'error';
      case 'very high':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Error Analysis Section */}
      {errorAnalysis && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 2,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(239, 83, 80, 0.3)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <BugReportIcon sx={{ color: '#ef5350' }} />
            <Typography variant="h6" sx={{ color: '#ef5350', fontWeight: 600 }}>
              Error Analysis
            </Typography>
          </Stack>

          <Alert severity="error" sx={{ mb: 2 }}>
            <AlertTitle>{errorAnalysis.title || 'Execution Error'}</AlertTitle>
            {errorAnalysis.suggestion || errorAnalysis.description}
          </Alert>

          {errorAnalysis.line_number && (
            <Chip
              icon={<CodeIcon />}
              label={`Line ${errorAnalysis.line_number}`}
              color="error"
              size="small"
              sx={{ mb: 2 }}
            />
          )}

          {errorAnalysis.example && (
            <Accordion sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <LightbulbIcon sx={{ color: '#ffa726' }} />
                  <Typography>Example</Typography>
                </Stack>
              </AccordionSummary>
              <AccordionDetails>
                <Paper
                  sx={{
                    p: 2,
                    bgcolor: 'rgba(0, 0, 0, 0.3)',
                    fontFamily: 'monospace',
                    fontSize: '0.85rem',
                  }}
                >
                  {errorAnalysis.example}
                </Paper>
              </AccordionDetails>
            </Accordion>
          )}

          {errorAnalysis.fix_hint && (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                <ArrowForwardIcon sx={{ color: '#66bb6a' }} />
                <Typography variant="body2" sx={{ color: '#66bb6a', fontWeight: 600 }}>
                  How to Fix:
                </Typography>
              </Stack>
              <Paper
                sx={{
                  p: 2,
                  bgcolor: 'rgba(102, 187, 106, 0.1)',
                  border: '1px solid rgba(102, 187, 106, 0.3)',
                }}
              >
                <Typography variant="body2">{errorAnalysis.fix_hint}</Typography>
              </Paper>
            </Box>
          )}

          {errorAnalysis.suggested_fix && (
            <Box sx={{ mt: 2 }}>
              <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                <Typography variant="body2" sx={{ color: '#90caf9', fontWeight: 600 }}>
                  Suggested Fix:
                </Typography>
                <Tooltip title={copiedSuggestion === 0 ? 'Copied!' : 'Copy to clipboard'}>
                  <IconButton
                    size="small"
                    onClick={() => handleCopyFix(errorAnalysis.suggested_fix, 0)}
                    sx={{ color: '#90caf9' }}
                  >
                    <ContentCopyIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Paper
                sx={{
                  p: 2,
                  mt: 1,
                  bgcolor: 'rgba(0, 0, 0, 0.3)',
                  fontFamily: 'monospace',
                  fontSize: '0.85rem',
                }}
              >
                {errorAnalysis.suggested_fix}
              </Paper>
            </Box>
          )}
        </Paper>
      )}

      {/* Code Quality Issues */}
      {codeIssues && codeIssues.length > 0 && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 2,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(255, 167, 38, 0.3)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <WarningIcon sx={{ color: '#ffa726' }} />
            <Typography variant="h6" sx={{ color: '#ffa726', fontWeight: 600 }}>
              Code Quality Checks
            </Typography>
            <Chip label={codeIssues.length} size="small" color="warning" />
          </Stack>

          <List>
            {codeIssues.map((issue, index) => (
              <React.Fragment key={index}>
                <ListItem alignItems="flex-start">
                  <ListItemIcon>{getSeverityIcon(issue.severity)}</ListItemIcon>
                  <ListItemText
                    primary={
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Typography variant="body2" fontWeight={600}>
                          {issue.issue}
                        </Typography>
                        <Chip
                          label={issue.severity}
                          size="small"
                          color={getSeverityColor(issue.severity)}
                          sx={{ height: 20 }}
                        />
                      </Stack>
                    }
                    secondary={
                      <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                        {issue.suggestion}
                      </Typography>
                    }
                  />
                </ListItem>
                {index < codeIssues.length - 1 && <Divider variant="inset" component="li" />}
              </React.Fragment>
            ))}
          </List>
        </Paper>
      )}

      {/* Circuit Profiling */}
      {circuitProfile && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            mb: 2,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(144, 202, 249, 0.3)',
          }}
        >
          <Stack direction="row" spacing={1} alignItems="center" mb={2}>
            <SpeedIcon sx={{ color: '#90caf9' }} />
            <Typography variant="h6" sx={{ color: '#90caf9', fontWeight: 600 }}>
              Circuit Performance Profile
            </Typography>
          </Stack>

          {/* Basic Stats */}
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, color: 'text.secondary' }}>
              Circuit Statistics
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" gap={1}>
              <Chip
                label={`${circuitProfile.basic_stats.num_qubits} Qubits`}
                size="small"
                sx={{ bgcolor: 'rgba(144, 202, 249, 0.2)' }}
              />
              <Chip
                label={`Depth: ${circuitProfile.basic_stats.depth}`}
                size="small"
                sx={{ bgcolor: 'rgba(144, 202, 249, 0.2)' }}
              />
              <Chip
                label={`${circuitProfile.basic_stats.size} Gates`}
                size="small"
                sx={{ bgcolor: 'rgba(144, 202, 249, 0.2)' }}
              />
              <Chip
                label={`${circuitProfile.basic_stats.num_nonlocal_gates} Two-Qubit Gates`}
                size="small"
                sx={{ bgcolor: 'rgba(144, 202, 249, 0.2)' }}
              />
              <Chip
                label={`Complexity: ${circuitProfile.complexity_score}`}
                size="small"
                color={getComplexityColor(circuitProfile.complexity_score)}
              />
              <Chip
                label={`Est. Runtime: ${circuitProfile.estimated_runtime}`}
                size="small"
                sx={{ bgcolor: 'rgba(102, 187, 106, 0.2)' }}
              />
            </Stack>
          </Box>

          {/* Gate Breakdown */}
          {Object.keys(circuitProfile.gate_breakdown).length > 0 && (
            <Accordion sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', mb: 1 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Gate Breakdown</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <List dense>
                  {Object.entries(circuitProfile.gate_breakdown).map(([gate, count], index) => (
                    <ListItem key={index}>
                      <ListItemText
                        primary={
                          <Stack direction="row" justifyContent="space-between" alignItems="center">
                            <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                              {gate}
                            </Typography>
                            <Chip label={count} size="small" />
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          )}

          {/* Two-Qubit Gate Analysis */}
          {circuitProfile.two_qubit_gates.count > 0 && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" sx={{ mb: 1, color: 'text.secondary' }}>
                Two-Qubit Gate Usage
              </Typography>
              <LinearProgress
                variant="determinate"
                value={Math.min(circuitProfile.two_qubit_gates.percentage, 100)}
                sx={{
                  height: 8,
                  borderRadius: 1,
                  bgcolor: 'rgba(255, 255, 255, 0.1)',
                  '& .MuiLinearProgress-bar': {
                    bgcolor:
                      circuitProfile.two_qubit_gates.percentage > 50
                        ? '#ef5350'
                        : circuitProfile.two_qubit_gates.percentage > 30
                        ? '#ffa726'
                        : '#66bb6a',
                  },
                }}
              />
              <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {circuitProfile.two_qubit_gates.percentage.toFixed(1)}% of total gates (
                {circuitProfile.two_qubit_gates.count} gates)
              </Typography>
            </Box>
          )}

          {/* Optimization Suggestions */}
          {circuitProfile.optimization_suggestions &&
            circuitProfile.optimization_suggestions.length > 0 && (
              <Box>
                <Typography
                  variant="subtitle2"
                  sx={{ mb: 1, color: '#ffa726', fontWeight: 600 }}
                >
                  Optimization Opportunities
                </Typography>
                <List>
                  {circuitProfile.optimization_suggestions.map((suggestion, index) => (
                    <ListItem
                      key={index}
                      sx={{
                        bgcolor: 'rgba(255, 167, 38, 0.05)',
                        borderLeft: `3px solid ${getPriorityColor(suggestion.priority)}`,
                        mb: 1,
                        borderRadius: 1,
                      }}
                    >
                      <ListItemText
                        primary={
                          <Stack direction="row" spacing={1} alignItems="center">
                            <Chip
                              label={suggestion.priority}
                              size="small"
                              sx={{
                                bgcolor: getPriorityColor(suggestion.priority),
                                color: 'white',
                                height: 20,
                              }}
                            />
                            <Typography variant="body2" fontWeight={600}>
                              {suggestion.issue}
                            </Typography>
                          </Stack>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              💡 {suggestion.suggestion}
                            </Typography>
                            {suggestion.benefit && (
                              <Typography
                                variant="caption"
                                sx={{ color: '#66bb6a', display: 'block', mt: 0.5 }}
                              >
                                ✓ {suggestion.benefit}
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}
        </Paper>
      )}

      {/* Success indicator when no issues */}
      {!errorAnalysis && (!codeIssues || codeIssues.length === 0) && !circuitProfile && (
        <Paper
          elevation={3}
          sx={{
            p: 2,
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
            border: '1px solid rgba(102, 187, 106, 0.3)',
          }}
        >
          <Stack direction="row" spacing={2} alignItems="center">
            <CheckCircleIcon sx={{ color: '#66bb6a', fontSize: 40 }} />
            <Box>
              <Typography variant="h6" sx={{ color: '#66bb6a', fontWeight: 600 }}>
                No Issues Detected
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Your code looks good! Execute to see results and performance analysis.
              </Typography>
            </Box>
          </Stack>
        </Paper>
      )}
    </Box>
  );
}
