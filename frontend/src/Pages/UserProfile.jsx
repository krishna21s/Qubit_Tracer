import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import '../styles/dashboardCards.css';

export default function UserProfile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [bio, setBio] = useState('');
  const [organization, setOrganization] = useState('');
  const [role, setRole] = useState('');
  const [location, setLocation] = useState('');

  // Profile Picture State
  const [profilePic, setProfilePic] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setBio(user.bio || '');
      setOrganization(user.organization || '');
      setRole(user.role || '');
      setLocation(user.location || '');
      
      const storedPic = localStorage.getItem(`qt_profile_pic_${user.id}`);
      if (storedPic) {
        setProfilePic(storedPic);
      }
    }
  }, [user]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProfilePic(base64String);
        if (user) {
          localStorage.setItem(`qt_profile_pic_${user.id}`, base64String);
          // Dispatch custom event to notify other components instantly
          window.dispatchEvent(new Event('qt_profile_pic_updated'));
        }
      };
      reader.readAsDataURL(file);
    }
  };

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

  if (!user) return <div style={{ padding: '2rem' }}>Loading profile...</div>;

  return (
    <div className="lp-dashboard-root" style={{ padding: '2rem' }}>
      
      {/* Banner & Header */}
      <section className="lp-panel" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ height: '160px', background: 'var(--qt-accent)' }}></div>
        <div style={{ padding: '0 2rem 2rem 2rem', display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '-60px' }}>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div style={{ position: 'relative' }}>
              <div 
                className="lp-avatar-container"
                style={{
                  width: '120px', height: '120px', borderRadius: '50%', 
                  background: profilePic ? `url(${profilePic}) center/cover` : 'var(--qt-surface-alt)',
                  border: '4px solid var(--qt-surface)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '3rem', fontWeight: 'bold', color: 'var(--qt-text-dim)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onClick={() => fileInputRef.current.click()}
              >
                {!profilePic && user.username.charAt(0).toUpperCase()}
                
                {/* Hover overlay for upload hint */}
                <div className="lp-avatar-overlay" style={{
                  position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                  background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontSize: '0.8rem', opacity: 0, transition: 'opacity 0.2s'
                }}>
                  Upload
                </div>
              </div>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} style={{ display: 'none' }} />
            </div>
            
            {!isEditing ? (
              <button className="lp-btn-primary" onClick={() => setIsEditing(true)}>Edit Profile</button>
            ) : (
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="lp-btn-ghost" onClick={() => setIsEditing(false)}>Cancel</button>
                <button className="lp-btn-primary" onClick={handleSave} disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </div>

          <div>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: '600' }}>{user.username}</h1>
            <p style={{ margin: 0, color: 'var(--qt-text-dim)' }}>{user.email}</p>
          </div>
        </div>
      </section>

      {/* Info Grid */}
      <div className="lp-middle-grid">
        {/* About Section */}
        <section className="lp-panel">
          <div className="lp-panel-header">
            <h2>About</h2>
            <p>Your public information</p>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {isEditing ? (
              <>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--qt-text-dim)' }}>Bio</label>
                  <textarea 
                    value={bio} onChange={e => setBio(e.target.value)}
                    style={{ background: 'var(--qt-surface-alt)', border: '1px solid var(--qt-border)', padding: '0.75rem', borderRadius: '12px', color: 'var(--qt-text)', resize: 'vertical', minHeight: '80px', fontFamily: 'inherit' }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--qt-text-dim)' }}>Organization</label>
                    <input type="text" value={organization} onChange={e => setOrganization(e.target.value)}
                      style={{ background: 'var(--qt-surface-alt)', border: '1px solid var(--qt-border)', padding: '0.75rem', borderRadius: '12px', color: 'var(--qt-text)', width: '100%' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--qt-text-dim)' }}>Role</label>
                    <input type="text" value={role} onChange={e => setRole(e.target.value)}
                      style={{ background: 'var(--qt-surface-alt)', border: '1px solid var(--qt-border)', padding: '0.75rem', borderRadius: '12px', color: 'var(--qt-text)', width: '100%' }} />
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <label style={{ fontSize: '0.85rem', color: 'var(--qt-text-dim)' }}>Location</label>
                  <input type="text" value={location} onChange={e => setLocation(e.target.value)}
                    style={{ background: 'var(--qt-surface-alt)', border: '1px solid var(--qt-border)', padding: '0.75rem', borderRadius: '12px', color: 'var(--qt-text)', width: '100%' }} />
                </div>
              </>
            ) : (
              <>
                <p style={{ color: bio ? 'var(--qt-text)' : 'var(--qt-text-dim)', lineHeight: 1.6, margin: 0 }}>
                  {bio || 'No bio provided. Click Edit Profile to add one.'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  <div style={{ background: 'var(--qt-surface-alt)', padding: '1rem', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--qt-text-dim)', marginBottom: '0.25rem' }}>Organization</div>
                    <div style={{ fontWeight: 500 }}>{organization || '-'}</div>
                  </div>
                  <div style={{ background: 'var(--qt-surface-alt)', padding: '1rem', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--qt-text-dim)', marginBottom: '0.25rem' }}>Role</div>
                    <div style={{ fontWeight: 500 }}>{role || '-'}</div>
                  </div>
                  <div style={{ background: 'var(--qt-surface-alt)', padding: '1rem', borderRadius: '16px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--qt-text-dim)', marginBottom: '0.25rem' }}>Location</div>
                    <div style={{ fontWeight: 500 }}>{location || '-'}</div>
                  </div>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Stats Section */}
        <section className="lp-panel">
          <div className="lp-panel-header">
            <h2>Activity Stats</h2>
            <p>Your performance overview</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--qt-border)', borderRadius: '16px' }}>
              <span style={{ color: 'var(--qt-text-dim)' }}>Simulations Run</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>142</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--qt-border)', borderRadius: '16px' }}>
              <span style={{ color: 'var(--qt-text-dim)' }}>Circuits Saved</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>38</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--qt-border)', borderRadius: '16px' }}>
              <span style={{ color: 'var(--qt-text-dim)' }}>Q-Tokens</span>
              <span style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--qt-accent)' }}>1,500</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
