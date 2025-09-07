import React, { useState, useRef } from 'react';
import {
  Box,
  CssBaseline,
  useMediaQuery,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  Divider,
  Tooltip,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import SidebarNav from '../Components/navigation/SidebarNav';
import AdvancedInspectorPanel from '../Components/debugger/AdvancedInspectorPanel';
import Inspector from '../Components/Inspector';
import DashboardContent from './DashboardContent';
import QuantumBotAssistant from '../Components/QuantumBotAssistant';

import { ColorModeContext } from '../theme';
import { useSimulation } from '../context/SimulationContext';

const DRAWER_WIDTH = 250;

/**
 * DashboardLayout
 * - Adds proper result passing to basic Inspector
 * - Lets user choose between Basic (text) Inspector and Advanced (step playback) inside the Inspector view
 * - Keeps prior layout & styling unchanged unless needed
 */
export default function DashboardLayout() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  // Left drawer + view state
  const [mobileOpen, setMobileOpen] = useState(false);
  const [view, setView] = useState('dashboard');

  // Which inspector mode inside the Inspector tab: 'basic' | 'advanced'
  const [inspectorMode, setInspectorMode] = useState('basic');

  // Simulation context
  const { simulationResult } = useSimulation();

  // Refs (kept for potential export usage later)
  const blochSpheresRef = useRef(null);
  const probabilityChartRef = useRef(null);
  const amplitudesTableRef = useRef(null);
  const amplitudeWavesRef = useRef(null);

  const [analysisText, setAnalysisText] = useState('');

  // Toggle drawer
  const handleDrawerToggle = () => setMobileOpen(o => !o);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SidebarNav
        current={view}
        onSelect={(key) => {
          if (key === 'debugger') {
            navigate('/debugger');
            return;
          }
          if (key === 'gamify') {
            navigate('/gamify');
            return;
          }
          if (key === 'inspector') {
            setView('inspector');
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === 'chatbot') {
            navigate('/qtalk');
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          setView(key);
          if (!isMdUp) setMobileOpen(false);
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

  const renderInspectorContent = () => {
    if (!simulationResult) {
      return (
        <Box
          sx={{
            p: 3,
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
            background: theme.palette.mode === 'dark'
              ? 'linear-gradient(150deg,#0e1a24,#102b3b)'
              : 'linear-gradient(120deg,#ffffff,#e5edf3)',
            color: 'text.secondary',
            maxWidth: 760
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
            No Simulation Loaded
          </Typography>
          <Typography variant="body2" sx={{ lineHeight: 1.55 }}>
            Run a circuit on the Dashboard first, then return here to inspect it.
          </Typography>
        </Box>
      );
    }

    if (inspectorMode === 'advanced') {
      return (
        <Box sx={{ width: '100%', maxWidth: 1400 }}>
          <AdvancedInspectorPanel
            qasm={simulationResult.openqasm}
            numQubits={
              simulationResult.num_qubits ||
              simulationResult.numQubits ||
              (simulationResult.bloch_vectors?.length || 0)
            }
          />
        </Box>
      );
    }

    // Basic textual Inspector (now correctly receives result)
    return (
      <Box
        sx={{
          width: '100%',
          maxWidth: 760,
          background: theme.palette.mode === 'dark'
            ? 'rgba(14,28,40,0.55)'
            : 'rgba(255,255,255,0.6)',
          border: '1px solid',
          borderColor: 'divider',
          p: 2.5,
          borderRadius: 3,
          backdropFilter: 'blur(6px)',
        }}
      >
        <Inspector result={simulationResult} />
      </Box>
    );
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="navigation"
      >
        {/* Mobile drawer */}
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

        {/* Desktop permanent drawer */}
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

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="fixed"
          color="transparent"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            backdropFilter: 'blur(10px)',
            background: theme.palette.mode === 'dark'
              ? 'rgba(10,25,35,0.8)'
              : 'rgba(255,255,255,0.75)',
            borderBottom: t => `1px solid ${t.palette.divider}`
          }}
        >
          <Toolbar>
            {!isMdUp && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600 }}>
              {view === 'dashboard' && 'Dashboard'}
              {view === 'inspector' && 'Inspector'}
              {view === 'custom-template' && 'Custom Template'}
            </Typography>

            {/* When on Inspector view & simulation loaded, add a small toggle for modes */}
            {view === 'inspector' && simulationResult && (
              <ToggleButtonGroup
                size="small"
                exclusive
                value={inspectorMode}
                onChange={(_, val) => val && setInspectorMode(val)}
                sx={{ mr: 2 }}
              >
                <ToggleButton value="basic">Basic</ToggleButton>
                <ToggleButton value="advanced">Advanced</ToggleButton>
              </ToggleButtonGroup>
            )}

            {/* Theme toggle */}
            <Tooltip title="Toggle light/dark">
              <IconButton onClick={colorMode.toggleColorMode} color="primary">
                {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>

            {/* Dedicated debugger route button */}
            <Tooltip title={simulationResult ? 'Open Debugger' : 'Run a simulation first'}>
              <span>
                <IconButton
                  onClick={() => simulationResult && navigate('/debugger')}
                  color="primary"
                  disabled={!simulationResult}
                >
                  <OpenInNewIcon />
                </IconButton>
              </span>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Toolbar />

        {/* Inner Page Content */}
        <Box
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 3, md: 4 },
            background:
              theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 25% 20%,#0b2734,#03141d)'
                : 'linear-gradient(180deg,#f0f6fa,#dfe9f1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            overflow: 'auto'
          }}
        >
          {/* DASHBOARD VIEW */}
          {view === 'dashboard' && (
            <DashboardContent
              analysisText={analysisText}
              setAnalysisText={setAnalysisText}
              blochSpheresRef={blochSpheresRef}
              probabilityChartRef={probabilityChartRef}
              amplitudesTableRef={amplitudesTableRef}
              amplitudeWavesRef={amplitudeWavesRef}
            />
          )}

          {/* INSPECTOR VIEW */}
          {view === 'inspector' && (
            <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 3 }}>
              {renderInspectorContent()}
            </Box>
          )}

          {/* CUSTOM TEMPLATE PLACEHOLDER */}
          {view === 'custom-template' && (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <Typography variant="h5" fontWeight={600}>
                Custom Template
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 720, lineHeight: 1.6 }}>
                This space can host reusable circuit templates or a guided wizard. Integrate with the builder for a seamless workflow.
              </Typography>
            </Box>
          )}
        </Box>

        
      </Box>
    </Box>
  );
}