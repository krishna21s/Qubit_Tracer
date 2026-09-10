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
import { SidebarRight } from 'reicon-react';

import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation, Outlet } from "react-router-dom";

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
  const getPathView = (path) => {
    if (path === "/algohub") return "algohub";
    if (path === "/qcircuit") return "qcircuit";
    if (path === "/inspector") return "inspector";
    if (path === "/profile") return "profile";
    if (path === "/qmemo") return "qmemo";
    if (path === "/gate-lab") return "gate-lab";
    if (path === "/oneq-studio") return "oneq-studio";
    if (path === "/qlive") return "qlive";
    if (path === "/chatbot" || path === "/qtalk") return "chatbot";
    if (path === "/gamify") return "gamify";
    if (path.startsWith("/docs")) return "docs";
    if (path.startsWith("/applications")) return "applications";
    return "dashboard";
  };

  const [view, setView] = useState(() => getPathView(location.pathname));

  useEffect(() => {
    setView(getPathView(location.pathname));
  }, [location.pathname]);
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
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      
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
        background: (theme) =>
          `var(--qt-page-bg, ${
            theme.palette.mode === "dark"
              ? "#0f172a"
              : "#f0f4f8"
          })`,
        p: { xs: 0, md: 1 },
        gap: { xs: 0, md: 1 }
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
            height: '100%',
            "& .MuiDrawer-paper": {
              position: 'relative',
              width: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
              transition: 'width 0.3s ease-in-out',
              boxSizing: "border-box",
              backgroundColor: 'var(--qt-surface)',
              borderRadius: '12px',
              border: '1px solid var(--qt-border)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
              height: 'calc(100vh - 16px)',
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
          display: "flex",
          flexDirection: "column",
          backgroundColor: 'var(--qt-surface)',
          borderRadius: { xs: 0, md: '12px' },
          border: { xs: 'none', md: '1px solid var(--qt-border)' },
          boxShadow: '0 4px 20px rgba(0,0,0,0.03)',
          overflow: "hidden",
          height: { xs: '100vh', md: 'calc(100vh - 16px)' },
          minHeight: 0,
        }}
      >
        {/* App Bar */}
        <AppBar
          position="relative"
          elevation={0}
          sx={{
            background: 'transparent',
            borderBottom: '1px solid var(--qt-border)',
            color: 'var(--qt-text)',
            zIndex: 10
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

            {isMdUp && sidebarCollapsed && (
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setSidebarCollapsed(false)}
                sx={{ mr: 2, color: "var(--qt-text)" }}
              >
                <SidebarRight size={20} />
              </IconButton>
            )}

            <Typography
              variant="subtitle1"
              sx={{ flexGrow: 1, fontWeight: 600, fontSize: "1.1rem", color: "var(--qt-text)" }}
            >
              {view === "dashboard" && "Dashboard"}
              {view === "inspector" && "Inspector"}
              {view === "custom-template" && "Custom Template"}
              {view === "algohub" && "AlgoHub"}
              {view === "qcircuit" && "Q-Circuit Studio"}
              {view === "profile" && "User Profile"}
              {view === "qmemo" && "Q-Memo"}
              {view === "gate-lab" && "Gate Lab"}
              {view === "oneq-studio" && "OneQ Studio"}
              {view === "qlive" && "QLive Preview"}
              {view === "chatbot" && "Q-Talk AI"}
              {view === "gamify" && "Gamify"}
              {view === "docs" && "Documentation"}
              {view === "applications" && "Applications"}
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

            {/* Profile Avatar */}
            <Tooltip title="Profile">
              <IconButton onClick={handleProfileClick} sx={{ ml: 1, p: 0 }}>
                <Avatar sx={{ width: 36, height: 36, bgcolor: 'var(--qt-accent)', fontSize: '1rem', color: '#fff', border: '2px solid transparent', transition: 'border-color 0.2s', '&:hover': { borderColor: 'var(--qt-accent)' } }}>
                  {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
                </Avatar>
              </IconButton>
            </Tooltip>

            <Menu
              anchorEl={profileAnchor}
              open={Boolean(profileAnchor)}
              onClose={handleProfileClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              PaperProps={{ sx: { mt: 1.5, background: 'var(--qt-surface)', color: 'var(--qt-text)', border: '1px solid var(--qt-border)', minWidth: 200 } }}
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
          </Toolbar>
        </AppBar>

        {/* Inner Scroll Area */}
        <Box
          className="qt-tmpl-dashboard-inner"
          sx={{
            flex: 1,
            px: view === "qcircuit" ? 0 : { xs: 2, sm: 3, md: 4 },
            py: view === "qcircuit" ? 0 : { xs: 3, md: 4 },
            background: 'transparent',
            display: "flex",
            flexDirection: "column",
            gap: view === "qcircuit" ? 0 : 3,
            overflowY: "auto",
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

          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
