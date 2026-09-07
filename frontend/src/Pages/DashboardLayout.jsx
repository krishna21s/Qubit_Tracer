// DashboardLayout (Template Themed + Custom Template view intact)
// - Keeps template-driven theming (qt-tmpl- classes)
// - Restores / Ensures Custom Template view renders <TemplateGallery />
// - Adds scoped button theming import (if you already added elsewhere, harmless duplicate import)
// - No logic / state changes to simulation, inspector, routing.
// - All styling relies on CSS variables defined by the active template.
// NOTE: Requires:
//   * TemplateProvider wrapping app
//   * themeTemplates.js with extended vars
//   * styles: dashboardTheme.css, dashboardButtons.css

import React, { useState, useRef, useEffect } from "react";
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
  ToggleButtonGroup,
  Paper,
  Avatar,
  Menu,
  MenuItem
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ColorLensRoundedIcon from "@mui/icons-material/ColorLensRounded";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { SidebarLeft } from 'reicon-react';

import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";

import SidebarNav from "../Components/navigation/SidebarNav";
import AdvancedInspectorPanel from "../Components/debugger/AdvancedInspectorPanel";
import Inspector from "../Components/Inspector";
import DashboardContent from "./DashboardContent";

import { useSimulation } from "../context/SimulationContext";
import { useTemplate } from "../context/TemplateContext";
import { useAuth } from "../context/AuthContext";
import ThemePickerPopup from "../Components/templates/ThemePickerPopup";
import AlgoHubContent from "../Components/algohub/AlgoHubContent";
import QCircuitStudioContent from "./QCircuitStudioPage";
import UserProfile from "./UserProfile";
import TemplateGallery from "../Components/templates/TemplateGallery";

// Scoped styles
import "../styles/dashboardTheme.css";
import "../styles/dashboardButtons.css";

const DRAWER_WIDTH = 230;
const DRAWER_WIDTH_COLLAPSED = 80;

