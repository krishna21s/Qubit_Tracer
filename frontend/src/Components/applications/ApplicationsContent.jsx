import React, { useState, useContext } from "react";
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
  Stack,
  Button,
  Paper,
} from "@mui/material";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import SecurityIcon from "@mui/icons-material/Security";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import MenuIcon from "@mui/icons-material/Menu";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import LaunchIcon from "@mui/icons-material/Launch";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import SidebarNav from "../navigation/SidebarNav";
import ApplicationCard from "./ApplicationCard";
import { ColorModeContext } from "../../theme";

import "../../styles/applicationsCards.css";
import "../../styles/dashboardTheme.css";

const DRAWER_WIDTH = 250;
const DRAWER_WIDTH_COLLAPSED = 70;

export default function ApplicationsContent() {
  const theme = useTheme();
  const colorMode = useContext(ColorModeContext);
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showToggleButton, setShowToggleButton] = useState(false);

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "visible",
      }}
      onMouseEnter={() => setShowToggleButton(true)}
      onMouseLeave={() => setShowToggleButton(false)}
    >
      <IconButton
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        sx={{
          position: "absolute",
          top: "50%",
          right: sidebarCollapsed ? -16 : -16,
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
            filter: "brightness(1.1)",
          },
        }}
      >
        {sidebarCollapsed ? <ChevronRightIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
      </IconButton>

      <SidebarNav
        current="applications"
        collapsed={sidebarCollapsed}
        onSelect={(key) => {
          if (key === "applications") {
            if (!isMdUp) setMobileOpen(false);
            return;
          }
          if (key === "dashboard") {
            navigate("/");
            return;
          }
          if (key === "inspector") {
            navigate("/");
            return;
          }
          if (key === "debugger") {
            navigate("/debugger");
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
          if (key === "qmemo") {
            navigate("/qmemo");
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
          if (key === "qlive") {
            navigate("/qlive");
            return;
          }
          if (key === "algohub") {
            navigate("/algohub");
            return;
          }
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

  const cards = [
    {
      title: "Quantum Materials Discovery",
      subtitle: "AI + Quantum",
      description:
        "Discover and screen candidate materials using quantum ML workflows. Interact with compositions, visualize circuits, and review AI-guided decisions.",
      tags: ["VQC", "Materials", "Explainable AI", "3D"],
      status: "available",
      actionLabel: "Open",
      onClick: () => navigate("/applications/materials-discovery"),
      icon: <ScienceRoundedIcon fontSize="inherit" />,
    },
    {
      title: "Quantum Security Analyzer",
      subtitle: "Practical App",
      description: "Placeholder for future quantum security assessments with noise-aware circuits.",
      tags: ["Cryptography", "Noise"],
      status: "upcoming",
      actionLabel: "Preview",
      onClick: () => {},
      icon: <SecurityIcon fontSize="inherit" />,
    },
    {
      title: "Quantum Optimization Lab",
      subtitle: "Practical App",
      description: "Placeholder for combinatorial optimization scenarios leveraging QAOA-style workflows.",
      tags: ["QAOA", "Optimization"],
      status: "upcoming",
      actionLabel: "Preview",
      onClick: () => {},
      icon: <QueryStatsIcon fontSize="inherit" />,
    },
  ];

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", background: "var(--qt-page-bg)" }} className="qt-tmpl-dashboard-root">
      <CssBaseline />
      <AppBar
        position="fixed"
        elevation={1}
        sx={{
          width: { md: `calc(100% - ${sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px)` },
          ml: { md: `${sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px` },
          background: "var(--qt-appbar-bg)",
          color: "var(--qt-text)",
          borderBottom: "1px solid var(--qt-border)",
          backdropFilter: "blur(10px)",
        }}
      >
        <Toolbar sx={{ display: "flex", gap: 2 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ mr: 1, display: { md: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ fontWeight: 700 }}>
            Applications
          </Typography>
          <Box sx={{ flexGrow: 1 }} />
          <Tooltip title="Toggle light/dark">
            <IconButton color="inherit" onClick={colorMode.toggleColorMode}>
              {theme.palette.mode === "dark" ? <LightModeIcon /> : <DarkModeIcon />}
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<LaunchIcon />}
            sx={{ textTransform: "none" }}
            onClick={() => navigate("/docs")}
          >
            Docs
          </Button>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH }, flexShrink: { md: 0 } }}
        aria-label="sidebar"
      >
        <Drawer
          variant={isMdUp ? "permanent" : "temporary"}
          open={isMdUp ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "block" },
            "& .MuiDrawer-paper": {
              width: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH,
              boxSizing: "border-box",
              background: "var(--qt-drawer-bg)",
              color: "var(--qt-text)",
              overflow: "hidden",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2.5, md: 3.5 },
          width: { md: `calc(100% - ${sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH}px)` },
          mt: 8,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Paper
          variant="outlined"
          className="qt-tmpl-hero"
          sx={{
            p: 3,
            background: "var(--qt-gradient-main)",
            color: "var(--qt-text)",
            border: "1px solid var(--qt-border)",
            borderRadius: 3,
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Quantum Applications Gallery
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 960, color: "var(--qt-text-dim)", lineHeight: 1.6 }}>
              Browse practical quantum applications designed for the Qubit Tracer platform. Each card will open directly within this workspace, keeping the sidebar and top bar consistent. The first experience is the Quantum Materials Discovery dashboard.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {}}
                sx={{ background: "var(--qt-button-primary)", '&:hover': { background: "var(--qt-button-primary-hover)" } }}
              >
                Launch Materials Discovery
              </Button>
              <Button variant="outlined" color="inherit" onClick={() => navigate("/docs")}>Learn more</Button>
            </Stack>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            alignItems: "stretch",
          }}
        >
          {cards.map((card) => (
            <ApplicationCard key={card.title} {...card} />
          ))}
        </Box>
      </Box>
    </Box>
  );
}
