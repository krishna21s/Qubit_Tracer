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

import React, { useState, useRef } from "react";
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
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import SidebarNav from "../Components/navigation/SidebarNav";
import AdvancedInspectorPanel from "../Components/debugger/AdvancedInspectorPanel";
import Inspector from "../Components/Inspector";
import DashboardContent from "./DashboardContent";

import { ColorModeContext } from "../theme";
import { useSimulation } from "../context/SimulationContext";
import { useTemplate } from "../context/TemplateContext";
import TemplateGallery from "../Components/templates/TemplateGallery";
import VisibilityRoundedIcon from "@mui/icons-material/VisibilityRounded";
import ScreenshotMonitorIcon from "@mui/icons-material/ScreenshotMonitor";
import CameraEnhanceRoundedIcon from "@mui/icons-material/CameraEnhanceRounded";
import CenterFocusStrongRoundedIcon from "@mui/icons-material/CenterFocusStrongRounded";

// Scoped styles
import "../styles/dashboardTheme.css";
import "../styles/dashboardButtons.css";

const DRAWER_WIDTH = 250;

export default function DashboardLayout() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const { templateId } = useTemplate();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [view, setView] = useState("dashboard");
  const [inspectorMode, setInspectorMode] = useState("basic");

  const { simulationResult } = useSimulation();

  const blochSpheresRef = useRef(null);
  const probabilityChartRef = useRef(null);
  const amplitudesTableRef = useRef(null);
  const amplitudeWavesRef = useRef(null);
  const [analysisText, setAnalysisText] = useState("");

  const handleDrawerToggle = () => setMobileOpen((o) => !o);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <SidebarNav
        current={view}
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
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === "chatbot") {
            navigate("/qtalk");
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
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === "qlive") {
            navigate("/qlive");
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          setView(key);
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
          maxWidth: 760,
          background: "var(--qt-surface-glass, var(--qt-surface))",
          border: "1px solid var(--qt-border)",
          p: 2.5,
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
        sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}
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
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
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
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* App Bar */}
        <AppBar
          position="fixed"
          color="transparent"
          elevation={0}
          sx={{
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
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
            </Typography>

            {view === "inspector" && simulationResult && (
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

            <Tooltip
              title={
                simulationResult ? "Open Debugger" : "Run a simulation first"
              }
            >
              <span>
                <IconButton
                  onClick={() => simulationResult && navigate("/debugger")}
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
            overflow: "auto",
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
        </Box>
      </Box>
    </Box>
  );
}
