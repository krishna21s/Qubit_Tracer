import React, { useState, useContext } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ColorModeContext } from '../theme';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { mode } = useContext(ColorModeContext);
  
  const isDark = mode === 'dark';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const result = await signup(username, email, password);
      if (result.success) {
        const from = location.state?.from;
        const target = from ? (from.pathname + (from.search || '')) : '/';
        navigate(target, { replace: true });
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'Registration error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerStyle = {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: isDark 
      ? 'radial-gradient(circle at bottom left, #15659c 0%, #07131d 40%, #0d2533 100%)'
      : 'radial-gradient(circle at bottom left, #4cc3fa 0%, #f5f9fc 40%, #e9f3fa 100%)',
    position: 'relative',
    overflow: 'hidden'
  };

  const glassCardStyle = {
    width: '100%',
    maxWidth: '420px',
    padding: '40px',
    background: isDark ? 'rgba(15, 31, 44, 0.6)' : 'rgba(255, 255, 255, 0.7)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderRadius: '24px',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(255, 255, 255, 0.4)',
    boxShadow: isDark ? '0 8px 32px 0 rgba(0, 0, 0, 0.37)' : '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
    color: isDark ? '#ffffff' : '#000000',
    zIndex: 1
  };

  const inputStyle = {
    background: isDark ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.5)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(0, 0, 0, 0.1)',
    color: isDark ? '#ffffff' : '#000000',
    borderRadius: '12px',
    padding: '12px 16px',
    transition: 'all 0.3s ease'
  };

  const buttonStyle = {
    background: isDark ? 'linear-gradient(90deg, #15659c, #4cc3fa)' : 'linear-gradient(90deg, #1271e0, #4cc3fa)',
    border: 'none',
    borderRadius: '12px',
    padding: '12px',
    color: '#fff',
    fontWeight: '600',
    letterSpacing: '0.5px',
    boxShadow: '0 4px 15px rgba(76, 195, 250, 0.4)',
    transition: 'all 0.3s ease'
  };

  return (
    <div style={containerStyle}>
      {/* Abstract background shapes */}
      <div style={{
        position: 'absolute', top: '10%', right: '15%', width: '300px', height: '300px',
        background: isDark ? '#15659c' : '#4cc3fa', filter: 'blur(100px)', opacity: 0.5, borderRadius: '50%'
      }} />
      <div style={{
        position: 'absolute', bottom: '10%', left: '15%', width: '350px', height: '350px',
        background: isDark ? '#4cc3fa' : '#1271e0', filter: 'blur(120px)', opacity: 0.3, borderRadius: '50%'
      }} />

      <div style={glassCardStyle}>
        <div className="text-center mb-4">
          <h2 style={{ fontWeight: 700, letterSpacing: '-0.5px', marginBottom: '8px' }}>Create Account</h2>
          <p style={{ opacity: 0.7, fontSize: '14px' }}>Join Qubit-Tracer today</p>
        </div>
        
        {error && <div className="alert alert-danger" style={{ borderRadius: '12px', fontSize: '14px' }}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, opacity: 0.8, marginLeft: '4px' }}>Username</label>
            <input 
              type="text" 
              className="form-control"
              style={inputStyle}
              value={username} 
              onChange={(e) => setUsername(e.target.value)} 
              required 
              placeholder="quantum_coder"
            />
          </div>

          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, opacity: 0.8, marginLeft: '4px' }}>Email address</label>
            <input 
              type="email" 
              className="form-control"
              style={inputStyle}
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
              placeholder="name@example.com"
            />
          </div>
          
          <div className="mb-4">
            <label className="form-label" style={{ fontSize: '13px', fontWeight: 600, opacity: 0.8, marginLeft: '4px' }}>Password</label>
            <input 
              type="password" 
              className="form-control"
              style={inputStyle}
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
              placeholder="••••••••"
            />
          </div>
          
          <button type="submit" className="btn w-100 mt-2" style={buttonStyle} disabled={isSubmitting}>
            {isSubmitting ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="mt-4 text-center">
          <p style={{ fontSize: '14px', opacity: 0.8 }}>
            Already have an account? <Link to="/login" state={{ from: location.state?.from }} style={{ color: isDark ? '#4cc3fa' : '#1271e0', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
