import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import QuantumCodeEditor from '../Components/QuantumCodeEditor';
import logoNew from '../assets/logo_new.png';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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

  return (
    <div style={{ display: 'flex', minHeight: '100vh', fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif', margin: 0, padding: 0 }}>
      {/* Left Panel - Dark Mode */}
      <div className="d-none d-lg-flex" style={{ 
        flex: 1, 
        backgroundColor: '#0a0a0a', 
        color: 'white',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Subtle background circles */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          height: '600px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.05)',
          zIndex: 0
        }}></div>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.03)',
          zIndex: 0
        }}></div>

        <div style={{ zIndex: 1, width: '100%', maxWidth: '600px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p style={{ color: '#a0a0a0', fontSize: '14px', marginBottom: '40px', textAlign: 'center' }}>
            Interactive, intelligent platform for quantum education.
          </p>
          
          <h1 style={{ fontSize: '42px', fontWeight: 700, marginBottom: '60px', textAlign: 'center', lineHeight: 1.2 }}>
            AI-Powered Quantum Computing<br/>Learning Platform
          </h1>

          <QuantumCodeEditor />
        </div>
      </div>

      {/* Right Panel - Light Mode */}
      <div style={{ 
        flex: 1, 
        backgroundColor: '#ffffff', 
        color: '#000000',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        borderRadius: '32px 0 0 32px',
        marginLeft: '-32px',
        zIndex: 10,
        boxShadow: '-10px 0 30px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '40px' }}>
          <div>
            <img src={logoNew} alt="Qubit Tracer Logo" style={{ height: '40px', objectFit: 'contain' }} />
          </div>
          <Link to="/login" state={{ from: location.state?.from }} style={{ textDecoration: 'none', color: '#555', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', fontWeight: 500 }}>
             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
             Sign In
          </Link>
        </div>

        {/* Form Container */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '0 40px' }}>
          <div style={{ width: '100%', maxWidth: '400px' }}>
            <h2 style={{ fontSize: '32px', fontWeight: 600, marginBottom: '40px', textAlign: 'center' }}>Create Account</h2>

            {error && <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '14px' }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '24px',
                    border: '1px solid #e0e0e0',
                    outline: 'none',
                    fontSize: '15px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4285f4'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <div>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '24px',
                    border: '1px solid #e0e0e0',
                    outline: 'none',
                    fontSize: '15px',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4285f4'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
              </div>

              <div style={{ position: 'relative' }}>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  required
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: '24px',
                    border: '1px solid #e0e0e0',
                    outline: 'none',
                    fontSize: '15px',
                    transition: 'border-color 0.2s',
                    paddingRight: '48px'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#4285f4'}
                  onBlur={(e) => e.target.style.borderColor = '#e0e0e0'}
                />
                <button type="button" style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                </button>
              </div>

              <button type="submit" disabled={isSubmitting} style={{
                backgroundColor: '#4285f4',
                color: 'white',
                border: 'none',
                borderRadius: '24px',
                padding: '16px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '8px',
                marginTop: '10px',
                boxShadow: '0 4px 14px rgba(66, 133, 244, 0.4)',
                transition: 'transform 0.1s'
              }}
              onMouseDown={e => e.currentTarget.style.transform = 'scale(0.98)'}
              onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >
                {isSubmitting ? 'Creating Account...' : 'Sign Up'}
                {!isSubmitting && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>}
              </button>
            </form>
            
            <div style={{ display: 'flex', gap: '16px', marginTop: '30px' }}>
              <button style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', borderRadius: '24px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                Sign in with Google
              </button>
              <button style={{ flex: 1, padding: '12px', border: '1px solid #e0e0e0', borderRadius: '24px', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', fontWeight: 500 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
                GitHub
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', color: '#888' }}>
          <div>© 2005-2026 Qubit Tracer Inc.</div>
          <div style={{ display: 'flex', gap: '20px' }}>
            <a href="#" style={{ color: '#888', textDecoration: 'none' }}>Contact Us</a>
            <a href="#" style={{ color: '#888', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
              English
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

