import React, { useState, useMemo, useEffect, useRef } from "react";

/**
 * AmplitudeWaves - Scientifically Accurate Probability Amplitude Visualization
 * 
 * Redesigned to show:
 * 1. Probability bars (height = |α|²) for each basis state
 * 2. Phase wheels showing the complex phase angle θ = atan2(Im, Re)
 * 3. Educational tooltips explaining what each element means
 * 4. Optional Complex Plane (Argand diagram) view
 * 
 * All visual elements have clear physical meaning:
 * - Bar height = measurement probability
 * - Phase wheel angle = complex phase (relative phase between states)
 * - Color intensity = probability magnitude
 */

// Color palette for the visualization
const COLORS = {
  barHigh: "#64ffda",      // High probability - cyan glow
  barMid: "#4dd0e1",       // Medium probability
  barLow: "#1e88e5",       // Low probability - blue
  phasePositive: "#ffd54f", // Positive real component (gold)
  phaseNegative: "#ff7043", // Negative real component (coral)
  phaseBorder: "#37474f",
  background: "rgba(15, 23, 42, 0.6)",
  text: "#e0f7fa",
  textDim: "#78909c",
  glow: "rgba(100, 255, 218, 0.3)",
};

function AmplitudeWaves({ amplitudes, show }) {
  const [viewMode, setViewMode] = useState("bars"); // 'bars' | 'phasors' | 'both'
  const [hoveredState, setHoveredState] = useState(null);
  const [animationComplete, setAnimationComplete] = useState(false);
  const containerRef = useRef(null);

  // Process amplitude data
  const ampData = useMemo(() => {
    if (!amplitudes) return [];
    
    return Object.entries(amplitudes)
      .map(([state, { re, im, prob }]) => {
        const magnitude = Math.sqrt(re * re + im * im);
        const phase = Math.atan2(im, re); // Range: [-π, π]
        const phaseDeg = (phase * 180) / Math.PI;
        
        return {
          state,
          re: re || 0,
          im: im || 0,
          prob: prob || 0,
          magnitude,
          phase,
          phaseDeg,
        };
      })
      .sort((a, b) => b.prob - a.prob) // Sort by probability
      .slice(0, 16); // Limit to top 16 states for clarity
  }, [amplitudes]);

  // Trigger animation on mount
  useEffect(() => {
    if (show) {
      setAnimationComplete(false);
      const timer = setTimeout(() => setAnimationComplete(true), 50);
      return () => clearTimeout(timer);
    }
  }, [show, amplitudes]);

  if (!show || !ampData.length) return null;

  const maxProb = Math.max(...ampData.map(a => a.prob), 0.001);
  const maxMag = Math.max(...ampData.map(a => a.magnitude), 0.001);

  // Get bar color based on probability
  const getBarColor = (prob) => {
    const ratio = prob / maxProb;
    if (ratio > 0.7) return COLORS.barHigh;
    if (ratio > 0.3) return COLORS.barMid;
    return COLORS.barLow;
  };

  // Get phase wheel color based on phase
  const getPhaseColor = (phase) => {
    // Gold for 0, transitioning through to coral for ±π
    const normalizedPhase = Math.abs(phase) / Math.PI;
    if (normalizedPhase < 0.25) return "#64ffda"; // Near 0: cyan
    if (normalizedPhase < 0.5) return "#ffd54f";  // π/4 to π/2: gold
    if (normalizedPhase < 0.75) return "#ff9800"; // π/2 to 3π/4: orange
    return "#ff7043"; // Near ±π: coral
  };

  return (
    <div 
      ref={containerRef}
      style={{
        background: "linear-gradient(145deg, rgba(15,23,42,0.95), rgba(30,41,59,0.9))",
        borderRadius: 16,
        border: "1px solid rgba(100,255,218,0.15)",
        padding: "20px 24px",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Header with view toggle */}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: 16
      }}>
        <div>
          <h3 style={{ 
            margin: 0, 
            fontSize: 15, 
            fontWeight: 600, 
            color: COLORS.text,
            letterSpacing: 0.3
          }}>
            Probability Amplitudes
          </h3>
          <p style={{ 
            margin: "4px 0 0", 
            fontSize: 11, 
            color: COLORS.textDim 
          }}>
            Each bar shows measurement probability |α|², phase wheel shows complex phase θ
          </p>
        </div>
        
        <div style={{ display: "flex", gap: 6 }}>
          {["bars", "phasors", "both"].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              style={{
                background: viewMode === mode 
                  ? "linear-gradient(135deg, #1e88e5, #1565c0)" 
                  : "rgba(30,41,59,0.8)",
                border: `1px solid ${viewMode === mode ? "#42a5f5" : "#475569"}`,
                color: viewMode === mode ? "#fff" : COLORS.textDim,
                fontSize: 10,
                fontWeight: 600,
                padding: "5px 10px",
                borderRadius: 6,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.2s ease",
              }}
            >
              {mode === "phasors" ? "Complex" : mode}
            </button>
          ))}
        </div>
      </div>

      {/* Bar Chart View */}
      {(viewMode === "bars" || viewMode === "both") && (
        <div style={{
          background: "rgba(15,23,42,0.5)",
          borderRadius: 12,
          padding: 16,
          border: "1px solid rgba(71,85,105,0.3)",
          marginBottom: viewMode === "both" ? 16 : 0,
        }}>
          {/* Bar chart container */}
          <div style={{
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            gap: ampData.length > 8 ? 4 : 8,
            height: 140,
            padding: "0 8px",
          }}>
            {ampData.map((amp, idx) => {
              const barHeight = (amp.prob / maxProb) * 100;
              const isHovered = hoveredState === amp.state;
              const barColor = getBarColor(amp.prob);
              
              return (
                <div 
                  key={amp.state}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flex: "1 1 0",
                    maxWidth: 60,
                    minWidth: 28,
                  }}
                  onMouseEnter={() => setHoveredState(amp.state)}
                  onMouseLeave={() => setHoveredState(null)}
                >
                  {/* Probability percentage on top */}
                  <div style={{
                    fontSize: 9,
                    fontWeight: 600,
                    color: isHovered ? COLORS.barHigh : COLORS.textDim,
                    marginBottom: 4,
                    opacity: amp.prob > 0.001 ? 1 : 0.5,
                    transition: "all 0.2s ease",
                  }}>
                    {(amp.prob * 100).toFixed(1)}%
                  </div>
                  
                  {/* Bar */}
                  <div style={{
                    width: "100%",
                    height: 100,
                    display: "flex",
                    alignItems: "flex-end",
                    position: "relative",
                  }}>
                    <div 
                      style={{
                        width: "100%",
                        height: animationComplete ? `${Math.max(barHeight, 2)}%` : "0%",
                        background: `linear-gradient(180deg, ${barColor}, ${barColor}88)`,
                        borderRadius: "4px 4px 0 0",
                        boxShadow: isHovered 
                          ? `0 0 16px ${barColor}66, inset 0 1px 0 rgba(255,255,255,0.2)` 
                          : `0 0 8px ${barColor}33`,
                        transition: `height 0.6s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.05}s, box-shadow 0.2s ease`,
                        transform: isHovered ? "scaleX(1.1)" : "scaleX(1)",
                        transformOrigin: "bottom center",
                      }}
                    />
                  </div>

                  {/* Phase wheel */}
                  <div style={{
                    width: 24,
                    height: 24,
                    marginTop: 6,
                    position: "relative",
                    opacity: amp.prob > 0.001 ? 1 : 0.3,
                  }}>
                    <PhaseWheel 
                      phase={amp.phase} 
                      magnitude={amp.magnitude / maxMag}
                      color={getPhaseColor(amp.phase)}
                      isHovered={isHovered}
                    />
                  </div>
                  
                  {/* State label */}
                  <div style={{
                    fontSize: 10,
                    fontWeight: 600,
                    color: isHovered ? COLORS.barHigh : "#90caf9",
                    marginTop: 4,
                    fontFamily: '"Courier New", monospace',
                    letterSpacing: -0.5,
                    transition: "color 0.2s ease",
                  }}>
                    |{amp.state}⟩
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div style={{
            display: "flex",
            justifyContent: "center",
            gap: 20,
            marginTop: 14,
            borderTop: "1px solid rgba(71,85,105,0.3)",
            paddingTop: 12,
          }}>
            <LegendItem 
              color={COLORS.barHigh} 
              label="High probability" 
            />
            <LegendItem 
              color={COLORS.barLow} 
              label="Low probability" 
            />
            <LegendItem 
              icon="◐" 
              label="Phase wheel: complex phase angle θ" 
            />
          </div>
        </div>
      )}

      {/* Complex Plane (Phasor) View */}
      {(viewMode === "phasors" || viewMode === "both") && (
        <ComplexPlaneView 
          ampData={ampData}
          maxMag={maxMag}
          hoveredState={hoveredState}
          setHoveredState={setHoveredState}
          animationComplete={animationComplete}
        />
      )}

      {/* Tooltip for hovered state */}
      {hoveredState && (
        <HoverTooltip 
          amp={ampData.find(a => a.state === hoveredState)}
        />
      )}

      {/* Educational footer */}
      <div style={{
        marginTop: 14,
        padding: "10px 12px",
        background: "rgba(30,41,59,0.5)",
        borderRadius: 8,
        border: "1px solid rgba(71,85,105,0.2)",
      }}>
        <div style={{ fontSize: 10, color: COLORS.textDim, lineHeight: 1.5 }}>
          <strong style={{ color: "#64ffda" }}>Understanding:</strong>{" "}
          Bar height shows the <strong>probability</strong> of measuring that state. 
          The phase wheel shows the <strong>complex phase</strong> (θ) of the amplitude — 
          phases determine how states interfere in quantum algorithms.
        </div>
      </div>
    </div>
  );
}

