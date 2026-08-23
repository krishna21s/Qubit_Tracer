// Only the AppBar and content background lines updated to honor theme variables
import React, { useMemo, useState, useEffect, useCallback } from "react";
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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ColorLensRoundedIcon from "@mui/icons-material/ColorLensRounded";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import SidebarNav from "../navigation/SidebarNav";
import { ColorModeContext, ColorModeProvider } from "../../theme";
import ThemePickerPopup from "../templates/ThemePickerPopup";

import QTalkSidebar from "./QTalkSidebar";
import QTalkChat from "./QTalkChat";
import QTalkExportButton from "./QTalkExportButton";

import "./qtalk.css";

const DRAWER_WIDTH = 250;
const DRAWER_WIDTH_COLLAPSED = 70;

// Keys used for ephemeral (per-tab) session storage
const SESS_KEY = "qtalk_sessions_v1";
const CURR_KEY = "qtalk_current_session";

function QTalkShell() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showToggleButton, setShowToggleButton] = useState(false);
  const [themePickerAnchor, setThemePickerAnchor] = useState(null);
  const [sessions, setSessions] = useState(() => {
    try {
      const raw = sessionStorage.getItem(SESS_KEY);
      if (raw) return JSON.parse(raw);
    } catch {}
    return [];
  });
  const [currentSessionId, setCurrentSessionId] = useState(() => {
    try {
      return sessionStorage.getItem(CURR_KEY) || "";
    } catch {}
    return "";
  });

  const createSessionTemplate = useCallback(() => ({
    id: (typeof crypto !== "undefined" && crypto.randomUUID)
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    title: "New chat",
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }), []);

  // Ensure at least one session exists
  useEffect(() => {
    if (!sessions.length) {
      const first = {
        ...createSessionTemplate(),
        messages: [
          {
            role: "assistant",
            text: "Hello! Ask me about quantum states like $$|\\psi\\rangle = \\cos(\\frac{\\theta}{2})|0\\rangle + e^{i\\phi}\\sin(\\frac{\\theta}{2})|1\\rangle$$.",
          },
        ],
      };
      const arr = [first];
      setSessions(arr);
      setCurrentSessionId(first.id);
      try {
        sessionStorage.setItem(SESS_KEY, JSON.stringify(arr));
        sessionStorage.setItem(CURR_KEY, first.id);
      } catch {}
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Persist on change (per-tab, cleared when tab closes)
  useEffect(() => {
    try {
      sessionStorage.setItem(SESS_KEY, JSON.stringify(sessions));
    } catch {}
  }, [sessions]);
  useEffect(() => {
    try {
      if (currentSessionId) sessionStorage.setItem(CURR_KEY, currentSessionId);
    } catch {}
  }, [currentSessionId]);

  const handleNewSession = useCallback(() => {
    const fresh = createSessionTemplate();
    setSessions((prev) => [fresh, ...prev]);
    setCurrentSessionId(fresh.id);
  }, [createSessionTemplate]);

  const handleSelectSession = useCallback((id) => {
    setCurrentSessionId(id);
  }, []);

  const handleRenameSession = useCallback((id, title) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title, updatedAt: Date.now() } : s))
    );
  }, []);

  const handleDeleteSession = useCallback((id) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (!remaining.length) {
        const fallback = {
          ...createSessionTemplate(),
          messages: [
            {
              role: "assistant",
              text: "Hello! Ask me about quantum states like $$|\\psi\\rangle = \\cos(\\frac{\\theta}{2})|0\\rangle + e^{i\\phi}\\sin(\\frac{\\theta}{2})|1\\rangle$$.",
            },
          ],
        };
        setCurrentSessionId(fallback.id);
        return [fallback];
      }
      if (id === currentSessionId) {
        setCurrentSessionId(remaining[0].id);
      }
      return remaining;
    });
  }, [currentSessionId, createSessionTemplate]);

  const currentSession = useMemo(
    () => sessions.find((s) => s.id === currentSessionId) || sessions[0],
    [sessions, currentSessionId]
  );

  const handleDrawerToggle = () => setMobileOpen((o) => !o);

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "visible"
      }}
      onMouseEnter={() => setShowToggleButton(true)}
      onMouseLeave={() => setShowToggleButton(false)}
    >
      <IconButton
        onClick={() => setSidebarCollapsed((prev) => !prev)}
        sx={{
          position: "absolute",
          top: "50%",
          right: -16,
          transform: "translateY(-50%)",
          width: 32,
          height: 32,
          bgcolor: "var(--qt-accent)",
          color: "#fff",
          border: "2px solid var(--qt-border)",
          zIndex: 1300,
          boxShadow: 2,
          opacity: showToggleButton ? 1 : 0,
          transition: "opacity 0.2s ease-in-out, background-color 0.2s ease-in-out",
          "&:hover": {
            bgcolor: "var(--qt-accent)",
            boxShadow: 3,
            filter: "brightness(1.1)"
          }
        }}
      >
        {sidebarCollapsed ? (
          <ChevronRightIcon fontSize="small" />
        ) : (
          <ChevronLeftIcon fontSize="small" />
        )}
      </IconButton>
      <SidebarNav
        current={"chatbot"}
        collapsed={sidebarCollapsed}
        onSelect={(key) => {
          if (key === "dashboard") {
            navigate("/");
            return;
          }
          if (key === "debugger") {
            navigate("/debugger");
            return;
          }
          if (key === "inspector") {
            navigate("/");
            return;
          }
          if (key === "chatbot") {
            navigate("/qtalk");
            return;
          }
          if (key === "gamify") {
            navigate("/gamify");
            return;
          }
          if (key === "docs") {
            navigate("/docs");
            return;
          }
          if (key === "custom-template") {
            navigate("/");
            return;
          }
          if (key === "gate-lab") {
            navigate("/gate-lab");
            return;
          }
          if (key === "oneq-studio") {
            navigate("/oneq-studio");
            return;
          }
          navigate("/");
          if (!isMdUp) setMobileOpen(false);
        }}
      />
      <Divider sx={{ mt: "auto" }} />
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" color="text.secondary">
          © {new Date().getFullYear()} Qubit-Tracer
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box
      sx={{ display: "flex", height: "100vh" }}
      className="qt-tmpl-dashboard-root"
    >
      <CssBaseline />

      {/* Navigation Drawer */}
      <Box
        component="nav"
        sx={{
          width: { md: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH },
          transition: "width 0.3s ease-in-out",
          flexShrink: { md: 0 }
        }}
        aria-label="navigation"
      >
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop permanent drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
              transition: "width 0.3s ease-in-out",
              boxSizing: "border-box",
              overflowX: "hidden",
              overflowY: "auto",
              "&::-webkit-scrollbar": { display: "none" },
              scrollbarWidth: "none",
              msOverflowStyle: "none"
            },
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
          width: { md: `calc(100% - ${sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px)` },
          transition: "width 0.3s ease-in-out",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top App Bar */}
        <AppBar
          position="fixed"
          color="transparent"
          elevation={0}
          sx={{
            width: {
              xs: "100%",
              md: `calc(100% - ${sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px)`
            },
            left: {
              xs: 0,
              md: `${sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px`
            },
            transition: "left 0.3s ease-in-out, width 0.3s ease-in-out",
            backdropFilter: "blur(10px)",
            background: (theme) =>
              `var(--qt-appbar-bg, ${
                theme.palette.mode === "dark"
                  ? "rgba(10,25,35,0.8)"
                  : "rgba(255,255,255,0.75)"
              })`,
            borderBottom: (t) => `1px solid ${t.palette.divider}`,
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

            <Tooltip title="Choose Theme">
              <IconButton
                onClick={(e) => setThemePickerAnchor(e.currentTarget)}
                sx={{
                  color: "var(--qt-accent, #4cc3fa)",
                  transition: "all 0.2s",
                  "&:hover": {
                    background: "rgba(76, 195, 250, 0.1)",
                    transform: "scale(1.05)",
                  },
                }}
              >
                <ColorLensRoundedIcon />
              </IconButton>
            </Tooltip>
            <ThemePickerPopup
              anchorEl={themePickerAnchor}
              open={Boolean(themePickerAnchor)}
              onClose={() => setThemePickerAnchor(null)}
            />
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
              `var(--qt-page-bg, ${
                theme.palette.mode === "dark"
                  ? "radial-gradient(circle at 25% 20%,#0b2734,#03141d)"
                  : "linear-gradient(180deg,#f0f6fa,#dfe9f1)"
              })`,
            display: "flex",
            gap: 2,
            overflow: "hidden",
          }}
        >
          <Box
            className="qtalk-sidebar"
            sx={{
              width: { xs: 0, sm: 260, md: 300 },
              display: { xs: "none", sm: "flex" },
              flexDirection: "column",
              background: "var(--qt-surface-glass)",
              border: "1px solid var(--qt-border)",
              borderRadius: 2,
            }}
          >
            <QTalkSidebar
              sessions={sessions}
              currentSessionId={currentSession?.id || ""}
              onNewSession={handleNewSession}
              onSelectSession={handleSelectSession}
              onRenameSession={handleRenameSession}
              onDeleteSession={handleDeleteSession}
            />
          </Box>

          <Box
            className="qtalk-chat-root"
            sx={{
              flex: 1,
              minWidth: 0,
              display: "flex",
              flexDirection: "column",
              borderRadius: 2,
              border: "1px solid",
              borderColor: "divider",
              background: "var(--qt-surface-glass)",
              border: "1px solid var(--qt-border)",
            }}
          >
            {currentSession && (
              <QTalkChat
                session={currentSession}
                onSessionUpdate={(updated) => {
                  setSessions((prev) =>
                    prev.map((s) =>
                      s.id === updated.id
                        ? { ...updated, updatedAt: Date.now() }
                        : s
                    )
                  );
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
  return <QTalkShell />;
}
