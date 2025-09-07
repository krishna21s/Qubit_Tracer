import React, { useState, useEffect } from 'react';
import QubitTracerLogo from '../assets/qubit_tracer_logo.png';
/**
 * SplashScreen
 * - Visuals updated to match site palette (see src/index.css variables)
 * - Transitions kept smooth and professional; timings unchanged
 * - No logic or external code touched — drop-in replacement
 */
const SplashScreen = ({ onComplete }) => {
  const [showLogo, setShowLogo] = useState(false);
  const [showTitle, setShowTitle] = useState(false);
  const [showLine, setShowLine] = useState(false);
  const [showTagline, setShowTagline] = useState(false);
  const [showPoweredBy, setShowPoweredBy] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => setShowLogo(true), 300);
    const timer2 = setTimeout(() => setShowTitle(true), 1000);
    const timer3 = setTimeout(() => setShowLine(true), 1500);
    const timer4 = setTimeout(() => setShowTagline(true), 2000);
    const timer5 = setTimeout(() => setShowPoweredBy(true), 2500);
    const timer6 = setTimeout(() => onComplete?.(), 4000);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
      clearTimeout(timer4);
      clearTimeout(timer5);
      clearTimeout(timer6);
    };
  }, [onComplete]);

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center"
      style={{
        // Matches app body gradient in index.css
        background: 'linear-gradient(180deg, var(--bg-900), #020f16)',
        zIndex: 999999
      }}
    >
      {/* Animated Background Grid (subtle, in brand accent) */}
      <div
        className="position-absolute top-0 start-0 w-100 h-100"
        style={{ opacity: 0.12, pointerEvents: 'none' }}
      >
        <div
          className="position-absolute top-0 start-0 w-100 h-100"
          style={{
            backgroundImage: `
              linear-gradient(rgba(92, 193, 255, 0.10) 1px, transparent 1px),
              linear-gradient(90deg, rgba(92, 193, 255, 0.10) 1px, transparent 1px)
            `,
            backgroundSize: '48px 48px',
            animation: 'grid-move 22s linear infinite'
          }}
        />
      </div>

      {/* Logo */}
      <div
        className={`mb-5 transition-all ${showLogo ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
        style={{
          transition: 'all 900ms cubic-bezier(.2,.8,.2,1)',
          opacity: showLogo ? 1 : 0,
          transform: showLogo ? 'scale(1)' : 'scale(0.5)'
        }}
      >
        <div className="position-relative">
          <div
            className="d-flex align-items-center justify-content-center rounded-circle overflow-hidden shadow-lg"
            style={{
              width: '8rem',
              height: '8rem',
              border: '4px solid rgba(92,193,255,0.28)', // var(--accent-500)
              boxShadow: '0 10px 28px rgba(2,8,15,0.45)'
            }}
          >
            <img
              src={QubitTracerLogo}
              alt="Qubit-Tracer Logo"
              className="w-100 h-100"
              style={{
                objectFit: 'cover',
                filter: 'drop-shadow(0 0 22px rgba(92, 193, 255, 0.65))',
                animation: 'logoFlip 4s ease-in-out infinite, logoGlow 3s ease-in-out infinite'
              }}
            />
          </div>

          {/* Soft colored glow layers */}
          <div
            className="position-absolute top-0 start-0 rounded-circle"
            style={{
              width: '8rem',
              height: '8rem',
              background: 'linear-gradient(135deg, #1781cc, #12649f)', // matches buttons
              opacity: 0.28,
              filter: 'blur(20px)',
              animation: 'pulse 2.2s ease-in-out infinite'
            }}
          />
          <div
            className="position-absolute top-0 start-0 rounded-circle"
            style={{
              width: '8rem',
              height: '8rem',
              background: 'linear-gradient(135deg, #5cc1ff, #9fddff)', // accent gradient
              opacity: 0.14,
              animation: 'ping 2.4s ease-out infinite'
            }}
          />
        </div>
      </div>

      {/* Title */}
      <div
        className="mb-4"
        style={{
          transition: 'all 900ms cubic-bezier(.2,.8,.2,1)',
          opacity: showTitle ? 1 : 0,
          transform: showTitle ? 'translateY(0)' : 'translateY(16px)'
        }}
      >
        <h1
          className="fw-bold text-center"
          style={{
            fontSize: '2.4rem',
            letterSpacing: '1.6px',
            margin: 0,
            // gradient text in brand palette
            backgroundImage: 'linear-gradient(90deg, #9fddff, #5cc1ff, #66d8ff)',
            WebkitBackgroundClip: 'text',
            color: 'transparent',
            whiteSpace: 'nowrap',
            textShadow: '0 2px 14px rgba(2,8,15,0.45)'
          }}
        >
          Qubit‑Tracer
        </h1>
      </div>

      {/* Animated Line */}
      <div className="position-relative mb-4 w-100" style={{ maxWidth: '40rem', height: '4px' }}>
        <div
          className="position-absolute top-0 start-0 h-100"
          style={{
            transition: 'width 1100ms cubic-bezier(.2,.8,.2,1)',
            width: showLine ? '100%' : '0%',
            background: 'linear-gradient(90deg, #66d8ff, #1781cc, #12649f)',
            boxShadow: '0 0 22px rgba(102,216,255,0.55)',
            borderRadius: '2px'
          }}
        />
        <div
          className="position-absolute top-0 start-0 h-100"
          style={{
            transition: 'width 1100ms cubic-bezier(.2,.8,.2,1)',
            width: showLine ? '100%' : '0%',
            background: 'linear-gradient(90deg, #66d8ff, #1781cc, #12649f)',
            opacity: 0.35,
            filter: 'blur(5px)',
            borderRadius: '2px'
          }}
        />
      </div>

      {/* Tagline */}
      <div
        className="mb-5"
        style={{
          transition: 'all 800ms cubic-bezier(.2,.8,.2,1)',
          opacity: showTagline ? 1 : 0,
          transform: showTagline ? 'translateY(0)' : 'translateY(10px)'
        }}
      >
        <p
          className="text-center fw-semibold"
          style={{
            fontSize: '1.15rem',
            color: '#cfefff',
            letterSpacing: '0.8px',
            fontFamily: 'Inter, system-ui, sans-serif',
            margin: 0
          }}
        >
          From Circuits to Spheres, Quantum Made Clear
        </p>
      </div>

      {/* Powered By */}
      <div
        className="position-absolute bottom-0 mb-4"
        style={{
          transition: 'all 700ms cubic-bezier(.2,.8,.2,1)',
          opacity: showPoweredBy ? 1 : 0,
          transform: showPoweredBy ? 'translateY(0)' : 'translateY(8px)'
        }}
      >
        <p
          className="text-center"
          style={{
            fontSize: '0.9rem',
            color: '#7fb5d9',
            letterSpacing: '1px',
            fontFamily: 'Inter, system-ui, sans-serif',
            margin: 0
          }}
        >
          Powered by <span style={{ color: '#5cc1ff', fontWeight: 700 }}>Qubit‑Tracer</span>
        </p>
      </div>

      {/* Floating Particles (refined to match theme) */}
      <div className="position-absolute top-0 start-0 w-100 h-100 overflow-hidden" style={{ pointerEvents: 'none' }}>
        {[...Array(24)].map((_, i) => (
          <div
            key={i}
            className="position-absolute rounded-circle"
            style={{
              width: '4px',
              height: '4px',
              backgroundColor: '#cfefff',
              opacity: 0.55,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`,
              boxShadow: '0 0 8px rgba(102,216,255,0.35)'
            }}
          />
        ))}
      </div>

      {/* Local keyframes to avoid touching global CSS */}
      <style>{`
        @keyframes grid-move {
          0%   { transform: translate(0, 0); }
          100% { transform: translate(48px, 48px); }
        }
        @keyframes twinkle {
          0%, 100% { opacity: 0.35; transform: scale(0.85); }
          50% { opacity: 1; transform: scale(1.15); }
        }
        @keyframes logoGlow {
          0%, 100% {
            filter: drop-shadow(0 0 22px rgba(102, 216, 255, 0.7));
            transform: scale(1);
          }
          50% {
            filter: drop-shadow(0 0 32px rgba(102, 216, 255, 0.95));
            transform: scale(1.04);
          }
        }
        @keyframes logoFlip {
          0%, 100% { transform: rotateY(0deg) rotateX(0deg); }
          25%      { transform: rotateY(180deg) rotateX(0deg); }
          50%      { transform: rotateY(180deg) rotateX(180deg); }
          75%      { transform: rotateY(0deg) rotateX(180deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.28; }
          50%      { transform: scale(1.06); opacity: 0.38; }
        }
        @keyframes ping {
          0%   { transform: scale(1); opacity: 0.14; }
          80%  { transform: scale(1.14); opacity: 0; }
          100% { transform: scale(1.14); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default SplashScreen;