// Phase Wheel Component - Shows complex phase as a circular indicator
function PhaseWheel({ phase, magnitude, color, isHovered }) {
  // Convert phase to rotation angle (0° at top, clockwise)
  const rotation = (phase * 180) / Math.PI;
  
  return (
    <svg 
      width="24" 
      height="24" 
      viewBox="0 0 24 24"
      style={{
        transition: "transform 0.2s ease",
        transform: isHovered ? "scale(1.2)" : "scale(1)",
      }}
    >
      {/* Background circle */}
      <circle
        cx="12"
        cy="12"
        r="10"
        fill="rgba(15,23,42,0.8)"
        stroke="rgba(71,85,105,0.5)"
        strokeWidth="1"
      />
      
      {/* Magnitude ring (proportional to |α|) */}
      <circle
        cx="12"
        cy="12"
        r={8 * magnitude}
        fill={`${color}22`}
        stroke={color}
        strokeWidth="1.5"
        opacity="0.6"
      />
      
      {/* Phase arrow */}
      <line
        x1="12"
        y1="12"
        x2="12"
        y2="4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        style={{
          transform: `rotate(${rotation}deg)`,
          transformOrigin: "12px 12px",
          filter: `drop-shadow(0 0 3px ${color})`,
        }}
      />
      
      {/* Center dot */}
      <circle
        cx="12"
        cy="12"
        r="2"
        fill={color}
      />
    </svg>
  );
}

