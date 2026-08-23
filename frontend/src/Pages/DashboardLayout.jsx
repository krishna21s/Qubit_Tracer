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
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import ColorLensRoundedIcon from "@mui/icons-material/ColorLensRounded";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";

import { useTheme } from "@mui/material/styles";
import { useNavigate, useLocation } from "react-router-dom";

import SidebarNav from "../Components/navigation/SidebarNav";
import AdvancedInspectorPanel from "../Components/debugger/AdvancedInspectorPanel";
import Inspector from "../Components/Inspector";
import DashboardContent from "./DashboardContent";

import { useSimulation } from "../context/SimulationContext";
import { useTemplate } from "../context/TemplateContext";
import ThemePickerPopup from "../Components/templates/ThemePickerPopup";
import AlgoHubContent from "../Components/algohub/AlgoHubContent";

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

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [view, setView] = useState("dashboard");
    useEffect(() => {
      if (location.pathname === "/algohub" && view !== "algohub") {
        setView("algohub");
      } else if (location.pathname !== "/algohub" && view === "algohub") {
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
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        sx={{
          position: 'absolute',
          top: '50%',
          right: sidebarCollapsed ? -16 : -16,
          transform: 'translateY(-50%)',
          width: 32,
          height: 32,
          bgcolor: 'var(--qt-accent)',
          color: '#fff',
          border: '2px solid var(--qt-border)',
          zIndex: 1300,
          boxShadow: 2,
          opacity: showToggleButton ? 1 : 0,
          transition: 'opacity 0.2s ease-in-out, background-color 0.2s ease-in-out',
          '&:hover': { 
            bgcolor: 'var(--qt-accent)',
            boxShadow: 3,
            filter: 'brightness(1.1)'
          }
        }}
      >
        {sidebarCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
      </IconButton>
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
            setView("inspector");
            if (location.pathname !== "/") navigate("/", { replace: true });
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
      <Box sx={{ p: 2 }}>
        <Typography variant="caption" sx={{ color: "var(--qt-text-dim)" }}>
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
      sx={{ display: "flex", minHeight: "100vh" }}
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
                sx={{ mr: 1 }}
              >
                <MenuIcon />
              </IconButton>
            )}

            <Typography
              variant="h6"
              sx={{ flexGrow: 1, fontWeight: 600, color: "var(--qt-text)" }}
            >
              {view === "dashboard" && "Dashboard"}
              {view === "inspector" && "Inspector"}
              {view === "custom-template" && "Custom Template"}
              {view === "algohub" && "AlgoHub"}
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
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 3, md: 4 },
            background: (theme) =>
              `var(--qt-page-bg, ${
                theme.palette.mode === "dark"
                  ? "radial-gradient(circle at 25% 20%,#0b2734,#03141d)"
                  : "linear-gradient(180deg,#f0f6fa,#dfe9f1)"
              } )`,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            overflow: "hidden",
          }}
        >
          {view === "dashboard" && (
            <DashboardContent
              analysisText={analysisText}
              setAnalysisText={setAnalysisText}
              blochSpheresRef={blochSpheresRef}
              probabilityChartRef={probabilityChartRef}
              amplitudesTableRef={amplitudesTableRef}
              amplitudeWavesRef={amplitudeWavesRef}
            />
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
