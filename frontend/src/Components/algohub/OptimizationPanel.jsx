import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Card,
  CardContent,
  Chip,
  Stack,
  Alert,
  AlertTitle,
  Divider,
  LinearProgress,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Speed as SpeedIcon,
  CompareArrows as CompareArrowsIcon,
  TrendingDown as TrendingDownIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Lightbulb as LightbulbIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
} from '@mui/icons-material';
import VisualCircuitRenderer from '../circuit/VisualCircuitRenderer';

/**
 * OptimizationPanel - Circuit optimization preview and comparison
 * Shows before/after metrics, suggestions, and optimized circuit
 */
export default function OptimizationPanel({ qasm, onOptimize }) {
  const [optimizing, setOptimizing] = useState(false);
  const [optimizationData, setOptimizationData] = useState(null);
  const [showOptimizedCircuit, setShowOptimizedCircuit] = useState(false);
  const [optimizationLevel, setOptimizationLevel] = useState(3);

  const handleOptimize = async (level = 3) => {
    if (!qasm) return;

    setOptimizing(true);
    setOptimizationLevel(level);

    try {
      const response = await fetch('http://127.0.0.1:8000/algohub/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ qasm, optimization_level: level }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setOptimizationData(data);
        if (onOptimize) {
          onOptimize(data);
        }
      } else {
        console.error('[Optimization] Error:', data.error);
      }
    } catch (err) {
      console.error('[Optimization] Request failed:', err);
    } finally {
      setOptimizing(false);
    }
  };

  const getRatingColor = (rating) => {
    switch (rating) {
      case 'excellent':
        return '#66bb6a';
      case 'good':
        return '#90caf9';
      case 'minor':
        return '#ffa726';
      default:
        return '#ef5350';
    }
  };

  const getBenchmarkColor = (rating) => {
    switch (rating) {
      case 'Excellent':
        return 'success';
      case 'Good':
        return 'info';
      case 'Fair':
        return 'warning';
      default:
        return 'error';
    }
  };

  if (!qasm) {
    return (
      <Paper
        elevation={3}
        sx={{
          p: 3,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(144, 202, 249, 0.3)',
          textAlign: 'center',
        }}
      >
        <SpeedIcon sx={{ fontSize: 48, color: '#90caf9', mb: 2 }} />
        <Typography variant="h6" sx={{ color: '#90caf9', mb: 1 }}>
          Circuit Optimization
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Execute your circuit first to analyze optimization opportunities
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      {/* Optimization Control */}
      <Paper
        elevation={3}
        sx={{
          p: 2,
          mb: 2,
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
          border: '1px solid rgba(144, 202, 249, 0.3)',
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center" justifyContent="space-between">
          <Box>
            <Typography variant="h6" sx={{ color: '#90caf9', fontWeight: 600 }}>
              Circuit Optimizer
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Analyze and optimize your quantum circuit using Qiskit transpiler
            </Typography>
          </Box>
          <Stack direction="row" spacing={1}>
            {[1, 2, 3].map((level) => (
              <Tooltip key={level} title={`Optimization Level ${level}`}>
                <Button
                  variant={optimizationLevel === level ? 'contained' : 'outlined'}
                  size="small"
                  onClick={() => handleOptimize(level)}
                  disabled={optimizing}
                  sx={{ minWidth: 60 }}
                >
                  L{level}
                </Button>
              </Tooltip>
            ))}
            <Button
              variant="contained"
              startIcon={optimizing ? <CircularProgress size={16} /> : <SpeedIcon />}
              onClick={() => handleOptimize(optimizationLevel)}
              disabled={optimizing}
              sx={{
                background: 'linear-gradient(45deg, #667eea, #764ba2)',
                '&:hover': { background: 'linear-gradient(45deg, #764ba2, #667eea)' },
              }}
            >
              {optimizing ? 'Optimizing...' : 'Optimize'}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {/* Optimization Results */}
      {optimizationData && (
        <>
          {/* Comparison Summary */}
          <Paper
            elevation={3}
            sx={{
              p: 2,
              mb: 2,
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              border: `2px solid ${getRatingColor(optimizationData.comparison.improvements.rating)}`,
            }}
          >
            <Stack direction="row" spacing={1} alignItems="center" mb={2}>
              <CompareArrowsIcon sx={{ color: getRatingColor(optimizationData.comparison.improvements.rating) }} />
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                Optimization Results
              </Typography>
              <Chip
                label={optimizationData.comparison.improvements.rating.toUpperCase()}
                size="small"
                sx={{
                  bgcolor: getRatingColor(optimizationData.comparison.improvements.rating),
                  color: 'white',
                  fontWeight: 600,
                }}
              />
            </Stack>

            <Alert
              severity={
                optimizationData.comparison.improvements.rating === 'excellent'
                  ? 'success'
                  : optimizationData.comparison.improvements.rating === 'good'
                  ? 'info'
                  : 'warning'
              }
              sx={{ mb: 2 }}
            >
              <AlertTitle>Summary</AlertTitle>
              {optimizationData.comparison.improvements.summary}
            </Alert>

            <Grid container spacing={2}>
              {/* Original Stats */}
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#ffa726' }}>
                      Original Circuit
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Depth:</Typography>
                        <Chip label={optimizationData.comparison.original.depth} size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Gates:</Typography>
                        <Chip label={optimizationData.comparison.original.size} size="small" />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Two-Qubit Gates:</Typography>
                        <Chip label={optimizationData.comparison.original.two_qubit_gates} size="small" />
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>

              {/* Optimized Stats */}
              <Grid item xs={12} md={6}>
                <Card sx={{ bgcolor: 'rgba(102, 187, 106, 0.1)', border: '1px solid rgba(102, 187, 106, 0.3)' }}>
                  <CardContent>
                    <Typography variant="subtitle2" sx={{ mb: 2, color: '#66bb6a' }}>
                      Optimized Circuit
                    </Typography>
                    <Stack spacing={1}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Depth:</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={optimizationData.comparison.optimized.depth} size="small" color="success" />
                          {optimizationData.comparison.improvements.depth_reduction > 0 && (
                            <Chip
                              icon={<TrendingDownIcon />}
                              label={`-${optimizationData.comparison.improvements.depth_reduction_pct.toFixed(1)}%`}
                              size="small"
                              sx={{ bgcolor: '#66bb6a', color: 'white' }}
                            />
                          )}
                        </Stack>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Gates:</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={optimizationData.comparison.optimized.size} size="small" color="success" />
                          {optimizationData.comparison.improvements.size_reduction > 0 && (
                            <Chip
                              icon={<TrendingDownIcon />}
                              label={`-${optimizationData.comparison.improvements.size_reduction_pct.toFixed(1)}%`}
                              size="small"
                              sx={{ bgcolor: '#66bb6a', color: 'white' }}
                            />
                          )}
                        </Stack>
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography variant="body2">Two-Qubit Gates:</Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip label={optimizationData.comparison.optimized.two_qubit_gates} size="small" color="success" />
                          {optimizationData.comparison.improvements.two_qubit_reduction > 0 && (
                            <Chip
                              icon={<TrendingDownIcon />}
                              label={`-${optimizationData.comparison.improvements.two_qubit_reduction_pct.toFixed(1)}%`}
                              size="small"
                              sx={{ bgcolor: '#66bb6a', color: 'white' }}
                            />
                          )}
                        </Stack>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Circuit Comparison View */}
            {optimizationData.optimized_qasm && (
              <Box sx={{ mt: 2 }}>
                <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between" mb={1}>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Optimized Circuit Diagram
                  </Typography>
                  <IconButton
                    size="small"
                    onClick={() => setShowOptimizedCircuit(!showOptimizedCircuit)}
                    sx={{ color: '#90caf9' }}
                  >
                    {showOptimizedCircuit ? <VisibilityOffIcon /> : <VisibilityIcon />}
                  </IconButton>
                </Stack>
                {showOptimizedCircuit && (
                  <Paper sx={{ p: 2, bgcolor: 'var(--qt-bg-main, var(--qt-surface))', border: '1px solid var(--qt-border)' }}>
                    <VisualCircuitRenderer qasm={optimizationData.optimized_qasm} />
                  </Paper>
                )}
              </Box>
            )}
          </Paper>

          {/* Benchmark Scores */}
          {optimizationData.benchmark && (
            <Paper
              elevation={3}
              sx={{
                p: 2,
                mb: 2,
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '1px solid rgba(102, 187, 106, 0.3)',
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Performance Benchmark
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: 'rgba(144, 202, 249, 0.1)' }}>
                    <CardContent sx={{ textAlign: 'center' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Overall Score
                      </Typography>
                      <Typography variant="h3" sx={{ color: '#90caf9', fontWeight: 700, my: 1 }}>
                        {optimizationData.benchmark.scores.overall}
                      </Typography>
                      <Chip
                        label={optimizationData.benchmark.rating}
                        size="small"
                        color={getBenchmarkColor(optimizationData.benchmark.rating)}
                      />
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                    <CardContent>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                        Depth Efficiency
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={optimizationData.benchmark.scores.depth_efficiency}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          mb: 1,
                          '& .MuiLinearProgress-bar': { bgcolor: '#90caf9' },
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {optimizationData.benchmark.scores.depth_efficiency.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Card sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)' }}>
                    <CardContent>
                      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                        Gate Efficiency
                      </Typography>
                      <LinearProgress
                        variant="determinate"
                        value={optimizationData.benchmark.scores.gate_efficiency}
                        sx={{
                          height: 8,
                          borderRadius: 1,
                          mb: 1,
                          '& .MuiLinearProgress-bar': { bgcolor: '#66bb6a' },
                        }}
                      />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {optimizationData.benchmark.scores.gate_efficiency.toFixed(1)}%
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
              {optimizationData.benchmark.recommendations.length > 0 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  <AlertTitle>Recommendations</AlertTitle>
                  <List dense>
                    {optimizationData.benchmark.recommendations.map((rec, idx) => (
                      <ListItem key={idx}>
                        <ListItemText primary={`• ${rec}`} />
                      </ListItem>
                    ))}
                  </List>
                </Alert>
              )}
            </Paper>
          )}

          {/* Optimization Suggestions */}
          {optimizationData.suggestions && optimizationData.suggestions.length > 0 && (
            <Paper
              elevation={3}
              sx={{
                p: 2,
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
                border: '1px solid rgba(255, 167, 38, 0.3)',
              }}
            >
              <Stack direction="row" spacing={1} alignItems="center" mb={2}>
                <LightbulbIcon sx={{ color: '#ffa726' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Optimization Opportunities
                </Typography>
              </Stack>
              <Stack spacing={1}>
                {optimizationData.suggestions.map((suggestion, idx) => (
                  <Accordion key={idx} sx={{ bgcolor: 'rgba(255, 167, 38, 0.05)' }}>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Stack direction="row" spacing={1} alignItems="center" flex={1}>
                        <Chip
                          label={suggestion.priority}
                          size="small"
                          color={suggestion.priority === 'high' ? 'error' : suggestion.priority === 'medium' ? 'warning' : 'info'}
                          sx={{ height: 20 }}
                        />
                        <Typography variant="body2" fontWeight={600}>
                          {suggestion.issue}
                        </Typography>
                      </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body2" paragraph sx={{ color: 'text.secondary' }}>
                        💡 {suggestion.suggestion}
                      </Typography>
                      <Chip
                        label={`Potential Savings: ${suggestion.potential_savings}`}
                        size="small"
                        sx={{ bgcolor: '#66bb6a', color: 'white' }}
                      />
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Stack>
            </Paper>
          )}
        </>
      )}
    </Box>
  );
}
