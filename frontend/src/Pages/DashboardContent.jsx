import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  Stack,
  Modal,
  IconButton
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap';

import Controls from '../Components/Controls';
import AnalysisPanel from '../Components/AnalysisPanel';
import ExportButton from '../Components/ExportButton';
import CanvasPlaceholder from '../Components/CanvasPlaceholder';
import { useSimulation } from '../context/SimulationContext';

import VisualCircuitRenderer from '../Components/circuit/VisualCircuitRenderer';
import '../Components/circuit/visualCircuit.css';

import '../styles/dashboardCards.css'; // themed panels

export default function DashboardContent({
  analysisText,
  setAnalysisText,
  blochSpheresRef,
  probabilityChartRef,
  amplitudesTableRef,
  amplitudeWavesRef
}) {
  const { simulationResult, updateSimulationResult, shouldAutoOpenViewer, setShouldAutoOpenViewer } = useSimulation();
  const [loading, setLoading] = useState(false);
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [userClosedModal, setUserClosedModal] = useState(false);

  useEffect(() => {
    if (simulationResult && shouldAutoOpenViewer) {
      setViewerModalOpen(true);
      setUserClosedModal(false);
      setShouldAutoOpenViewer(false);
    }
  }, [simulationResult, shouldAutoOpenViewer, setShouldAutoOpenViewer]);

  const handleResult = (res) => {
    updateSimulationResult(res);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: "space-between" }}>
      {/* Hero */}
      <Paper
        variant="outlined"
        className="qt-tmpl-hero"
        sx={{
          p: 4,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            background: 'var(--qt-gradient-main)'
          }}
      >
        <Typography variant="h5" fontWeight={700} sx={{ color: 'var(--qt-text)' }}>
          Welcome to Qubit-Tracer
        </Typography>
        <Typography
          variant="body2"
          sx={{ maxWidth: 760, lineHeight: 1.6, color: 'var(--qt-text-dim)' }}
        >
          This dashboard lets you build, simulate, and inspect quantum circuits visually.
          Use the sidebar at the left to navigate. Start by creating or selecting a circuit,
          then open the Inspector to explore state representations.
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 1 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              const el = document.getElementById('builder-anchor');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Get Started
          </Button>
          <Button
            variant="outlined"
            onClick={() => {
              const el = document.getElementById('learn-more-anchor');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            Learn More
          </Button>
        </Stack>
      </Paper>

      <Grid container spacing={3} id="builder-anchor">
        {/* Circuit Controls */}
        <Grid item xs={12} lg={3}>
          <Paper
            variant="outlined"
            className="qt-tmpl-panel"
            sx={{
              p: 3,
              height: 'fit-content',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'var(--qt-text)' }}>
              Circuit Controls
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'var(--qt-text-dim)' }}>
              Select a template or open the custom builder to design your circuit.
            </Typography>

            <Controls setLoading={setLoading} loading={loading} />

            <Paper
              variant="outlined"
              className="qt-tmpl-panel-alt"
              sx={{
                p: 3,
                height: 'fit-content',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'var(--qt-text)' }}>
                AI Analysis
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, color: 'var(--qt-text-dim)' }}>
                Generate insights from the current simulation results.
              </Typography>
              <AnalysisPanel
                simulationResult={simulationResult}
                onAnalysisComplete={setAnalysisText}
              />
            </Paper>
          </Paper>
        </Grid>

        {/* Bloch Visualization */}
        <Grid item xs={12} lg={6}>
          <Paper
            variant="outlined"
            className="qt-tmpl-panel"
            sx={{
              p: 3,
              height: 'fit-content',
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'var(--qt-text)' }}>
              Quantum State Visualization
            </Typography>
            <Typography variant="body2" sx={{ mb: 2, color: 'var(--qt-text-dim)' }}>
              Interactive Bloch sphere representation of your quantum states.
            </Typography>

            {simulationResult && !viewerModalOpen && (
              <Box
                ref={blochSpheresRef}
                className="qt-tmpl-bloch-embed"
                sx={{
                  position: 'relative',
                  borderRadius: 2,
                  height: { xs: 250, sm: 300, md: 350 },
                  width: '100%',
                  maxWidth: 600,
                  mx: 'auto',
                  overflow: 'hidden'
                }}
              >
                <CanvasPlaceholder result={simulationResult} />
                <IconButton
                  size="small"
                  onClick={() => setViewerModalOpen(true)}
                  title="Full screen viewer"
                  sx={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: 'rgba(0,0,0,0.55)',
                    color: '#fff',
                    '&:hover': { background: 'rgba(0,0,0,0.75)' }
                  }}
                >
                  <ZoomOutMapIcon fontSize="small" />
                </IconButton>
              </Box>
            )}

            {!simulationResult && (
              <Box
                className="qt-tmpl-empty-dashed"
                sx={{
                  p: 4,
                  borderRadius: 2,
                  textAlign: 'center',
                  height: { xs: 250, sm: 300, md: 350 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  maxWidth: 600,
                  mx: 'auto',
                  width: '100%'
                }}
              >
                <Box>
                  <Typography variant="body2" sx={{ mb: 1, color: 'var(--qt-text-dim)' }}>
                    No simulation data
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'var(--qt-text-dim)' }}>
                    Run a simulation to visualize Bloch spheres
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Export + Circuit + Tips */}
      <Grid container spacing={3} id="learn-more-anchor">
        {/* Export Report - Fixed layout */}
        <Grid item xs={12} md={5}>
          <Paper
            variant="outlined"
            className="qt-tmpl-panel"
            sx={{
              p: 2.5,
              height: '100%', 
              display: 'flex',
              flexDirection: 'column',
              minHeight: {xs: 'auto', md: '280px'} /* Ensure consistent height */
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'var(--qt-text)' }}>
              Export Report
            </Typography>
            <Typography
              variant="body2" 
              sx={{ 
                mb: 2, 
                flex: 1, 
                color: 'var(--qt-text-dim)',
                display: 'block'
              }}
            >
              Download a comprehensive PDF report with<br /> Bloch vectors, probabilities, and analysis.
            </Typography>
            <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'flex-start' }}>
              <ExportButton
                simulationResult={simulationResult}
                analysisText={analysisText}
                blochSpheresRef={blochSpheresRef}
                probabilityChartRef={probabilityChartRef}
                amplitudesTableRef={amplitudesTableRef}
                amplitudeWavesRef={amplitudeWavesRef}
              />
            </Box>
          </Paper>
        </Grid>

        {/* Circuit Diagram - Now with consistent height */}
        <Grid item xs={12} md={7}>
          <Box sx={{ 
            height: '100%',
            minHeight: {xs: 'auto', md: '280px'}, 
            display: 'flex'
          }}>
            <VisualCircuitRenderer qasm={simulationResult?.openqasm} />
          </Box>
        </Grid>

        {/* Quick Tips now below */}
        <Grid item xs={12}>
          <Paper
            variant="outlined"
            className="qt-tmpl-panel"
            sx={{
              p: 2.5,
              height: 'fit-content',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom sx={{ color: 'var(--qt-text)' }}>
              Quick Tips
            </Typography>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" sx={{ lineHeight: 1.7, color: 'var(--qt-text-dim)' }}>
                • Use the <strong>Custom Builder</strong> to visually drag & drop quantum gates onto your circuit
                <br />
                • The <strong>Inspector</strong> correlates multiple representations of the same quantum state
                <br />
                • The <strong>Debugger</strong> lets you step through gate evolution and track state changes
                <br />
                • Toggle between <strong>light/dark themes</strong> using the icon in the top navigation bar
                <br />
                • <strong>Export reports</strong> include detailed analysis and can be shared with colleagues
              </Typography>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* Full-Screen Modal */}
      <Modal
        open={viewerModalOpen && !!simulationResult}
        onClose={() => {
          setViewerModalOpen(false);
          setUserClosedModal(true);
        }}
        keepMounted
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 0
        }}
      >
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: '100%',
            bgcolor: theme => theme.palette.mode === 'dark' ? '#031018' : '#f5f9fc',
            outline: 'none'
          }}
        >
          <IconButton
            onClick={() => {
              setViewerModalOpen(false);
              setUserClosedModal(true);
            }}
            sx={{
              position: 'absolute',
              top: 16,
              right: 16,
              zIndex: 1000,
              background: 'rgba(0,0,0,0.7)',
              color: '#fff',
              '&:hover': { background: 'rgba(0,0,0,0.9)' },
              backdropFilter: 'blur(4px)'
            }}
            title="Close"
          >
            <CloseIcon />
          </IconButton>
          <Box
            sx={{
              position: 'absolute',
              inset: 0,
              p: { xs: 1, sm: 2, md: 3 }
            }}
          >
            <Box
              sx={{
                position: 'relative',
                width: '100%',
                height: '100%',
                borderRadius: { xs: 0, sm: 2 },
                overflow: 'hidden',
                border: theme => `1px solid ${theme.palette.divider}`
              }}
            >
              <CanvasPlaceholder result={simulationResult} />
              <Typography
                variant="body2"
                sx={{
                  position: 'absolute',
                  right: 400,
                  bottom: 9,
                  bgcolor: theme => theme.palette.mode === 'dark'
                    ? 'rgba(0,0,0,0.8)'
                    : 'rgba(255,255,255,0.9)',
                  px: 2,
                  py: 1,
                  borderRadius: 1,
                  fontSize: 10,
                  fontWeight: 500,
                  backdropFilter: 'blur(4px)'
                }}
              >
                Quantum State Visualization - Full Screen
              </Typography>
            </Box>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}