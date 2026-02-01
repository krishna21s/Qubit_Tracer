import React, { useMemo, useState, useRef } from 'react';
import AmplitudeWaves from './AmplitudeWaves';
import ProbabilityDistribution from './ProbabilityDistribution';
import '../styles/inspectorTheme.css';

/**
 * Inspector - Enhanced Quantum State Visualization
 * 
 * Features:
 * - Clean visual hierarchy with collapsible sections
 * - Educational tooltips explaining quantum concepts
 * - Interactive elements with smooth animations
 * - Real-time data from simulation results
 */

// Educational tooltips for each section
const SECTION_INFO = {
  qasm: "OpenQASM is the assembly language for quantum circuits. Each line represents a gate operation on specific qubits.",
  bloch: "The Bloch sphere represents a single qubit's state. |r| = 1 means pure state, |r| < 1 indicates entanglement or mixed state.",
  density: "Reduced density matrices show single-qubit states after tracing out other qubits. Diagonal elements = probabilities.",
  probs: "Probability distribution shows the likelihood of measuring each computational basis state.",
  amps: "Complex amplitudes α determine probabilities (|α|²) and interference patterns (phase)."
};

export default function Inspector({
  result,
  defaultOpen = { qasm: true, bloch: true, density: true, probs: true, amps: false },
  amplitudeWavesRef: externalWavesRef
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(null);
  const [showWaves, setShowWaves] = useState(false);
  const [showProbChart, setShowProbChart] = useState(true);
  const [hoveredSection, setHoveredSection] = useState(null);
  const internalWavesRef = useRef(null);
  const wavesRef = externalWavesRef || internalWavesRef;

  if (!result) {
    return (
      <div style={{
        padding: 40,
        textAlign: 'center',
        background: 'linear-gradient(145deg, rgba(15,23,42,0.9), rgba(30,41,59,0.8))',
        borderRadius: 16,
        border: '1px solid rgba(100,255,218,0.15)'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
        <h3 style={{ color: '#e0f7fa', marginBottom: 8 }}>No Simulation Results</h3>
        <p style={{ color: '#78909c', fontSize: 13 }}>
          Run a quantum circuit to see state analysis, probabilities, and visualizations.
        </p>
      </div>
    );
  }

  const openqasm = result.openqasm || result.openQasm || result.qasm || '(No OpenQASM provided)';
  const blochVectors = result.bloch_vectors || result.blochVectors || [];
  const densityMatrices = result.density_matrices || result.densityMatrices || [];
  const probabilities = result.probabilities || result.Probabilities || null;
  const counts = result.counts || result.measurement_counts || null;
  const amplitudes = result.amplitudes || null;

  // Process Bloch vectors with magnitude and purity analysis
  const blochWithMagnitude = useMemo(
    () =>
      Array.isArray(blochVectors)
        ? blochVectors.map((v, i) => {
          if (!Array.isArray(v) || v.length < 3) return { index: i, vec: [0, 0, 0], r: 0, purity: 'Unknown' };
          const [x, y, z] = v.map(n => (typeof n === 'number' ? n : 0));
          const r = Math.sqrt(x * x + y * y + z * z);
          let purity = 'Max Mixed';
          let purityColor = '#90a4ae';
          if (r > 0.995) { purity = 'Pure'; purityColor = '#64ffda'; }
          else if (r > 0.7) { purity = 'Mostly Pure'; purityColor = '#4dd0e1'; }
          else if (r > 0.4) { purity = 'Mixed'; purityColor = '#ffd54f'; }
          else if (r > 0.15) { purity = 'Entangled'; purityColor = '#ff7043'; }
          return { index: i, vec: [x, y, z], r, purity, purityColor };
        })
        : [],
    [blochVectors]
  );

  // Process probabilities
  const probabilitiesArray = probabilities && typeof probabilities === 'object'
    ? Object.entries(probabilities)
    : [];

  const topProbRows = useMemo(() => {
    if (!probabilitiesArray.length) return [];
    return probabilitiesArray
      .map(([bits, p]) => [bits, typeof p === 'number' ? p : 0])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [probabilitiesArray]);

  // Process amplitudes
  const amplitudeRows = useMemo(() => {
    if (!amplitudes || typeof amplitudes !== 'object') return [];
    return Object.entries(amplitudes).map(([bits, obj]) => {
      const re = safeNum(obj?.re);
      const im = safeNum(obj?.im);
      const prob = safeNum(obj?.prob);
      const magnitude = Math.sqrt(re * re + im * im);
      const phase = Math.atan2(im, re) * 180 / Math.PI;
      return { bits, re, im, prob, magnitude, phase };
    });
  }, [amplitudes]);

  function safeNum(v) { return typeof v === 'number' && isFinite(v) ? v : 0; }

  function formatMatrixValue(val) {
    if (Array.isArray(val) && val.length === 2) {
      const re = Number(val[0]); const im = Number(val[1]);
      if (isFinite(re) && (Math.abs(im) < 1e-10 || !isFinite(im))) return re.toFixed(2);
      if (isFinite(re) && isFinite(im)) {
        if (Math.abs(im) < 0.001) return re.toFixed(2);
        return `${re.toFixed(2)}${im < 0 ? '' : '+'}${im.toFixed(2)}i`;
      }
      return 'N/A';
    }
    if (typeof val === 'number' && isFinite(val)) return val.toFixed(2);
    return 'N/A';
  }

  function toggle(section) {
    setOpen(o => ({ ...o, [section]: !o[section] }));
  }

  async function copyToClipboard(kind) {
    try {
      let text = '';
      if (kind === 'qasm') text = openqasm;
      else if (kind === 'json') text = JSON.stringify(result, null, 2);
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1100);
    } catch { /* ignore */ }
  }

  // Enhanced Section Header with educational tooltip
  const SectionHeader = ({ label, sectionKey, count, extra, icon }) => {
    const isOpen = open[sectionKey];
    const isHovered = hoveredSection === sectionKey;
    
    return (
      <div
        className={`qt-tmpl-inspector-section ${isOpen ? 'open' : ''}`}
        onClick={() => toggle(sectionKey)}
        onMouseEnter={() => setHoveredSection(sectionKey)}
        onMouseLeave={() => setHoveredSection(null)}
        style={{
          background: isOpen 
            ? 'linear-gradient(90deg, rgba(100,255,218,0.08), transparent)'
            : 'transparent',
          transition: 'all 0.2s ease'
        }}
      >
        <div className="qt-tmpl-toggle-box" style={{
          background: isOpen ? 'rgba(100,255,218,0.2)' : 'rgba(71,85,105,0.3)',
          color: isOpen ? '#64ffda' : '#90caf9'
        }}>
          {isOpen ? '−' : '+'}
        </div>
        <div className="qt-tmpl-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && <span style={{ fontSize: 16 }}>{icon}</span>}
          <span>{label}</span>
          {typeof count === 'number' && (
            <span className="qt-tmpl-section-count" style={{
              background: 'rgba(100,255,218,0.15)',
              padding: '2px 8px',
              borderRadius: 10,
              fontSize: 10
            }}>
              {count}
            </span>
          )}
        </div>
        {extra && (
          <div
            style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}
            onClick={(e) => e.stopPropagation()}
          >
            {extra}
          </div>
        )}
      </div>
    );
  };

  // Info tooltip that appears on section hover
  const InfoTooltip = ({ sectionKey }) => {
    if (hoveredSection !== sectionKey || !SECTION_INFO[sectionKey]) return null;
    return (
      <div style={{
        padding: '8px 12px',
        background: 'rgba(30,41,59,0.95)',
        borderRadius: 8,
        fontSize: 11,
        color: '#90caf9',
        borderLeft: '3px solid #64ffda',
        marginBottom: 8
      }}>
        💡 {SECTION_INFO[sectionKey]}
      </div>
    );
  };

  const CopyButtons = () => (
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        onClick={(e) => { e.stopPropagation(); copyToClipboard('qasm'); }}
        className="qt-tmpl-inspector-btn"
        style={{
          background: copied === 'qasm' ? 'rgba(100,255,218,0.2)' : undefined
        }}
      >
        {copied === 'qasm' ? '✔ Copied' : 'Copy QASM'}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); copyToClipboard('json'); }}
        className="qt-tmpl-inspector-btn"
      >
        {copied === 'json' ? '✔ JSON' : 'Copy JSON'}
      </button>
    </div>
  );

  const WavesToggle = amplitudes ? (
    <button
      onClick={() => setShowWaves(s => !s)}
      className={`qt-tmpl-inspector-btn alt ${showWaves ? 'active' : ''}`}
      style={{ 
        fontSize: 11, 
        padding: '4px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }}
    >
      📊 {showWaves ? 'Hide Chart' : 'Show Chart'}
    </button>
  ) : null;

  const ProbChartToggle = (probabilities || counts) ? (
    <button
      onClick={() => setShowProbChart(c => !c)}
      className={`qt-tmpl-inspector-btn alt ${showProbChart ? 'active' : ''}`}
      style={{ 
        fontSize: 11, 
        padding: '4px 10px',
        display: 'flex',
        alignItems: 'center',
        gap: 4
      }}
    >
      📊 {showProbChart ? 'Hide Chart' : 'Show Chart'}
    </button>
  ) : null;

  return (
    <div className="qt-tmpl-inspector-root" style={{ fontSize: 12, lineHeight: 1.5 }}>
      {/* OpenQASM Section */}
      <SectionHeader label="OpenQASM" sectionKey="qasm" extra={<CopyButtons />} icon="📝" />
      {open.qasm && (
        <div className="qt-tmpl-panel-box">
          <InfoTooltip sectionKey="qasm" />
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontFamily: '"Courier New", monospace',
              fontSize: 11,
              color: 'var(--qt-text)',
              background: 'rgba(15,23,42,0.5)',
              padding: 12,
              borderRadius: 8,
              border: '1px solid rgba(71,85,105,0.3)'
            }}
          >
            {openqasm}
          </pre>
        </div>
      )}

      {/* Bloch Vectors - Enhanced */}
      <SectionHeader
        label="Bloch Vectors"
        sectionKey="bloch"
        count={blochWithMagnitude.length}
        icon="🌐"
      />
      {open.bloch && (
        <div className="qt-tmpl-panel-box">
          <InfoTooltip sectionKey="bloch" />
          {!blochWithMagnitude.length && (
            <div className="qt-empty">No Bloch vectors available.</div>
          )}
          {!!blochWithMagnitude.length && (
            <div className="qt-scroll-container" style={{
              display: 'flex',
              gap: 12,
              overflowX: blochWithMagnitude.length > 4 ? 'auto' : 'visible',
              paddingBottom: blochWithMagnitude.length > 4 ? 8 : 0
            }}>
              {blochWithMagnitude.map(({ index, vec, r, purity, purityColor }) => (
                <div key={index} className="qt-bloch-card" style={{
                  background: 'var(--qt-surface-alt, rgba(15,23,42,0.5))',
                  borderRadius: 10,
                  padding: 12,
                  border: '1px solid var(--qt-border, rgba(71,85,105,0.3))',
                  minWidth: 160,
                  flexShrink: 0
                }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 8
                  }}>
                    <span style={{ 
                      fontWeight: 700, 
                      color: 'var(--qt-accent)',
                      fontSize: 14
                    }}>
                      q[{index}]
                    </span>
                    <span style={{ 
                      fontSize: 10, 
                      padding: '3px 8px',
                      borderRadius: 12,
                      background: `${purityColor}22`,
                      color: purityColor,
                      fontWeight: 600
                    }}>
                      {purity}
                    </span>
                  </div>
                  
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(4, 1fr)', 
                    gap: 8,
                    fontSize: 11
                  }}>
                    {['x', 'y', 'z'].map((axis, i) => (
                      <div key={axis}>
                        <div style={{ color: 'var(--qt-text-dim, #78909c)', fontSize: 9 }}>{axis.toUpperCase()}</div>
                        <div style={{ color: 'var(--qt-text, #e0f7fa)', fontWeight: 600 }}>
                          {vec[i].toFixed(3)}
                        </div>
                      </div>
                    ))}
                    <div>
                      <div style={{ color: '#78909c', fontSize: 9 }}>|r|</div>
                      <div style={{ color: purityColor, fontWeight: 700 }}>
                        {r.toFixed(3)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Density Matrices - Enhanced */}
      <SectionHeader
        label="Reduced Density Matrices"
        sectionKey="density"
        count={densityMatrices.length}
        icon="📐"
      />
      {open.density && (
        <div className="qt-tmpl-panel-box">
          <InfoTooltip sectionKey="density" />
          {!densityMatrices.length && (
            <div className="qt-empty">No density matrices available.</div>
          )}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 12
          }}>
            {densityMatrices.map((matrix, idx) => (
              <div
                key={idx}
                style={{
                  background: 'rgba(15,23,42,0.5)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid rgba(71,85,105,0.3)'
                }}
              >
                <div
                  style={{
                    background: 'rgba(100,255,218,0.08)',
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--qt-accent)',
                    borderBottom: '1px solid rgba(71,85,105,0.3)'
                  }}
                >
                  Qubit {idx}
                </div>
                <div style={{ padding: 8 }}>
                  <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: 11
                  }}>
                    <thead>
                      <tr>
                        <th style={{ width: 30 }}></th>
                        <th style={{ textAlign: 'center', color: '#78909c', fontSize: 9 }}>|0⟩</th>
                        <th style={{ textAlign: 'center', color: '#78909c', fontSize: 9 }}>|1⟩</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(matrix) &&
                        matrix.map((row, rIdx) => (
                          <tr key={rIdx}>
                            <td style={{ 
                              color: '#78909c', 
                              fontSize: 9, 
                              textAlign: 'right',
                              paddingRight: 6
                            }}>
                              ⟨{rIdx}|
                            </td>
                            {Array.isArray(row) &&
                              row.map((val, cIdx) => {
                                const isReal = !Array.isArray(val) || Math.abs(val[1] || 0) < 0.001;
                                const isDiagonal = rIdx === cIdx;
                                return (
                                  <td
                                    key={cIdx}
                                    style={{
                                      padding: '6px 8px',
                                      textAlign: 'center',
                                      fontFamily: '"Courier New", monospace',
                                      color: isDiagonal ? '#64ffda' : '#e0f7fa',
                                      fontWeight: isDiagonal ? 700 : 400,
                                      background: isDiagonal ? 'rgba(100,255,218,0.05)' : 'transparent'
                                    }}
                                  >
                                    {formatMatrixValue(val)}
                                  </td>
                                );
                              })}
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Probabilities / Counts - Enhanced */}
      {(probabilities || counts) && (
        <>
          <SectionHeader
            label={probabilities ? 'Measurement Probabilities' : 'Measurement Counts'}
            sectionKey="probs"
            count={
              probabilities
                ? Object.keys(probabilities).length
                : Object.keys(counts || {}).length
            }
            extra={ProbChartToggle}
            icon="📊"
          />
          {open.probs && (
            <div className="qt-tmpl-panel-box">
              <InfoTooltip sectionKey="probs" />
              
              {/* Enhanced probability summary cards - scrollable for many states */}
              {probabilities && topProbRows.length > 0 && (
                <div className="qt-scroll-container" style={{
                  display: 'flex',
                  gap: 8,
                  overflowX: topProbRows.length > 6 ? 'auto' : 'visible',
                  paddingBottom: topProbRows.length > 6 ? 8 : 0,
                  marginBottom: showProbChart ? 16 : 0
                }}>
                  {topProbRows.slice(0, 12).map(([bits, p], idx) => {
                    const pct = p * 100;
                    return (
                      <div key={bits} className="qt-prob-summary-card" style={{
                        background: idx === 0 
                          ? 'linear-gradient(135deg, rgba(100,255,218,0.15), rgba(100,255,218,0.05))'
                          : 'var(--qt-surface-alt, rgba(15,23,42,0.5))',
                        borderRadius: 10,
                        padding: '10px 12px',
                        border: idx === 0 
                          ? '1px solid var(--qt-accent, rgba(100,255,218,0.3))'
                          : '1px solid var(--qt-border, rgba(71,85,105,0.3))',
                        textAlign: 'center',
                        minWidth: bits.length > 4 ? 110 : 90,
                        flexShrink: 0
                      }}>
                        <div style={{ 
                          fontWeight: 700, 
                          color: idx === 0 ? 'var(--qt-accent, #64ffda)' : 'var(--qt-accent-alt, #90caf9)',
                          fontSize: bits.length > 6 ? 11 : 14,
                          fontFamily: '"Courier New", monospace',
                          marginBottom: 4,
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}>
                          |{bits}⟩
                        </div>
                        <div style={{ 
                          fontSize: 14, 
                          fontWeight: 700,
                          color: 'var(--qt-text, #e0f7fa)'
                        }}>
                          {pct.toFixed(pct > 10 ? 1 : 2)}%
                        </div>
                        {idx === 0 && (
                          <div style={{ 
                            fontSize: 9, 
                            color: '#64ffda',
                            marginTop: 4
                          }}>
                            Most likely
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {counts && !probabilities && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))',
                  gap: 8,
                  marginBottom: showProbChart ? 16 : 0
                }}>
                  {Object.entries(counts)
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 8)
                    .map(([bits, ct], idx) => (
                      <div key={bits} style={{
                        background: idx === 0 
                          ? 'linear-gradient(135deg, rgba(100,255,218,0.15), rgba(100,255,218,0.05))'
                          : 'rgba(15,23,42,0.5)',
                        borderRadius: 10,
                        padding: '10px 12px',
                        border: '1px solid rgba(71,85,105,0.3)',
                        textAlign: 'center'
                      }}>
                        <div style={{ 
                          fontWeight: 700, 
                          color: idx === 0 ? '#64ffda' : '#90caf9',
                          fontSize: 13,
                          fontFamily: '"Courier New", monospace'
                        }}>
                          |{bits}⟩
                        </div>
                        <div style={{ 
                          fontSize: 14, 
                          fontWeight: 600,
                          color: '#e0f7fa',
                          marginTop: 2
                        }}>
                          {ct.toLocaleString()}
                        </div>
                      </div>
                    ))}
                </div>
              )}

              {showProbChart && (
                <div style={{ marginTop: 8 }}>
                  <ProbabilityDistribution
                    probabilities={probabilities}
                    counts={counts}
                    compact
                  />
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* Amplitudes + Wave Visualization - Enhanced */}
      {amplitudeRows.length > 0 && (
        <>
          <SectionHeader
            label="State Amplitudes"
            sectionKey="amps"
            count={amplitudeRows.length}
            extra={WavesToggle}
            icon="🌊"
          />
          {open.amps && (
            <div className="qt-tmpl-panel-box">
              <InfoTooltip sectionKey="amps" />
              
              {/* Summary cards for top amplitudes */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                gap: 8,
                marginBottom: 12
              }}>
                {amplitudeRows
                  .sort((a, b) => b.prob - a.prob)
                  .slice(0, 4)
                  .map((row, idx) => (
                    <div key={row.bits} style={{
                      background: idx === 0 
                        ? 'linear-gradient(135deg, rgba(100,255,218,0.12), rgba(100,255,218,0.04))'
                        : 'rgba(15,23,42,0.5)',
                      borderRadius: 10,
                      padding: 10,
                      border: idx === 0 
                        ? '1px solid rgba(100,255,218,0.25)'
                        : '1px solid rgba(71,85,105,0.3)'
                    }}>
                      <div style={{ 
                        fontWeight: 700, 
                        color: idx === 0 ? '#64ffda' : '#90caf9',
                        fontSize: 13,
                        fontFamily: '"Courier New", monospace',
                        marginBottom: 6
                      }}>
                        |{row.bits}⟩
                      </div>
                      <div style={{ 
                        display: 'grid', 
                        gridTemplateColumns: '1fr 1fr', 
                        gap: 4,
                        fontSize: 10 
                      }}>
                        <div>
                          <span style={{ color: '#78909c' }}>|α|²: </span>
                          <span style={{ color: '#e0f7fa', fontWeight: 600 }}>
                            {(row.prob * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span style={{ color: '#78909c' }}>θ: </span>
                          <span style={{ color: '#e0f7fa', fontWeight: 600 }}>
                            {row.phase.toFixed(0)}°
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Detailed table */}
              <details style={{ marginTop: 8 }}>
                <summary style={{ 
                  cursor: 'pointer', 
                  color: '#90caf9', 
                  fontSize: 11,
                  marginBottom: 8
                }}>
                  View all {amplitudeRows.length} amplitudes
                </summary>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: 'rgba(15,23,42,0.5)' }}>
                      <th style={{ padding: '8px 6px', textAlign: 'left' }}>State</th>
                      <th style={{ padding: '8px 6px', textAlign: 'center' }}>Re(α)</th>
                      <th style={{ padding: '8px 6px', textAlign: 'center' }}>Im(α)</th>
                      <th style={{ padding: '8px 6px', textAlign: 'center' }}>|α|²</th>
                      <th style={{ padding: '8px 6px', textAlign: 'center' }}>Phase</th>
                    </tr>
                  </thead>
                  <tbody>
                    {amplitudeRows
                      .sort((a, b) => b.prob - a.prob)
                      .slice(0, 20)
                      .map((row, i) => (
                        <tr
                          key={row.bits}
                          style={{
                            background: i % 2 === 0 ? 'rgba(30,41,59,0.3)' : 'transparent',
                            borderBottom: '1px solid rgba(71,85,105,0.2)'
                          }}
                        >
                          <td style={{ 
                            padding: '6px', 
                            fontWeight: 600, 
                            color: 'var(--qt-accent)',
                            fontFamily: '"Courier New", monospace'
                          }}>
                            |{row.bits}⟩
                          </td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>
                            {row.re.toFixed(3)}
                          </td>
                          <td style={{ padding: '6px', textAlign: 'center' }}>
                            {row.im.toFixed(3)}
                          </td>
                          <td style={{ padding: '6px', textAlign: 'center', fontWeight: 600 }}>
                            {(row.prob * 100).toFixed(2)}%
                          </td>
                          <td style={{ padding: '6px', textAlign: 'center', color: '#90caf9' }}>
                            {row.phase.toFixed(1)}°
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </details>

              <div
                ref={wavesRef}
                style={{
                  marginTop: showWaves ? 16 : 0,
                  transition: 'all .25s ease'
                }}
              >
                <AmplitudeWaves amplitudes={amplitudes} show={showWaves} />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}