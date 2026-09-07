/**
 * CollaborateDialog.jsx — Canva-style collaboration popup for Q-Circuit Studio.
 *
 * Features:
 *  - Access level toggle: "Only you can access" vs "Anyone with the link"
 *  - Permission dropdown: "Can view" vs "Can edit"
 *  - Copy link button
 *  - Active participants list with colored avatars
 */

import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Avatar, Button, Select, MenuItem,
  Divider, IconButton, Paper, Tooltip, Snackbar, Alert
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PublicIcon from '@mui/icons-material/Public';
import LockIcon from '@mui/icons-material/Lock';
import CloseIcon from '@mui/icons-material/Close';
import LinkIcon from '@mui/icons-material/Link';
import GroupIcon from '@mui/icons-material/Group';
import WifiIcon from '@mui/icons-material/Wifi';
import { useAuth } from '../../context/AuthContext';
import { getApiBaseUrl } from '../../utils/api';

export default function CollaborateDialog({
  open,
  onClose,
  circuitId,
  participants = [],
  isOwner = false,
}) {
  const { token } = useAuth();
  const [accessLevel, setAccessLevel] = useState('private'); // 'private' or 'public'
  const [permission, setPermission] = useState('view');       // 'view' or 'edit'
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);
  const [lanIp, setLanIp] = useState('');

  const API_URL = getApiBaseUrl();

  // Deduplicate participants
  const uniqueParticipants = React.useMemo(() => {
    const seen = new Set();
    return (participants || []).filter(p => {
      if (!p || !p.user_id || seen.has(p.user_id)) return false;
      seen.add(p.user_id);
      return true;
    });
  }, [participants]);

  // Load current sharing settings and network info when dialog opens
  useEffect(() => {
    if (open && circuitId && token) {
      fetch(`${API_URL}/circuits/${circuitId}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          setAccessLevel(data.is_public ? 'public' : 'private');
          setPermission(data.access_level || 'view');
        })
        .catch(() => {});

      // Fetch network LAN IP so links generated on localhost work on phones/other devices
      fetch(`${API_URL}/api/network-info`)
        .then(r => r.json())
        .then(data => {
          if (data && data.lan_ip && data.lan_ip !== '127.0.0.1') {
            setLanIp(data.lan_ip);
          }
        })
        .catch(() => {});
    }
  }, [open, circuitId, token, API_URL]);

  // Compute universally accessible link
  const shareLink = React.useMemo(() => {
    const isLocal = typeof window !== 'undefined' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
    const host = isLocal && lanIp ? lanIp : (window.location.hostname || 'localhost');
    const port = window.location.port ? `:${window.location.port}` : '';
    const protocol = window.location.protocol || 'http:';
    return `${protocol}//${host}${port}/qcircuit?room=${circuitId}`;
  }, [circuitId, lanIp]);

  const handleAccessChange = async (newAccess) => {
    setAccessLevel(newAccess);
    if (!circuitId || !isOwner) return;
    setSaving(true);
    try {
      await fetch(`${API_URL}/circuits/${circuitId}/share`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_public: newAccess === 'public',
          access_level: newAccess === 'public' ? permission : 'view',
        }),
      });
    } catch (err) {
      console.error('Failed to update sharing:', err);
    } finally {
      setSaving(false);
    }
  };

  const handlePermissionChange = async (newPerm) => {
    setPermission(newPerm);
    if (!circuitId || !isOwner) return;
    setSaving(true);
    try {
      await fetch(`${API_URL}/circuits/${circuitId}/share`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          is_public: true,
          access_level: newPerm,
        }),
      });
    } catch (err) {
      console.error('Failed to update permission:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (!open) return null;

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          inset: 0,
          zIndex: 1300,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'flex-end',
          pt: 8,
          pr: 3,
        }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <Paper
          elevation={24}
          sx={{
            width: 380,
            background: 'var(--qt-surface, #0f1824)',
            border: '1px solid var(--qt-border, #1e3a4f)',
            borderRadius: 3,
            overflow: 'hidden',
            color: 'var(--qt-text, #e0f0ff)',
          }}
        >
          {/* Header */}
          <Box sx={{ px: 3, pt: 2.5, pb: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <GroupIcon sx={{ color: 'var(--qt-accent, #4cc3fa)', fontSize: 22 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--qt-text)' }}>
                Collaborate
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="caption" sx={{ color: 'var(--qt-text-dim)', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#4CAF50', display: 'inline-block' }} />
                {uniqueParticipants.length} online
              </Typography>
              <IconButton size="small" onClick={onClose} sx={{ color: 'var(--qt-text-dim)' }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'var(--qt-border)' }} />

          {/* Participants */}
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="caption" sx={{ color: 'var(--qt-text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'block' }}>
              People in this circuit
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {uniqueParticipants.map((p, i) => (
                <Tooltip key={p.user_id || i} title={p.username}>
                  <Avatar
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: p.color || 'var(--qt-accent)',
                      fontSize: '0.8rem',
                      fontWeight: 700,
                      border: '2px solid var(--qt-surface)',
                      cursor: 'default',
                    }}
                  >
                    {p.username?.charAt(0).toUpperCase()}
                  </Avatar>
                </Tooltip>
              ))}
              {uniqueParticipants.length === 0 && (
                <Typography variant="body2" sx={{ color: 'var(--qt-text-dim)', fontStyle: 'italic' }}>
                  Only you are here
                </Typography>
              )}
            </Box>
          </Box>

          <Divider sx={{ borderColor: 'var(--qt-border)' }} />

          {/* Access Level */}
          <Box sx={{ px: 3, py: 2 }}>
            <Typography variant="caption" sx={{ color: 'var(--qt-text-dim)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, mb: 1.5, display: 'block' }}>
              Access level
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                p: 1.5,
                borderRadius: 2,
                border: '1px solid var(--qt-border)',
                background: 'rgba(255,255,255,0.03)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {accessLevel === 'private' ? (
                  <LockIcon sx={{ color: 'var(--qt-text-dim)', fontSize: 20 }} />
                ) : (
                  <PublicIcon sx={{ color: 'var(--qt-accent)', fontSize: 20 }} />
                )}
                <Box>
                  <Select
                    value={accessLevel}
                    onChange={(e) => handleAccessChange(e.target.value)}
                    disabled={!isOwner || saving}
                    variant="standard"
                    disableUnderline
                    sx={{
                      color: 'var(--qt-text)',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      '& .MuiSelect-icon': { color: 'var(--qt-text-dim)' },
                    }}
                  >
                    <MenuItem value="private">Only you can access</MenuItem>
                    <MenuItem value="public">Anyone with the link</MenuItem>
                  </Select>
                </Box>
              </Box>

              {accessLevel === 'public' && (
                <Select
                  value={permission}
                  onChange={(e) => handlePermissionChange(e.target.value)}
                  disabled={!isOwner || saving}
                  variant="standard"
                  disableUnderline
                  sx={{
                    color: 'var(--qt-accent)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    '& .MuiSelect-icon': { color: 'var(--qt-text-dim)' },
                  }}
                >
                  <MenuItem value="view">Can view</MenuItem>
                  <MenuItem value="edit">Can edit</MenuItem>
                </Select>
              )}
            </Box>
          </Box>

          {/* Copy Link */}
          <Box sx={{ px: 3, pb: 3, pt: 1 }}>
            {accessLevel === 'public' && (
              <Box sx={{ mb: 1.5, p: 1.2, borderRadius: 2, bgcolor: 'rgba(76,195,250,0.06)', border: '1px solid rgba(76,195,250,0.15)' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8, mb: 0.6 }}>
                  <WifiIcon sx={{ fontSize: 15, color: '#4cc3fa' }} />
                  <Typography variant="caption" sx={{ color: '#4cc3fa', fontWeight: 600 }}>
                    Cross-device link (usable on any device):
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ 
                  display: 'block', 
                  fontFamily: 'monospace', 
                  color: 'var(--qt-text, #e0f0ff)', 
                  wordBreak: 'break-all',
                  bgcolor: 'rgba(0,0,0,0.25)',
                  p: 0.8,
                  borderRadius: 1,
                  fontSize: '0.75rem',
                }}>
                  {shareLink}
                </Typography>
              </Box>
            )}

            <Button
              fullWidth
              variant="contained"
              startIcon={<LinkIcon />}
              onClick={handleCopyLink}
              disabled={accessLevel === 'private'}
              sx={{
                py: 1.3,
                borderRadius: '24px',
                background: accessLevel === 'private'
                  ? 'rgba(255,255,255,0.05)'
                  : 'linear-gradient(135deg, var(--qt-accent, #4cc3fa), #1a8ed1)',
                color: accessLevel === 'private' ? 'var(--qt-text-dim)' : '#fff',
                fontWeight: 700,
                fontSize: '0.9rem',
                textTransform: 'none',
                boxShadow: accessLevel === 'private' ? 'none' : '0 4px 16px rgba(76,195,250,0.3)',
                '&:hover': {
                  background: accessLevel === 'private'
                    ? 'rgba(255,255,255,0.08)'
                    : 'linear-gradient(135deg, #3ab2e6, #1580c0)',
                },
              }}
            >
              {copied ? '✓ Copied to Clipboard!' : 'Copy link'}
            </Button>
          </Box>
        </Paper>
      </Box>

      <Snackbar
        open={copied}
        autoHideDuration={2000}
        onClose={() => setCopied(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" sx={{ background: '#1b5e20', color: '#fff' }}>
          Collaboration link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
}