// Complex Plane (Argand Diagram) View
function ComplexPlaneView({ ampData, maxMag, hoveredState, setHoveredState, animationComplete }) {
  const size = 200;
  const center = size / 2;
  const scale = (size / 2 - 20) / maxMag;

  return (
    <div style={{
      background: "rgba(15,23,42,0.5)",
      borderRadius: 12,
      padding: 16,
      border: "1px solid rgba(71,85,105,0.3)",
    }}>
      <div style={{
        fontSize: 11,
        fontWeight: 600,
        color: COLORS.textDim,
        marginBottom: 10,
        textAlign: "center",
      }}>
        Complex Plane (Argand Diagram)
      </div>
      
      <svg 
        width={size} 
        height={size} 
        viewBox={`0 0 ${size} ${size}`}
        style={{ display: "block", margin: "0 auto" }}
      >
        {/* Grid */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(71,85,105,0.2)" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width={size} height={size} fill="url(#grid)" rx="8" />
        
        {/* Axes */}
        <line x1="0" y1={center} x2={size} y2={center} stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
        <line x1={center} y1="0" x2={center} y2={size} stroke="rgba(148,163,184,0.4)" strokeWidth="1" />
        
        {/* Axis labels */}
        <text x={size - 15} y={center - 5} fontSize="10" fill="#90caf9">Re</text>
        <text x={center + 5} y="15" fontSize="10" fill="#90caf9">Im</text>
        
        {/* Unit circle */}
        <circle
          cx={center}
          cy={center}
          r={scale}
          fill="none"
          stroke="rgba(100,255,218,0.2)"
          strokeWidth="1"
          strokeDasharray="4 4"
        />
        
        {/* Amplitude vectors */}
        {ampData.map((amp, idx) => {
          const x = center + amp.re * scale;
          const y = center - amp.im * scale; // Flip y for standard math orientation
          const isHovered = hoveredState === amp.state;
          
          return (
            <g 
              key={amp.state}
              onMouseEnter={() => setHoveredState(amp.state)}
              onMouseLeave={() => setHoveredState(null)}
              style={{ cursor: "pointer" }}
            >
              {/* Vector line */}
              <line
                x1={center}
                y1={center}
                x2={animationComplete ? x : center}
                y2={animationComplete ? y : center}
                stroke={isHovered ? "#64ffda" : "#4dd0e1"}
                strokeWidth={isHovered ? 2.5 : 1.5}
                strokeOpacity={0.8}
                style={{
                  transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.05}s`,
                  filter: isHovered ? "drop-shadow(0 0 4px #64ffda)" : "none",
                }}
              />
              
              {/* Endpoint circle */}
              <circle
                cx={animationComplete ? x : center}
                cy={animationComplete ? y : center}
                r={isHovered ? 6 : 4}
                fill={isHovered ? "#64ffda" : "#4dd0e1"}
                stroke="#0f172a"
                strokeWidth="1"
                style={{
                  transition: `all 0.5s cubic-bezier(0.4, 0, 0.2, 1) ${idx * 0.05}s`,
                  filter: isHovered ? "drop-shadow(0 0 6px #64ffda)" : "none",
                }}
              />
              
              {/* State label (on hover) */}
              {isHovered && (
                <text
                  x={x + 8}
                  y={y - 8}
                  fontSize="10"
                  fontWeight="600"
                  fill="#64ffda"
                  style={{ fontFamily: '"Courier New", monospace' }}
                >
                  |{amp.state}⟩
                </text>
              )}
            </g>
          );
        })}
      </svg>
      
      <div style={{
        fontSize: 10,
        color: COLORS.textDim,
        textAlign: "center",
        marginTop: 10,
      }}>
        Each arrow represents a complex amplitude α = Re + i·Im
      </div>
    </div>
  );
}

// Legend Item
function LegendItem({ color, icon, label }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      {color && (
        <div style={{
          width: 12,
          height: 12,
          borderRadius: 3,
          background: color,
          boxShadow: `0 0 6px ${color}66`,
        }} />
      )}
      {icon && (
        <span style={{ fontSize: 12, color: "#90caf9" }}>{icon}</span>
      )}
      <span style={{ fontSize: 10, color: COLORS.textDim }}>{label}</span>
    </div>
  );
}

// Hover Tooltip
function HoverTooltip({ amp }) {
  if (!amp) return null;
  
  return (
    <div style={{
      marginTop: 12,
      padding: "10px 14px",
      background: "linear-gradient(135deg, rgba(30,41,59,0.95), rgba(15,23,42,0.95))",
      borderRadius: 10,
      border: "1px solid #64ffda44",
      boxShadow: "0 4px 16px rgba(0,0,0,0.3)",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        marginBottom: 8,
      }}>
        <span style={{
          fontSize: 14,
          fontWeight: 700,
          color: "#64ffda",
          fontFamily: '"Courier New", monospace',
        }}>
          |{amp.state}⟩
        </span>
        <span style={{
          fontSize: 11,
          color: "#90caf9",
          background: "rgba(100,255,218,0.1)",
          padding: "2px 8px",
          borderRadius: 4,
        }}>
          Probability: {(amp.prob * 100).toFixed(2)}%
        </span>
      </div>
      
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: 10,
        fontSize: 11,
      }}>
        <div>
          <div style={{ color: COLORS.textDim, fontSize: 9 }}>Real(α)</div>
          <div style={{ color: "#e0f7fa", fontWeight: 600 }}>{amp.re.toFixed(4)}</div>
        </div>
        <div>
          <div style={{ color: COLORS.textDim, fontSize: 9 }}>Imag(α)</div>
          <div style={{ color: "#e0f7fa", fontWeight: 600 }}>{amp.im.toFixed(4)}</div>
        </div>
        <div>
          <div style={{ color: COLORS.textDim, fontSize: 9 }}>|α|</div>
          <div style={{ color: "#e0f7fa", fontWeight: 600 }}>{amp.magnitude.toFixed(4)}</div>
        </div>
        <div>
          <div style={{ color: COLORS.textDim, fontSize: 9 }}>Phase θ</div>
          <div style={{ color: "#e0f7fa", fontWeight: 600 }}>{amp.phaseDeg.toFixed(1)}°</div>
        </div>
      </div>
    </div>
  );
}

export default AmplitudeWaves;