// QMemoPage — new themed page with standard AppBar/Drawer shell
import React from 'react';
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
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';

import SidebarNav from '../Components/navigation/SidebarNav';
import { ColorModeContext, ColorModeProvider } from '../theme';
import QMemoGrid from '../Components/qmemo/QMemoGrid';
import '../Components/qmemo/qmemo.css';

const DRAWER_WIDTH = 250;

function QMemoShell() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => setMobileOpen(o => !o);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SidebarNav
        current={'qmemo'}
        onSelect={(key) => {
          if (key === 'dashboard') { navigate('/'); return; }
          if (key === 'debugger') { navigate('/debugger'); return; }
          if (key === 'inspector') { navigate('/'); return; } // Inspector lives in dashboard
          if (key === 'chatbot') { navigate('/qtalk'); return; }
          if (key === 'gamify') { navigate('/gamify'); return; }
          if (key === 'docs') { navigate('/docs'); return; }
          if (key === 'qmemo') { navigate('/qmemo'); return; }
          if (key === 'custom-template') { navigate('/'); return; }
          navigate('/');
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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <CssBaseline />

      {/* Drawer */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }} aria-label="navigation">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{ display: { xs: 'block', md: 'none' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{ display: { xs: 'none', md: 'block' }, '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' } }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main */}
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${DRAWER_WIDTH}px)` }, display: 'flex', flexDirection: 'column' }}>
        <AppBar
          position="fixed"
          color="transparent"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
            backdropFilter: 'blur(10px)',
            background: (theme) =>
              `var(--qt-appbar-bg, ${theme.palette.mode === 'dark' ? 'rgba(10,25,35,0.8)' : 'rgba(255,255,255,0.75)'})`,
            borderBottom: t => `1px solid ${t.palette.divider}`
          }}
        >
          <Toolbar>
            {!isMdUp && (
              <IconButton color="inherit" edge="start" onClick={handleDrawerToggle} sx={{ mr: 1 }}>
                <MenuIcon />
              </IconButton>
            )}
            <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
              Q‑Memo
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
            px: { xs: 1.5, sm: 2, md: 3 },
            py: { xs: 2, md: 3 },
            background: (theme) =>
              `var(--qt-page-bg, ${theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 25% 20%,#0b2734,#03141d)'
                : 'linear-gradient(180deg,#f0f6fa,#dfe9f1)'})`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto'
          }}
        >
          <div className="qmemo-root">
            <div className="qmemo-hero">
              <h1>Q‑Memo: Visual Quantum Micro‑Lessons</h1>
              <p>Watch short, visual explainers generated from our knowledge base. Search and filter by concept.</p>
            </div>
            <QMemoGrid />
          </div>
        </Box>
      </Box>
    </Box>
  );
}

export default function QMemoPage() {
  return (
    <ColorModeProvider>
      <QMemoShell />
    </ColorModeProvider>
  );
}