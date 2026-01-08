import React from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  Typography,
  Tooltip
} from '@mui/material';
import QubitTracerLogo from '../../assets/pure_logo.png';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';
import ScienceIcon from '@mui/icons-material/Science';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';
import WifiIcon from '@mui/icons-material/Wifi';
import CodeIcon from '@mui/icons-material/Code';
import AppsIcon from '@mui/icons-material/Apps';
import ColorLensRoundedIcon from '@mui/icons-material/ColorLensRounded';
import GridViewRoundedIcon from '@mui/icons-material/GridViewRounded';
import DescriptionRoundedIcon from '@mui/icons-material/DescriptionRounded';
import SmartDisplayRoundedIcon from '@mui/icons-material/SmartDisplayRounded';
import ChatRoundedIcon from '@mui/icons-material/ChatRounded';
const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <GridViewRoundedIcon /> },
  { key: 'inspector', label: 'Inspector', icon: <SearchIcon /> },
  { key: 'docs', label: 'Documentation', icon: <DescriptionRoundedIcon /> },
    { key: 'qmemo', label: 'Q‑Memo', icon: <SmartDisplayRoundedIcon /> },
  { key: 'custom-template', label: 'Custom Template', icon: <ColorLensRoundedIcon /> },
  { key: 'chatbot', label: 'Q-Talk AI', icon: <ChatRoundedIcon /> },
  { key: 'gamify', label: 'Gamify', icon: <SportsEsportsIcon /> },
  // New items (appear last)
  { key: 'applications', label: 'Applications', icon: <AppsIcon /> },
  { key: 'gate-lab', label: 'Gate Lab', icon: <ScienceIcon /> },
  { key: 'oneq-studio', label: 'OneQ Studio', icon: <DonutLargeIcon /> },
  { key: 'qlive', label: 'QLive Preview', icon: <WifiIcon /> },
  { key: 'algohub', label: 'AlgoHub', icon: <CodeIcon /> }
];

export default function SidebarNav({ current, onSelect, collapsed }) {
  return (
    <Box sx={{ width: '100%' }}>
      <Toolbar disableGutters sx={{ px: collapsed ? 1 : 2, py: 2, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        {collapsed ? (
          <img src={QubitTracerLogo}
            style={{
              height: 42,
              borderRadius: 120,
              filter: "drop-shadow(2px 2px 0px black)"
            }}
            alt="" />
        ) : (
          <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
            <img src={QubitTracerLogo}
              style={{
                height: 42,
                marginRight: "5px",
                borderRadius: 120,
              }}
              alt="" />
            Qubit-Tracer
          </Typography>
        )}
      </Toolbar>
      <Divider />
      <List sx={{ py: 0 }}>
        {NAV_ITEMS.map(item => {
          const active = current === item.key;
          return (
            <Tooltip title={collapsed ? item.label : ''} placement="right" key={item.key}>
              <ListItemButton
                selected={active}
                onClick={() => onSelect(item.key)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  mt: 0.5,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  px: collapsed ? 0 : 2,
                  color: 'var(--qt-text)',
                  '& .MuiListItemIcon-root': { 
                    color: 'var(--qt-text)',
                    minWidth: collapsed ? 'unset' : 40
                  },
                  '&.Mui-selected': {
                    bgcolor: 'var(--qt-accent)',
                    color: '#fff',
                    '& .MuiListItemIcon-root': { color: '#fff' }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: collapsed ? 'unset' : 40 }}>{item.icon}</ListItemIcon>
                {!collapsed && (
                  <ListItemText
                    primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500 }}
                    primary={item.label}
                  />
                )}
              </ListItemButton>
            </Tooltip>
          );
        })}
      </List>
    </Box>
  );
}