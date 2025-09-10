import React, { useEffect, useState, useRef } from 'react';
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

// Persist across remounts to avoid re-opening modal when returning to dashboard
let lastAutoOpenedResult = null;

export default function DashboardContent({
  analysisText,
  setAnalysisText,
  blochSpheresRef,
  probabilityChartRef,
  amplitudesTableRef,
  amplitudeWavesRef
}) {
  const { simulationResult, updateSimulationResult } = useSimulation();

  // Local loading state for simulate button
  const [loading, setLoading] = useState(false);

  // Modal open state & whether user manually closed it
  const [viewerModalOpen, setViewerModalOpen] = useState(false);
  const [userClosedModal, setUserClosedModal] = useState(false);

  // Track last auto-opened result (survives remount via module variable above)
  const lastAutoOpenedRef = useRef(lastAutoOpenedResult);

  // When a new simulation result arrives -> open fullscreen viewer automatically (only once per new result)
  useEffect(() => {
    if (!simulationResult) return;
    if (simulationResult !== lastAutoOpenedRef.current) {
      setViewerModalOpen(true);
      setUserClosedModal(false);
      lastAutoOpenedRef.current = simulationResult;
      lastAutoOpenedResult = simulationResult; // persist for future remounts
    }
  }, [simulationResult]);

  // Handler passed to Controls (kept for future use if needed)
  const handleResult = (res) => {
    updateSimulationResult(res);
    // modal opening handled by effect above
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4, justifyContent: "space-between" }}>
      {/* Welcome Section */}
      <Paper
        variant="outlined"
        sx={{
          p: 4,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          background: theme =>
            theme.palette.mode === 'dark'
              ? 'linear-gradient(145deg,#0f2531,#0a1923)'
              : 'linear-gradient(145deg,#ffffff,#e9f4fa)'
        }}
      >
        <Typography variant="h5" fontWeight={700}>
          Welcome to Qubit-Tracer
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 760, lineHeight: 1.6 }}>
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

      {/* Main Controls and Visualization Section */}
      <Grid container spacing={3} id="builder-anchor">
        {/* Left: Circuit Controls */}
        <Grid item xs={12} lg={3}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              height: 'fit-content',
              display: 'flex',

              flexDirection: 'column',
              gap: 1
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Circuit Controls
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Select a template or open the custom builder to design your circuit.
            </Typography>

            <Controls
              setLoading={setLoading}
              loading={loading}
            />

            <Paper
              variant="outlined"
              sx={{
                p: 3,
                height: 'fit-content',
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <Typography variant="h6" fontWeight={600} gutterBottom>
                AI Analysis
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Generate insights from the current simulation results.
              </Typography>
              <AnalysisPanel
                simulationResult={simulationResult}
                onAnalysisComplete={setAnalysisText}
              />
            </Paper>
          </Paper>
        </Grid>



        {/* Right: Bloch Sphere Visualization */}
        <Grid item xs={12} lg={6}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              height: 'fit-content',
              display: 'flex',

              flexDirection: 'column',
              gap: 1
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quantum State Visualization
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Interactive Bloch sphere representation of your quantum states.
            </Typography>

            {/* Embedded viewer appears after user closes the full screen modal */}
            {simulationResult && (!viewerModalOpen && userClosedModal) && (
              <Box
                ref={blochSpheresRef}
                sx={{
                  position: 'relative',
                  border: theme => `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  height: { xs: 250, sm: 300, md: 350 },
                  width: '100%',
                  maxWidth: 600,
                  mx: 'auto',
                  overflow: 'hidden',
                  bgcolor: theme => theme.palette.mode === 'dark' ? '#0b1d27' : '#f5f9fc'
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
                    background: 'rgba(0,0,0,0.6)',
                    color: '#fff',
                    '&:hover': { background: 'rgba(0,0,0,0.8)' }
                  }}
                >
                  <ZoomOutMapIcon fontSize="small" />
                </IconButton>

              </Box>
            )}

            {!simulationResult && (
              <Box
                sx={{
                  p: 4,
                  border: theme => `2px dashed ${theme.palette.divider}`,
                  borderRadius: 2,
                  textAlign: 'center',
                  color: 'text.secondary',
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
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    No simulation data
                  </Typography>
                  <Typography variant="caption" color="text.disabled">
                    Run a simulation to visualize Bloch spheres
                  </Typography>
                </Box>
              </Box>
            )}
          </Paper>
        </Grid>



      </Grid>

      {/* Export and Tips Section */}
      <Grid container spacing={3} id="learn-more-anchor">
        <Grid item xs={12} md={5}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Export Report
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flex: 1 }}>
              Download a comprehensive PDF report with<br /> Bloch vectors, probabilities, and analysis.
            </Typography>
            <Box>
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

        <Grid item xs={12} md={7}>
          <Paper
            variant="outlined"
            sx={{
              p: 2.5,
              height: '100%',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Quick Tips
            </Typography>
            <Box sx={{ flex: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7 }}>
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

      {/* Full-Screen Bloch Sphere Modal */}
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