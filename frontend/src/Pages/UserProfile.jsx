import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Avatar,
  Paper,
  Grid,
  Button,
  TextField,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import WorkIcon from '@mui/icons-material/Work';
import BusinessIcon from '@mui/icons-material/Business';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimelineIcon from '@mui/icons-material/Timeline';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import '../styles/dashboardTheme.css';

export default function UserProfile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [bio, setBio] = useState(user?.bio || '');
  const [organization, setOrganization] = useState(user?.organization || '');
  const [role, setRole] = useState(user?.role || '');
  const [location, setLocation] = useState(user?.location || '');

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setOrganization(user.organization || '');
      setRole(user.role || '');
      setLocation(user.location || '');
    }
  }, [user]);

  const handleSave = async () => {
    setLoading(true);
    const result = await updateProfile({ bio, organization, role, location });
    setLoading(false);
    if (result.success) {
      setIsEditing(false);
    } else {
      alert('Failed to update profile: ' + result.error);
    }
  };

  // Mock data for statistics and activity
  const mockStats = {
    simulationsRun: 142,
    circuitsSaved: 38,
    qTokens: 1500,
  };

  const mockActivity = [
    { id: 1, action: 'Simulated GHZ State', time: '2 hours ago', icon: <TimelineIcon sx={{ fontSize: 18, color: "var(--qt-accent)" }} /> },
    { id: 2, action: 'Created Custom Gate: X-Y', time: '1 day ago', icon: <CheckCircleIcon sx={{ fontSize: 18, color: "#00e676" }} /> },
    { id: 3, action: 'Earned Quantum Novice Badge', time: '1 week ago', icon: <EmojiEventsIcon sx={{ fontSize: 18, color: "#ffd700" }} /> },
  ];

  return (
    <Box sx={{ p: 4, width: '100%', maxWidth: 1200, margin: '0 auto' }}>
      
      {/* Banner & Header */}
      <Paper
        elevation={0}
        sx={{
          background: 'var(--qt-surface-glass)',
          border: '1px solid var(--qt-border)',
          borderRadius: 4,
          backdropFilter: 'blur(12px)',
          overflow: 'hidden',
          mb: 4,
          position: 'relative'
        }}
      >
        <Box
          sx={{
            height: 160,
            background: 'linear-gradient(135deg, var(--qt-accent), #0b2734)',
            opacity: 0.8
          }}
        />
        <Box sx={{ px: 4, pb: 4, display: 'flex', flexDirection: { xs: 'column', md: 'row' }, alignItems: { xs: 'center', md: 'flex-end' }, mt: -7 }}>
          <Avatar
            sx={{
              width: 140,
              height: 140,
              border: '4px solid var(--qt-surface)',
              bgcolor: 'var(--qt-surface-alt)',
              fontSize: '4rem',
              color: 'var(--qt-text)',
              boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
              mb: { xs: 2, md: 0 }
            }}
          >
            {user?.username ? user.username.charAt(0).toUpperCase() : 'U'}
          </Avatar>
          <Box sx={{ ml: { md: 4 }, flexGrow: 1, textAlign: { xs: 'center', md: 'left' } }}>
            <Typography variant="h4" sx={{ color: 'var(--qt-text)', fontWeight: 700 }}>
              {user?.username || 'Quantum Explorer'}
            </Typography>
            <Typography variant="subtitle1" sx={{ color: 'var(--qt-accent)', fontWeight: 500 }}>
              {user?.email || 'No email provided'}
            </Typography>
          </Box>
          <Button
            variant={isEditing ? 'outlined' : 'contained'}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            disabled={loading}
            sx={{
              mt: { xs: 3, md: 0 },
              minWidth: 120,
              background: isEditing ? 'transparent' : 'var(--qt-accent)',
              color: isEditing ? 'var(--qt-accent)' : '#000',
              borderColor: 'var(--qt-accent)',
              borderRadius: '20px',
              textTransform: 'none',
              fontWeight: 600,
              '&:hover': {
                background: isEditing ? 'rgba(76, 195, 250, 0.1)' : '#3ab2e6',
              }
            }}
          >
            {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </Box>
      </Paper>

      {/* Main Grid */}
      <Grid container spacing={4}>
        
        {/* Left Column: Professional Details */}
        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              background: 'var(--qt-surface-glass)',
              border: '1px solid var(--qt-border)',
              borderRadius: 4,
              backdropFilter: 'blur(12px)',
              height: '100%'
            }}
          >
            <Typography variant="h6" sx={{ color: 'var(--qt-text)', fontWeight: 600, mb: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
              <PersonIcon sx={{ fontSize: 20 }} /> Professional Info
            </Typography>
            <Divider sx={{ mb: 3, borderColor: 'var(--qt-border)' }} />

            {isEditing ? (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <TextField
                  label="Role / Title"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  variant="outlined"
                  fullWidth
                  InputProps={{ sx: { color: 'var(--qt-text)' } }}
                  InputLabelProps={{ sx: { color: 'var(--qt-text-dim)' } }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--qt-border)' } }}
                />
                <TextField
                  label="Organization"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  variant="outlined"
                  fullWidth
                  InputProps={{ sx: { color: 'var(--qt-text)' } }}
                  InputLabelProps={{ sx: { color: 'var(--qt-text-dim)' } }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--qt-border)' } }}
                />
                <TextField
                  label="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  variant="outlined"
                  fullWidth
                  InputProps={{ sx: { color: 'var(--qt-text)' } }}
                  InputLabelProps={{ sx: { color: 'var(--qt-text-dim)' } }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--qt-border)' } }}
                />
                <TextField
                  label="Bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  variant="outlined"
                  multiline
                  rows={4}
                  fullWidth
                  InputProps={{ sx: { color: 'var(--qt-text)' } }}
                  InputLabelProps={{ sx: { color: 'var(--qt-text-dim)' } }}
                  sx={{ '& .MuiOutlinedInput-notchedOutline': { borderColor: 'var(--qt-border)' } }}
                />
              </Box>
            ) : (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <WorkIcon sx={{ fontSize: 18, color: "var(--qt-text-dim)" }} />
                  <Typography variant="body1" sx={{ color: 'var(--qt-text)' }}>
                    {user?.role || <span style={{ color: 'var(--qt-text-dim)' }}>No role added</span>}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <BusinessIcon sx={{ fontSize: 18, color: "var(--qt-text-dim)" }} />
                  <Typography variant="body1" sx={{ color: 'var(--qt-text)' }}>
                    {user?.organization || <span style={{ color: 'var(--qt-text-dim)' }}>No organization added</span>}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LocationOnIcon sx={{ fontSize: 18, color: "var(--qt-text-dim)" }} />
                  <Typography variant="body1" sx={{ color: 'var(--qt-text)' }}>
                    {user?.location || <span style={{ color: 'var(--qt-text-dim)' }}>No location added</span>}
                  </Typography>
                </Box>
                
                <Typography variant="h6" sx={{ color: 'var(--qt-text)', fontWeight: 600, mt: 3, mb: 1 }}>
                  About Me
                </Typography>
                <Typography variant="body2" sx={{ color: 'var(--qt-text)', lineHeight: 1.6 }}>
                  {user?.bio || 'This user has not written a bio yet. Update your profile to add some details about your quantum journey!'}
                </Typography>
              </Box>
            )}
          </Paper>
        </Grid>

        {/* Right Column: Stats & Activity */}
        <Grid item xs={12} md={4}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            
            {/* Stats Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                background: 'var(--qt-surface-glass)',
                border: '1px solid var(--qt-border)',
                borderRadius: 4,
                backdropFilter: 'blur(12px)',
              }}
            >
              <Typography variant="h6" sx={{ color: 'var(--qt-text)', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <EmojiEventsIcon sx={{ fontSize: 20 }} /> Quantum Stats
              </Typography>
              <Divider sx={{ mb: 2, borderColor: 'var(--qt-border)' }} />
              
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'var(--qt-text-dim)' }}>Simulations Run</Typography>
                <Typography variant="body1" sx={{ color: 'var(--qt-text)', fontWeight: 600 }}>{mockStats.simulationsRun}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="body2" sx={{ color: 'var(--qt-text-dim)' }}>Circuits Saved</Typography>
                <Typography variant="body1" sx={{ color: 'var(--qt-text)', fontWeight: 600 }}>{mockStats.circuitsSaved}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ color: 'var(--qt-text-dim)' }}>Q-Tokens</Typography>
                <Typography variant="body1" sx={{ color: 'var(--qt-accent)', fontWeight: 600 }}>{mockStats.qTokens}</Typography>
              </Box>
            </Paper>

            {/* Activity Card */}
            <Paper
              elevation={0}
              sx={{
                p: 3,
                background: 'var(--qt-surface-glass)',
                border: '1px solid var(--qt-border)',
                borderRadius: 4,
                backdropFilter: 'blur(12px)',
              }}
            >
              <Typography variant="h6" sx={{ color: 'var(--qt-text)', fontWeight: 600, mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon sx={{ fontSize: 20 }} /> Recent Activity
              </Typography>
              <Divider sx={{ mb: 1, borderColor: 'var(--qt-border)' }} />
              
              <List sx={{ p: 0 }}>
                {mockActivity.map(activity => (
                  <ListItem key={activity.id} sx={{ px: 0, py: 1.5, borderBottom: '1px solid var(--qt-border)' }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      {activity.icon}
                    </ListItemIcon>
                    <ListItemText 
                      primary={activity.action}
                      secondary={activity.time}
                      primaryTypographyProps={{ variant: 'body2', color: 'var(--qt-text)' }}
                      secondaryTypographyProps={{ variant: 'caption', color: 'var(--qt-text-dim)' }}
                    />
                  </ListItem>
                ))}
              </List>
            </Paper>

          </Box>
        </Grid>

      </Grid>
    </Box>
  );
}
