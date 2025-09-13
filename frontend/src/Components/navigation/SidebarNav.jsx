import React from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  Typography
} from '@mui/material';
import QubitTracerLogo from '../../assets/pure_logo.png';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BugReportIcon from '@mui/icons-material/BugReport';
import PrecisionManufacturingIcon from '@mui/icons-material/PrecisionManufacturing';
import SearchIcon from '@mui/icons-material/Search';
import ChatIcon from '@mui/icons-material/Chat';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { key: 'inspector', label: 'Inspector', icon: <SearchIcon /> },
  { key: 'docs', label: 'Documentation', icon: <MenuBookIcon /> },
  { key: 'qmemo', label: 'Q‑Memo', icon: <VideoLibraryIcon /> },
  { key: 'custom-template', label: 'Custom Template', icon: <PrecisionManufacturingIcon /> },
  { key: 'chatbot', label: 'Q-Talk AI', icon: <ChatIcon /> },
  { key: 'gamify', label: 'Gamify', icon: <SportsEsportsIcon /> }
];

export default function SidebarNav({ current, onSelect }) {
  return (
    <Box sx={{ width: '100%' }}>
      <Toolbar disableGutters sx={{ px: 2, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 1 }}>
          <img src={QubitTracerLogo}
            style={{
              height: 42,
              marginRight: "15px",
              borderRadius: 120,
              filter: "drop-shadow(2px 2px 0px black)"
            }}
            alt="" />
          Qubit-Tracer
        </Typography>
      </Toolbar>
      <Divider />
      <List sx={{ py: 0 }}>
        {NAV_ITEMS.map(item => {
          const active = current === item.key;
          return (
            <ListItemButton
              key={item.key}
              selected={active}
              onClick={() => onSelect(item.key)}
              sx={{
                borderRadius: 2,
                mx: 1,
                mt: 0.5,
                '&.Mui-selected': {
                  bgcolor: 'primary.main',
                  color: '#fff',
                  '& .MuiListItemIcon-root': { color: '#fff' }
                }
              }}
            >
              <ListItemIcon sx={{ minWidth: 40 }}>{item.icon}</ListItemIcon>
              <ListItemText
                primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500 }}
                primary={item.label}
              />
            </ListItemButton>
          );
        })}
      </List>
    </Box>
  );
}