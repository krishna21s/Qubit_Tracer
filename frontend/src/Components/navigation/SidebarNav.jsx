import React, { useState } from 'react';
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Toolbar,
  Box,
  Tooltip,
  IconButton,
  Collapse
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

import QubitTracerLogo from '../../assets/logo_new.png';
import QubitTracerLogoCollapse from '../../assets/logo_new_collapse.png';
import { Widget, Search, ChartPie, Flask, Wifi, Message, FileText, Monitor, Gamepad, Code, Cpu, Grid, SidebarLeft } from 'reicon-react';


const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: <Widget size={18} /> },
  { 
    isGroup: true, 
    key: 'group-building', 
    label: 'Building', 
    children: [
      { key: 'qcircuit', label: 'Q-Circuit Studio', icon: <Cpu size={18} /> },
      { key: 'oneq-studio', label: 'OneQ Studio', icon: <ChartPie size={18} /> },
    ]
  },
  { 
    isGroup: true, 
    key: 'group-learning', 
    label: 'Learning', 
    children: [
      { key: 'docs', label: 'Documentation', icon: <FileText size={18} /> },
      { key: 'qmemo', label: 'Q‑Memo', icon: <Monitor size={18} /> },
      { key: 'chatbot', label: 'Q-Talk AI', icon: <Message size={18} /> },
      { key: 'gamify', label: 'Gamify', icon: <Gamepad size={18} /> },
      { key: 'gate-lab', label: 'Gate Lab', icon: <Flask size={18} /> },
    ]
  },
  { key: 'qlive', label: 'QLive Preview', icon: <Wifi size={18} /> },
  { key: 'algohub', label: 'AlgoHub', icon: <Code size={18} /> },
  { key: 'applications', label: 'Applications', icon: <Grid size={18} /> }
];

export default function SidebarNav({ current, onSelect, collapsed, onToggleCollapse }) {
  const [expandedGroups, setExpandedGroups] = useState({
    'group-building': true,
    'group-learning': true
  });

  const toggleGroup = (key) => {
    setExpandedGroups(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const renderItem = (item, isTreeChild = false, isLastChild = false) => {
    const active = current === item.key;
    
    // Base styles for the button
    let sx = {
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
        '&::after': {
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
    };

    // Apply tree-line styling if it's a child and not collapsed
    if (isTreeChild && !collapsed) {
      sx = {
        ...sx,
        ml: 4, // Make room for lines
        overflow: 'visible',
        '&::before': { // vertical stem
          content: '""',
          position: 'absolute',
          left: '-16px',
          top: '-4px',
          bottom: isLastChild ? '50%' : '-4px',
          width: '1px',
          bgcolor: 'var(--qt-border)',
          zIndex: 1
        },
      };
    }

    const buttonContent = (
      <>
        {isTreeChild && !collapsed && (
          <Box sx={{
            position: 'absolute',
            left: '-16px',
            top: '50%',
            width: '16px',
            height: '1px',
            bgcolor: 'var(--qt-border)',
            zIndex: 1
          }} />
        )}
        <ListItemIcon sx={{ minWidth: collapsed ? 'unset' : 40 }}>{item.icon}</ListItemIcon>
        {!collapsed && (
          <ListItemText
            primaryTypographyProps={{ fontSize: 14, fontWeight: active ? 600 : 500 }}
            primary={item.label}
          />
        )}
      </>
    );

    return (
      <Tooltip title={collapsed ? item.label : ''} placement="right" key={item.key}>
        <ListItemButton selected={active} onClick={() => onSelect(item.key)} sx={sx}>
          {buttonContent}
        </ListItemButton>
      </Tooltip>
    );
  };

  return (
    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
      <Toolbar disableGutters sx={{ 
        px: collapsed ? 1 : 2, 
        py: 2, 
        display: 'flex',
        flexDirection: collapsed ? 'column' : 'row',
        justifyContent: collapsed ? 'center' : 'space-between',
        alignItems: 'center',
        gap: collapsed ? 1.5 : 0,
        zIndex: 10
      }}>
        {collapsed ? (
          <img src={QubitTracerLogoCollapse}
            style={{ width: '100%', maxWidth: 32, borderRadius: 8, cursor: 'pointer' }}
            onClick={onToggleCollapse}
            alt="Logo" />
        ) : (
          <img src={QubitTracerLogo}
            style={{ height: 57, objectFit: 'contain', cursor: 'pointer' }}
            alt="Logo" />
        )}
        {!collapsed && onToggleCollapse && (
          <IconButton onClick={onToggleCollapse} size="small" sx={{ color: 'var(--qt-text-dim)' }}>
            <SidebarLeft size={18} />
          </IconButton>
        )}
      </Toolbar>
      <Divider />
      
      <List sx={{ py: 1, flexGrow: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {NAV_ITEMS.map(item => {
          if (item.isGroup) {
            if (collapsed) {
              // Flat render for collapsed mode
              return item.children.map(child => renderItem(child, false, false));
            }
            
            const isExpanded = expandedGroups[item.key];
            return (
              <React.Fragment key={item.key}>
                <ListItemButton 
                  onClick={() => toggleGroup(item.key)}
                  sx={{ 
                    mx: 1, mt: 1.5, mb: 0.5, borderRadius: 2, minHeight: 36, px: 2,
                    color: 'var(--qt-text-dim)',
                    '&:hover': { bgcolor: 'rgba(255,255,255,0.05)' }
                  }}
                >
                  <ListItemText 
                    primary={item.label} 
                    primaryTypographyProps={{ 
                      fontSize: 12, 
                      fontWeight: 700, 
                      textTransform: 'uppercase', 
                      letterSpacing: '0.8px' 
                    }} 
                  />
                  {isExpanded ? <ExpandLessIcon sx={{ fontSize: 18 }} /> : <ExpandMoreIcon sx={{ fontSize: 18 }} />}
                </ListItemButton>
                
                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <List component="div" disablePadding>
                    {item.children.map((child, index) => 
                      renderItem(child, true, index === item.children.length - 1)
                    )}
                  </List>
                </Collapse>
              </React.Fragment>
            );
          }
          return renderItem(item, false, false);
        })}
      </List>
    </Box>
  );
}