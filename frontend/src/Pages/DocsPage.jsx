// AppBar and content background updated to use theme variables
import React from "react";
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
import { useNavigate, useParams } from "react-router-dom";

import SidebarNav from "../Components/navigation/SidebarNav";
import DocsHome from "../Components/docs/DocsHome";
import DocsViewer from "../Components/docs/DocsViewer";
import { ColorModeContext, ColorModeProvider } from "../theme";
import ThemePickerPopup from "../Components/templates/ThemePickerPopup";

import "../Components/docs/docs.css";

const DRAWER_WIDTH = 250;
const DRAWER_WIDTH_COLLAPSED = 70;

function DocsShell() {
  const theme = useTheme();
  const colorMode = React.useContext(ColorModeContext);
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const navigate = useNavigate();
  const { slug } = useParams();

  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [showToggleButton, setShowToggleButton] = React.useState(false);
  const [themePickerAnchor, setThemePickerAnchor] = React.useState(null);
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
        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
        sx={{
          position: 'absolute',
          top: '50%',
          right: -16,
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
        current={"docs"}
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
          navigate("/");
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

  return (
    <Box
      sx={{ display: "flex", minHeight: "100vh" }}
      className="qt-tmpl-dashboard-root"
    >
      <CssBaseline />

      <Box
        component="nav"
        sx={{
          width: { md: sidebarCollapsed ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH },
          transition: 'width 0.3s ease-in-out',
          flexShrink: { md: 0 }
        }}
        aria-label="navigation"
      >
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
        <AppBar
          position="fixed"
          color="transparent"
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
              Documentation
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

        <Box
          sx={{
            flex: 1,
            px: { xs: 2, sm: 3, md: 4 },
            py: { xs: 3, md: 4 },
            background: (theme) =>
              `var(--qt-page-bg, ${
                theme.palette.mode === "dark"
                  ? "radial-gradient(circle at 25% 20%,#0b2734,#03141d)"
                  : "linear-gradient(180deg,#f0f6fa,#dfe9f1)"
              })`,
            display: "flex",
            flexDirection: "column",
            gap: 3,
            overflow: "auto",
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
  return <DocsShell />;
}
