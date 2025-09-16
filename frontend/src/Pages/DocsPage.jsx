// AppBar and content background updated to use theme variables
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
import { useNavigate, useParams } from 'react-router-dom';

import SidebarNav from '../Components/navigation/SidebarNav';
import DocsHome from '../Components/docs/DocsHome';
import DocsViewer from '../Components/docs/DocsViewer';
import { ColorModeContext, ColorModeProvider } from '../theme';

import '../Components/docs/docs.css';

const DRAWER_WIDTH = 250;

function DocsShell() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();
  const { slug } = useParams();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => setMobileOpen(o => !o);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SidebarNav
        current={'docs'}
        onSelect={(key) => {
          if (key === 'dashboard') {
            navigate('/');
            return;
          }
          if (key === 'debugger') {
            navigate('/debugger');
            return;
          }
          if (key === 'inspector') {
            navigate('/');
            return;
          }
          if (key === 'chatbot') {
            navigate('/qtalk');
            return;
          }
          if (key === 'gamify') {
            navigate('/gamify');
            return;
          }
          if (key === 'docs') {
            navigate('/docs');
            return;
          }

          if (key === 'qmemo') {
            navigate('/qmemo');
            return;
          }
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
            backdropFilter: 'blur(10px)',
            background: (theme) =>
              `var(--qt-appbar-bg, ${theme.palette.mode === 'dark'
                ? 'rgba(10,25,35,0.8)'
                : 'rgba(255,255,255,0.75)'
              })`,
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
              Documentation
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
            background: (theme) =>
              `var(--qt-page-bg, ${theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 25% 20%,#0b2734,#03141d)'
                : 'linear-gradient(180deg,#f0f6fa,#dfe9f1)'
              })`,
            display: 'flex',
            flexDirection: 'column',
            gap: 3,
            overflow: 'auto'
          }}
        >
          {!slug && <DocsHome />}
          {slug && <DocsViewer />}
        </Box>
      </Box>
    </Box>
  );
}

export default function DocsPage() {
  return (
    <ColorModeProvider>
      <DocsShell />
    </ColorModeProvider>
  );
}