export default function DashboardLayout() {
  const theme = useTheme();
  const { templateId } = useTemplate();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [view, setView] = useState(() => {
    if (location.pathname === "/algohub") return "algohub";
    if (location.pathname === "/qcircuit") return "qcircuit";
    if (location.pathname === "/inspector") return "inspector";
    if (location.pathname === "/profile") return "profile";
    return "dashboard";
  });
  useEffect(() => {
    if (location.pathname === "/algohub" && view !== "algohub") {
      setView("algohub");
    } else if (location.pathname === "/qcircuit" && view !== "qcircuit") {
      setView("qcircuit");
    } else if (location.pathname === "/inspector" && view !== "inspector") {
      setView("inspector");
    } else if (location.pathname === "/profile" && view !== "profile") {
      setView("profile");
    } else if (location.pathname === "/" && view !== "dashboard") {
      setView("dashboard");
    }
  }, [location.pathname, view]);
  const [inspectorMode, setInspectorMode] = useState("basic");

  const { simulationResult } = useSimulation();

  const blochSpheresRef = useRef(null);
  const probabilityChartRef = useRef(null);
  const amplitudesTableRef = useRef(null);
  const amplitudeWavesRef = useRef(null);
  const [analysisText, setAnalysisText] = useState("");

  const handleDrawerToggle = () => setMobileOpen((o) => !o);
  const [showToggleButton, setShowToggleButton] = React.useState(false);
  
  // Theme picker popup state
  const [themePickerAnchor, setThemePickerAnchor] = React.useState(null);

  const [profileAnchor, setProfileAnchor] = useState(null);
  const handleProfileClick = (event) => setProfileAnchor(event.currentTarget);
  const handleProfileClose = () => setProfileAnchor(null);
  
  const handleProfileSettings = () => {
    handleProfileClose();
    setView("profile");
    if (location.pathname !== "/profile") navigate("/profile", { replace: true });
    if (!isMdUp) setMobileOpen(false);
  };
  
  const handleLogout = () => {
    handleProfileClose();
    logout();
  };

  const drawer = (
      <Box 
        sx={{ 
          height: "100%", 
          display: "flex", 
          flexDirection: "column", 
          position: "relative",
          overflow: "visible"
        }}
      >
      <SidebarNav
        current={view}
        collapsed={sidebarCollapsed}
        onSelect={(key) => {
          if (key === "debugger") {
            navigate("/debugger");
            return;
          }
          if (key === "gamify") {
            navigate("/gamify");
            return;
          }
          if (key === "gate-lab") {
            navigate("/gate-lab");
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === "oneq-studio") {
            navigate("/oneq-studio");
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === "qmemo") {
            navigate("/qmemo");
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === "inspector") {
            navigate("/inspector");
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === "chatbot") {
            navigate("/qtalk");
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === "applications") {
            navigate("/applications");
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === "docs") {
            navigate("/docs");
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === "custom-template") {
            setView("custom-template");
            if (location.pathname !== "/") navigate("/", { replace: true });
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === "qlive") {
            navigate("/qlive");
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === "algohub") {
            if (location.pathname !== "/algohub") navigate("/algohub");
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === "qcircuit") {
            navigate("/qcircuit");
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === "dashboard") {
            setView("dashboard");
            if (location.pathname !== "/") navigate("/", { replace: true });
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (location.pathname !== "/") navigate("/");
          setView(key);
          if (!isMdUp) setMobileOpen(false);
        }}
      />
      <Divider sx={{ mt: "auto" }} />
      <Box 
        sx={{ 
          p: sidebarCollapsed ? 1 : 2, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: sidebarCollapsed ? 'center' : 'flex-start',
          cursor: 'pointer',
          '&:hover': { background: 'rgba(0,0,0,0.05)' }
        }} 
        onClick={handleProfileClick}
      >
        <Avatar sx={{ width: 32, height: 32, bgcolor: 'var(--qt-accent)', fontSize: '1rem', color: '#fff' }}>
          {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
        </Avatar>
        {!sidebarCollapsed && (
          <Box sx={{ ml: 1.5, overflow: 'hidden' }}>
            <Typography variant="body2" sx={{ color: "var(--qt-text)", fontWeight: 600, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
              {user?.username || 'User'}
            </Typography>
            <Typography variant="caption" sx={{ color: "var(--qt-text-dim)", textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', display: 'block' }}>
              {user?.email || ''}
            </Typography>
          </Box>
        )}
      </Box>
      <Menu
        anchorEl={profileAnchor}
        open={Boolean(profileAnchor)}
        onClose={handleProfileClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        PaperProps={{ sx: { background: 'var(--qt-surface)', color: 'var(--qt-text)', border: '1px solid var(--qt-border)', minWidth: 200 } }}
      >
        <MenuItem disabled sx={{ opacity: '1 !important' }}>
          <Box>
            <Typography variant="body2" sx={{ color: 'var(--qt-text)', fontWeight: 600 }}>{user?.username}</Typography>
            <Typography variant="caption" sx={{ color: 'var(--qt-text-dim)' }}>{user?.email}</Typography>
          </Box>
        </MenuItem>
        <Divider sx={{ my: 1, borderColor: 'var(--qt-border)' }} />
        <MenuItem onClick={handleProfileSettings} sx={{ '&:hover': { background: 'var(--qt-surface-alt)' } }}>Profile Settings</MenuItem>
        <MenuItem onClick={handleLogout} sx={{ color: '#ff4d4f', '&:hover': { background: 'var(--qt-surface-alt)' } }}>Logout</MenuItem>
      </Menu>
      
      {!sidebarCollapsed && (
        <Box sx={{ px: 2, pb: 2, pt: 1 }}>
          <Typography variant="caption" sx={{ color: "var(--qt-text-dim)" }}>
            © {new Date().getFullYear()} Qubit-Tracer
          </Typography>
        </Box>
      )}
    </Box>
  );

  const renderInspectorContent = () => {
    if (!simulationResult) {
      return (
        <Box
          sx={{
            p: 3,
            border: "1px solid var(--qt-border)",
            borderRadius: 3,
            background: "var(--qt-surface-glass, var(--qt-surface))",
            color: "var(--qt-text-dim)",
            maxWidth: 760,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: 600, mb: 1, color: "var(--qt-text)" }}
          >
            No Simulation Loaded
          </Typography>
          <Typography
            variant="body2"
            sx={{ lineHeight: 1.55, color: "var(--qt-text-dim)" }}
          >
            Run a circuit on the Dashboard first, then return here to inspect
            it.
          </Typography>
        </Box>
      );
    }

    if (inspectorMode === "advanced") {
      return (
        <Box sx={{ width: "100%", maxWidth: 1400 }}>
          <AdvancedInspectorPanel
            qasm={simulationResult.openqasm}
            numQubits={
              simulationResult.num_qubits ||
              simulationResult.numQubits ||
              simulationResult.bloch_vectors?.length ||
              0
            }
          />
        </Box>
      );
    }

    return (
      <Box
        sx={{
          width: "100%",
          maxWidth: 1200,
          background: "var(--qt-surface-glass, var(--qt-surface))",
          border: "1px solid var(--qt-border)",
          p: 3,
          borderRadius: 3,
          backdropFilter: "blur(6px)",
          color: "var(--qt-text)",
        }}
      >
        <Inspector result={simulationResult} />
      </Box>
    );
  };

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        height: view === "qcircuit" ? "100vh" : undefined,
        overflow: view === "qcircuit" ? "hidden" : undefined,
      }}
      className="qt-tmpl-dashboard-root"
      data-template={templateId}
    >
      <CssBaseline />

      {/* Navigation */}
      <Box
        component="nav"
        sx={{
          width: { md: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH },
          transition: 'width 0.3s ease-in-out',
          flexShrink: { md: 0 }
        }}
        aria-label="navigation"
      >
        {/* Mobile */}
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
              backgroundColor: (theme) => theme.palette.mode === 'light' ? '#E1E2E2' : 'var(--qt-surface)',
            },
          }}
        >
          {drawer}
        </Drawer>
        {/* Desktop */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
              transition: 'width 0.3s ease-in-out',
              boxSizing: "border-box",
              backgroundColor: (theme) => theme.palette.mode === 'light' ? '#E1E2E2' : 'var(--qt-surface)',
              overflowX: 'hidden',
              overflowY: 'auto',
              '&::-webkit-scrollbar': {
                display: 'none'
              },
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px)` },
          transition: 'width 0.3s ease-in-out',
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          height: view === "qcircuit" ? "100vh" : undefined,
          overflow: view === "qcircuit" ? "hidden" : undefined,
        }}
      >
        {/* App Bar */}
        <AppBar
          position="fixed"
          elevation={0}
          sx={{
            width: {
              xs: '100%',
              md: `calc(100% - ${sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px)`
            },
            left: {
              xs: 0,
              md: `${sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px`
            },
            transition: 'left 0.3s ease-in-out, width 0.3s ease-in-out',
            // background: 'var(--qt-surface-glass, rgba(15,24,36,0.6))',
            borderBottom: '1px solid var(--qt-border)',
            backdropFilter: 'blur(12px)',
          }}
        >
          <Toolbar>
            {!isMdUp && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 1, color: "var(--qt-text)" }}
              >
                <MenuIcon />
              </IconButton>
            )}

            {isMdUp && (
              <>
                <IconButton
                  color="inherit"
                  edge="start"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  sx={{ mr: 1, color: "var(--qt-text)" }}
                >
                  <SidebarLeft size={20} />
                </IconButton>
                <Divider orientation="vertical" flexItem sx={{ my: 1.5, mr: 2, borderColor: 'var(--qt-border)' }} />
              </>
            )}

            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontWeight: 600, color: "var(--qt-text)" }}
            >
              {view === "dashboard" && "Dashboard"}
              {view === "inspector" && "Inspector"}
              {view === "custom-template" && "Custom Template"}
              {view === "algohub" && "AlgoHub"}
              {view === "qcircuit" && "Q-Circuit Studio"}
              {view === "profile" && "User Profile"}
            </Typography>

            {view === "inspector" && simulationResult && (
              <ToggleButtonGroup
                size="small"
                exclusive
                value={inspectorMode}
                onChange={(_, val) => val && setInspectorMode(val)}
                sx={{
                  mr: 2,
                  "& .MuiToggleButton-root": {
                    color: "var(--qt-text-dim)",
                    borderColor: "var(--qt-border)",
                    "&.Mui-selected": {
                      color: "var(--qt-text)",
                      backgroundColor: "var(--qt-surface-glass)",
                      borderColor: "var(--qt-accent)",
                    },
                    "&:hover": {
                      backgroundColor: "var(--qt-surface-alt)",
                    },
                  },
                }}
              >
                <ToggleButton value="basic">Basic</ToggleButton>
                <ToggleButton value="advanced">Advanced</ToggleButton>
              </ToggleButtonGroup>
            )}

            {/* Theme Picker Button */}
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

        {/* Inner Scroll Area */}
        <Box
          className="qt-tmpl-dashboard-inner"
          sx={{
            flex: 1,
            px: view === "qcircuit" ? 0 : { xs: 2, sm: 3, md: 4 },
            py: view === "qcircuit" ? 0 : { xs: 3, md: 4 },
            background: (theme) =>
              `var(--qt-page-bg, ${
                theme.palette.mode === "dark"
                  ? "radial-gradient(circle at 25% 20%,#0b2734,#03141d)"
                  : "linear-gradient(180deg,#f0f6fa,#dfe9f1)"
              } )`,
            display: "flex",
            flexDirection: "column",
            gap: view === "qcircuit" ? 0 : 3,
            overflow: "hidden",
            height: view === "qcircuit" ? "calc(100vh - 64px)" : undefined,
          }}
        >
          {view === "qcircuit" ? (
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", width: "100%", height: "100%", minHeight: 0, overflow: "hidden" }}>
              <QCircuitStudioContent />
            </Box>
          ) : view === "dashboard" && (
              <DashboardContent
                analysisText={analysisText}
                setAnalysisText={setAnalysisText}
                blochSpheresRef={blochSpheresRef}
                probabilityChartRef={probabilityChartRef}
                amplitudesTableRef={amplitudesTableRef}
                amplitudeWavesRef={amplitudeWavesRef}
              />
            )}
            
            {view === "profile" && (
              <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 3 }}>
                <UserProfile />
              </Box>
            )}

            {view === "inspector" && (
            <Box
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 3,
              }}
            >
              {renderInspectorContent()}
            </Box>
          )}
          {view === "custom-template" && (
            <Box
              sx={{ display: "flex", flexDirection: "column", gap: 3, p: 0 }}
            >
              <TemplateGallery />
            </Box>
          )}

          {view === "algohub" && (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
              <AlgoHubContent />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
