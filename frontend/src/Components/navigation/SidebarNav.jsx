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
import QubitTracerLogo from '../../assets/logo_new.png';
import QubitTracerLogoCollapse from '../../assets/logo_new_collapse.png';
import { Widget, Search, ChartPie, Flask, Wifi, Message, FileText, Monitor, Gamepad, Code, Cpu, Grid } from 'reicon-react';


const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <Widget size={18} /> },
  { key: 'inspector', label: 'Inspector', icon: <Search size={18} /> },
  { key: 'oneq-studio', label: 'OneQ Studio', icon: <ChartPie size={18} /> },
  { key: 'gate-lab', label: 'Gate Lab', icon: <Flask size={18} /> },
  { key: 'qlive', label: 'QLive Preview', icon: <Wifi size={18} /> },
  { key: 'chatbot', label: 'Q-Talk AI', icon: <Message size={18} /> },
  { key: 'docs', label: 'Documentation', icon: <FileText size={18} /> },
  { key: 'qmemo', label: 'Q‑Memo', icon: <Monitor size={18} /> },
  { key: 'gamify', label: 'Gamify', icon: <Gamepad size={18} /> },
  { key: 'algohub', label: 'AlgoHub', icon: <Code size={18} /> },
  { key: 'qcircuit', label: 'Q-Circuit Studio', icon: <Cpu size={18} /> },
  { key: 'applications', label: 'Applications', icon: <Grid size={18} /> }
];

export default function SidebarNav({ current, onSelect, collapsed }) {
  return (
    <Box sx={{ width: '100%' }}>
      <Toolbar disableGutters sx={{ px: collapsed ? 1 : 2, py: 2, justifyContent: 'center' }}>
        {collapsed ? (
          <img src={QubitTracerLogoCollapse}
            style={{
              width: '80%',
              maxWidth: 50,
              borderRadius: 10,

              // boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)'

            }}
            alt="Logo" />
        ) : (
          <img src={QubitTracerLogo}
            style={{
              height: 57,
              borderRadius: 10,
              objectFit: 'contain',
              // boxShadow: '4px 4px 6px rgba(0, 0, 0, 0.1)'
            }}
            alt="Logo" />
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
                  minHeight: 44,
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  px: collapsed ? 0 : 2,
                  color: 'var(--qt-text)',
                  '& .MuiListItemIcon-root': {
                    color: 'var(--qt-text)',
                    minWidth: collapsed ? 'unset' : 40
                  },
                  position: 'relative',
                  '&.Mui-selected': {
                    bgcolor: 'transparent',
                    color: 'var(--qt-accent)',
                    '& .MuiListItemIcon-root': { color: 'var(--qt-accent)' },
                    '&:hover': {
                      bgcolor: 'rgba(0, 0, 0, 0.04)'
                    },
                    '&::before': {
                      content: '""',
                      position: 'absolute',
                      left: -8,
                      top: '15%',
                      height: '70%',
                      width: 4,
                      bgcolor: 'var(--qt-accent)',
                      borderRadius: '0 4px 4px 0',
                    }
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