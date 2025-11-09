// AppBar and content background updated to use theme variables; no logic changes
import React, { useState } from "react";
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
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useTheme } from "@mui/material/styles";
import { useNavigate } from "react-router-dom";

import SidebarNav from "../Components/navigation/SidebarNav";
import GameAssistant from "../Components/gamify/GameAssistant";
import { ColorModeContext, ColorModeProvider } from "../theme";

import "../Components/gamify/gamify.css";

const DRAWER_WIDTH = 250;

function GamifyShell() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen((o) => !o);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <SidebarNav
        current={"gamify"}
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
          navigate("/");
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
      sx={{ display: "flex", minHeight: "100vh" }}
      className="qt-tmpl-dashboard-root"
    >
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
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": {
              width: DRAWER_WIDTH,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>

        {/* Desktop drawer */}
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

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
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
            width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
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
              Gamify
            </Typography>

            <Tooltip title="Toggle light/dark">
              <IconButton onClick={colorMode.toggleColorMode} color="primary">
                {theme.palette.mode === "dark" ? (
                  <LightModeIcon />
                ) : (
                  <DarkModeIcon />
                )}
              </IconButton>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Toolbar />

        {/* Game content area */}
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
            overflow: "hidden",
          }}
        >
          <Box
            className="gamify-root"
            sx={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden",
            }}
          >
            <GameAssistant />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

export default function GamifyPage() {
  return (
    <ColorModeProvider>
      <GamifyShell />
    </ColorModeProvider>
  );
}
