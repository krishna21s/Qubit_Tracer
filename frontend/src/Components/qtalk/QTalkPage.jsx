// Only the AppBar and content background lines updated to honor theme variables
import React, { useMemo, useState, useEffect } from 'react';
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

import SidebarNav from '../navigation/SidebarNav';
import { ColorModeContext, ColorModeProvider } from '../../theme';

import QTalkSidebar from './QTalkSidebar';
import QTalkChat from './QTalkChat';
import QTalkExportButton from './QTalkExportButton';

import './qtalk.css';

const DRAWER_WIDTH = 250;

// Keys used for ephemeral (per-tab) session storage
const SESS_KEY = 'qtalk_sessions_v1';
const CURR_KEY = 'qtalk_current_session';

function QTalkShell() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const isMdUp = useMediaQuery(theme.breakpoints.up('md'));
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sessions, setSessions] = useState(() => {
    try {
      const raw = sessionStorage.getItem(SESS_KEY);
      if (raw) return JSON.parse(raw);
    } catch { }
    return [];
  });
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    try {
      return sessionStorage.getItem(CURR_KEY) || '';
    } catch { }
    return '';
  });

  // Ensure at least one session exists
  useEffect(() => {
    if (!sessions.length) {
      const first = {
        id: crypto.randomUUID(),
        title: 'New chat',
        messages: [
          { role: 'assistant', text: 'Hello! Ask me about quantum states like $$|\\psi\\rangle = \\cos(\\frac{\\theta}{2})|0\\rangle + e^{i\\phi}\\sin(\\frac{\\theta}{2})|1\\rangle$$.' }
        ],
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
      const arr = [first];
      setSessions(arr);
      setCurrentSessionId(first.id);
      try {
        sessionStorage.setItem(SESS_KEY, JSON.stringify(arr));
        sessionStorage.setItem(CURR_KEY, first.id);
      } catch { }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change (per-tab, cleared when tab closes)
  useEffect(() => {
    try {
      sessionStorage.setItem(SESS_KEY, JSON.stringify(sessions));
    } catch { }
  }, [sessions]);
  useEffect(() => {
    try {
      if (currentSessionId) sessionStorage.setItem(CURR_KEY, currentSessionId);
    } catch { }
  }, [currentSessionId]);

  const currentSession = useMemo(
    () => sessions.find(s => s.id === currentSessionId) || sessions[0],
    [sessions, currentSessionId]
  );

  const handleDrawerToggle = () => setMobileOpen(o => !o);

  const drawer = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <SidebarNav
        current={'chatbot'}
        onSelect={(key) => {
          // Keep navigation behavior consistent with the rest of the app
          if (key === 'dashboard') { navigate('/'); return; }
          if (key === 'debugger') { navigate('/debugger'); return; }
          if (key === 'inspector') { navigate('/'); return; }           // inspector lives in dashboard
          if (key === 'chatbot') { navigate('/qtalk'); return; }      // this page
          if (key === 'gamify') { navigate('/gamify'); return; }     // FIX: handle gamify directly
          if (key === 'docs') { navigate('/docs'); return; }       // parity with other pages
          if (key === 'custom-template') { navigate('/'); return; }     // or keep dashboard
          navigate('/'); // fallback
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
    <Box sx={{ display: 'flex', height: '100vh' }} className="qt-tmpl-dashboard-root">
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
              QTalk
            </Typography>

            {/* Theme toggle */}
            <Tooltip title="Toggle light/dark">
              <IconButton onClick={colorMode.toggleColorMode} color="primary">
                {theme.palette.mode === 'dark' ? <LightModeIcon /> : <DarkModeIcon />}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Toolbar />

        {/* Two-column QTalk layout */}
        <Box
          sx={{
            flex: 1,
            px: { xs: 1.5, sm: 2, md: 3 },
            py: { xs: 2, md: 3 },
            background: (theme) =>
              `var(--qt-page-bg, ${theme.palette.mode === 'dark'
                ? 'radial-gradient(circle at 25% 20%,#0b2734,#03141d)'
                : 'linear-gradient(180deg,#f0f6fa,#dfe9f1)'
              })`,
            display: 'flex',
            gap: 2,
            overflow: 'hidden'
          }}
        >
          <Box
            className="qtalk-sidebar"
            sx={{
              width: { xs: 0, sm: 260, md: 300 },
              display: { xs: 'none', sm: 'flex' },
              flexDirection: 'column',
              background: theme.palette.mode === 'dark'
                ? 'rgba(14,28,40,0.55)'
                : 'rgba(255,255,255,0.6)',
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 2
            }}
          >
            <QTalkSidebar
              sessions={sessions}
              currentSessionId={currentSession?.id}
              onNewSession={() => {
                const s = {
                  id: crypto.randomUUID(),
                  title: 'New chat',
                  messages: [
                    { role: 'assistant', text: 'New chat started. Ask away!' }
                  ],
                  createdAt: Date.now(),
                  updatedAt: Date.now()
                };
                setSessions(prev => [s, ...prev]);
                setCurrentSessionId(s.id);
              }}
              onSelectSession={(id) => setCurrentSessionId(id)}
              onRenameSession={(id, title) => {
                setSessions(prev => prev.map(s => s.id === id ? { ...s, title, updatedAt: Date.now() } : s));
              }}
              onDeleteSession={(id) => {
                setSessions(prev => prev.filter(s => s.id !== id));
                if (currentSessionId === id) {
                  const next = sessions.find(s => s.id !== id);
                  setCurrentSessionId(next ? next.id : '');
                }
              }}
            />
          </Box>

          <Box
            className="qtalk-chat-root"
            sx={{
              flex: 1,
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              background: theme.palette.mode === 'dark'
                ? 'rgba(10,20,30,0.55)'
                : 'rgba(255,255,255,0.7)'
            }}
          >
            {currentSession && (
              <QTalkChat
                session={currentSession}
                onSessionUpdate={(updated) => {
                  setSessions(prev => prev.map(s => s.id === updated.id ? { ...updated, updatedAt: Date.now() } : s));
                }}
                headerRight={<QTalkExportButton session={currentSession} />}
              />
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function QTalkPage() {
  // Wrap with ColorModeProvider to get the same theme toggling as dashboard
  return (
    <ColorModeProvider>
      <QTalkShell />
    </ColorModeProvider>
  );
}