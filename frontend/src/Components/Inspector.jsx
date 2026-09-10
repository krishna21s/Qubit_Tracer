import React, { useMemo, useState, useRef, useEffect } from 'react';
import AmplitudeWaves from './AmplitudeWaves';
import ProbabilityDistribution from './ProbabilityDistribution';
import { parseQasmToOps, hasMeasurement, simulateWithShots } from '../utils/quantumSimulator';
import { FileText, Grid, Layers, ChartPie, Sparkles, Lightbulb, Copy, Check, Target, AlertTriangle } from 'reicon-react';
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
  sections = ['qasm', 'bloch', 'density', 'probs', 'amps'],
  amplitudeWavesRef: externalWavesRef
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(null);
  const [showWaves, setShowWaves] = useState(false);
  const [showProbChart, setShowProbChart] = useState(true);
  const [hoveredSection, setHoveredSection] = useState(null);
  const internalWavesRef = useRef(null);
  const wavesRef = externalWavesRef || internalWavesRef;
  
  // Shots-based measurement state
  const [shots, setShots] = useState(1024);
  const [measurementResult, setMeasurementResult] = useState(null);

  if (!result) {
    return (
      <div style={{
        padding: 40,
        textAlign: 'center',
        background: 'var(--qt-surface-glass, var(--qt-surface))',
        borderRadius: 16,
        border: '1px solid var(--qt-border)'
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🔬</div>
        <h3 style={{ color: 'var(--qt-text)', marginBottom: 8 }}>No Simulation Results</h3>
        <p style={{ color: 'var(--qt-text-dim)', fontSize: 13 }}>
          Run a quantum circuit to see state analysis, probabilities, and visualizations.
        </p>
      </div>
    );
  }

  const openqasm = result.openqasm || result.openQasm || result.qasm || '(No OpenQASM provided)';
  const blochVectors = result.bloch_vectors || result.blochVectors || [];
  const densityMatrices = result.density_matrices || result.densityMatrices || [];
  const originalProbabilities = result.probabilities || result.Probabilities || null;
  const originalCounts = result.counts || result.measurement_counts || null;
  const amplitudes = result.amplitudes || null;
  
  // Detect if circuit has measurements and compute number of qubits
  const numQubits = result.num_qubits || result.numQubits || blochVectors?.length || 2;
  const ops = useMemo(() => {
    if (!openqasm || openqasm === '(No OpenQASM provided)') return [];
    try {
      return parseQasmToOps(openqasm);
    } catch {
      return [];
    }
  }, [openqasm]);
  
  const circuitHasMeasurement = useMemo(() => hasMeasurement(ops), [ops]);
  
  // Run shots simulation when circuit has measurements
  useEffect(() => {
    if (circuitHasMeasurement && ops.length > 0 && numQubits > 0) {
      try {
        const result = simulateWithShots(numQubits, ops, shots);
        setMeasurementResult(result);
      } catch (err) {
        console.warn('Shots simulation failed:', err);
        setMeasurementResult(null);
      }
    } else {
      setMeasurementResult(null);
    }
  }, [circuitHasMeasurement, ops, numQubits, shots]);
  
  // Use measurement counts if available from shots simulation, otherwise fall back to original data
  const probabilities = measurementResult?.hasMeasurements ? measurementResult.probabilities : originalProbabilities;
  const counts = measurementResult?.hasMeasurements ? measurementResult.counts : originalCounts;
  const shotsPerformed = measurementResult?.hasMeasurements ? measurementResult.shots : 0;

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
            ? 'linear-gradient(90deg, color-mix(in srgb, var(--qt-accent) 8%, transparent), transparent)'
            : 'transparent',
          transition: 'all 0.2s ease'
        }}
      >
        <div className="qt-tmpl-toggle-box" style={{
          background: isOpen ? 'color-mix(in srgb, var(--qt-accent) 20%, transparent)' : 'var(--qt-surface-alt)',
          color: isOpen ? 'var(--qt-accent)' : 'var(--qt-text-dim)'
        }}>
          {isOpen ? '−' : '+'}
        </div>
        <div className="qt-tmpl-section-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
          <span>{label}</span>
          {typeof count === 'number' && (
            <span className="qt-tmpl-section-count" style={{
              background: 'color-mix(in srgb, var(--qt-accent) 15%, transparent)',
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
        background: 'var(--qt-surface-alt)',
        borderRadius: 8,
        fontSize: 11,
        color: 'var(--qt-text-dim)',
        borderLeft: '3px solid var(--qt-accent)',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'flex-start',
        gap: 6
      }}>
        <Lightbulb size={14} style={{ flexShrink: 0, marginTop: 2, color: 'var(--qt-accent)' }} /> 
        <div>{SECTION_INFO[sectionKey]}</div>
      </div>
    );
  };

  const CopyButtons = () => (
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        onClick={(e) => { e.stopPropagation(); copyToClipboard('qasm'); }}
        className="qt-tmpl-inspector-btn"
        style={{
          background: copied === 'qasm' ? 'rgba(100,255,218,0.2)' : undefined,
          display: 'flex', alignItems: 'center', gap: 4
        }}
      >
        {copied === 'qasm' ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy QASM</>}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); copyToClipboard('json'); }}
        className="qt-tmpl-inspector-btn"
        style={{ display: 'flex', alignItems: 'center', gap: 4 }}
      >
        {copied === 'json' ? <><Check size={12} /> JSON</> : <><Copy size={12} /> Copy JSON</>}
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
      <ChartPie size={12} /> {showWaves ? 'Hide Chart' : 'Show Chart'}
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
      <ChartPie size={12} /> {showProbChart ? 'Hide Chart' : 'Show Chart'}
    </button>
  ) : null;

  return (
    <div className="qt-tmpl-inspector-root" style={{ fontSize: 12, lineHeight: 1.5 }}>
      {/* OpenQASM Section */}
      {sections.includes('qasm') && (
        <>
          <SectionHeader label="OpenQASM" sectionKey="qasm" extra={<CopyButtons />} icon={<FileText size={16} />} />
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
              background: 'var(--qt-surface-alt)',
              padding: 12,
              borderRadius: 8,
              border: '1px solid var(--qt-border)'
            }}
          >
            {openqasm}
          </pre>
        </div>
      )}
      </>
      )}

      {/* Bloch Vectors - Enhanced */}
      {sections.includes('bloch') && (
        <>
          <SectionHeader
            label="Bloch Vectors"
            sectionKey="bloch"
            count={blochWithMagnitude.length}
            icon={<Grid size={16} />}
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
                      <div style={{ color: 'var(--qt-text-dim)', fontSize: 9 }}>|r|</div>
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
      </>
      )}

      {/* Density Matrices - Enhanced */}
      {sections.includes('density') && (
        <>
          <SectionHeader
            label="Reduced Density Matrices"
            sectionKey="density"
            count={densityMatrices.length}
            icon={<Layers size={16} />}
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
                  background: 'var(--qt-surface-alt)',
                  borderRadius: 10,
                  overflow: 'hidden',
                  border: '1px solid var(--qt-border)'
                }}
              >
                <div
                  style={{
                    background: 'color-mix(in srgb, var(--qt-accent) 10%, transparent)',
                    padding: '6px 12px',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--qt-accent)',
                    borderBottom: '1px solid var(--qt-border)'
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
                        <th style={{ textAlign: 'center', color: 'var(--qt-text-dim)', fontSize: 9 }}>|0⟩</th>
                        <th style={{ textAlign: 'center', color: 'var(--qt-text-dim)', fontSize: 9 }}>|1⟩</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(matrix) &&
                        matrix.map((row, rIdx) => (
                          <tr key={rIdx}>
                            <td style={{ 
                              color: 'var(--qt-text-dim)', 
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
                                      color: isDiagonal ? 'var(--qt-accent)' : 'var(--qt-text)',
                                      fontWeight: isDiagonal ? 700 : 400,
                                      background: isDiagonal ? 'color-mix(in srgb, var(--qt-accent) 8%, transparent)' : 'transparent'
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
      </>
      )}

      {/* Probabilities / Counts - Enhanced */}
      {sections.includes('probs') && (probabilities || counts) && (
        <>
          <SectionHeader
            label={circuitHasMeasurement 
              ? `Measurement Counts${shotsPerformed > 0 ? ` (${shotsPerformed.toLocaleString()} shots)` : ''}`
              : 'Measurement Probabilities (Theoretical)'}
            sectionKey="probs"
            count={
              probabilities
                ? Object.keys(probabilities).length
                : Object.keys(counts || {}).length
            }
            extra={
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {circuitHasMeasurement && (
                  <select
                    value={shots}
                    onChange={(e) => setShots(Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="qt-tmpl-inspector-btn"
                    style={{
                      background: 'color-mix(in srgb, var(--qt-accent) 10%, transparent)',
                      border: '1px solid color-mix(in srgb, var(--qt-accent) 30%, transparent)',
                      borderRadius: 6,
                      padding: '4px 8px',
                      fontSize: 11,
                      color: 'var(--qt-accent)',
                      cursor: 'pointer',
                      minWidth: 90
                    }}
                    title="Number of measurement shots"
                  >
                    <option value={256}>256 shots</option>
                    <option value={512}>512 shots</option>
                    <option value={1024}>1024 shots</option>
                    <option value={2048}>2048 shots</option>
                    <option value={4096}>4096 shots</option>
                    <option value={8192}>8192 shots</option>
                  </select>
                )}
                {ProbChartToggle}
              </div>
            }
            icon={<ChartPie size={16} />}
          />
          {open.probs && (
            <div className="qt-tmpl-panel-box">
              <InfoTooltip sectionKey="probs" />
              
              {/* Shots performed indicator */}
              {circuitHasMeasurement && shotsPerformed > 0 && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                  padding: '8px 12px',
                  background: 'linear-gradient(135deg, color-mix(in srgb, var(--qt-accent) 8%, transparent), color-mix(in srgb, var(--qt-accent) 2%, transparent))',
                  border: '1px solid color-mix(in srgb, var(--qt-accent) 20%, transparent)',
                  borderRadius: 8,
                  fontSize: 12
                }}>
                  <span style={{ color: 'var(--qt-accent)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Target size={14} /> {shotsPerformed.toLocaleString()} shots performed
                  </span>
                  <span style={{ color: 'var(--qt-text-dim)' }}>
                    • Counts derived from simulated measurements
                  </span>
                </div>
              )}
              
              {!circuitHasMeasurement && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  marginBottom: 12,
                  padding: '8px 12px',
                  background: 'color-mix(in srgb, var(--qt-accent-alt, #90caf9) 8%, transparent)',
                  border: '1px solid color-mix(in srgb, var(--qt-accent-alt, #90caf9) 20%, transparent)',
                  borderRadius: 8,
                  fontSize: 12
                }}>
                  <span style={{ color: 'var(--qt-accent-alt, #90caf9)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Grid size={14} /> Theoretical Probabilities
                  </span>
                  <span style={{ color: 'var(--qt-text-dim)' }}>
                    • No measurements in circuit - showing |α|² from statevector
                  </span>
                </div>
              )}
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
                          ? 'linear-gradient(135deg, color-mix(in srgb, var(--qt-accent) 15%, transparent), color-mix(in srgb, var(--qt-accent) 5%, transparent))'
                          : 'var(--qt-surface-alt)',
                        borderRadius: 10,
                        padding: '10px 12px',
                        border: idx === 0 
                          ? '1px solid var(--qt-accent)'
                          : '1px solid var(--qt-border)',
                        textAlign: 'center',
                        minWidth: bits.length > 4 ? 110 : 90,
                        flexShrink: 0
                      }}>
                        <div style={{ 
                          fontWeight: 700, 
                          color: idx === 0 ? 'var(--qt-accent)' : 'var(--qt-accent-alt)',
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
                          color: 'var(--qt-text)'
                        }}>
                          {pct.toFixed(pct > 10 ? 1 : 2)}%
                        </div>
                        {idx === 0 && (
                          <div style={{ 
                            fontSize: 9, 
                            color: 'var(--qt-accent)',
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
                          ? 'linear-gradient(135deg, color-mix(in srgb, var(--qt-accent) 15%, transparent), color-mix(in srgb, var(--qt-accent) 5%, transparent))'
                          : 'var(--qt-surface-alt)',
                        borderRadius: 10,
                        padding: '10px 12px',
                        border: '1px solid var(--qt-border)',
                        textAlign: 'center'
                      }}>
                        <div style={{ 
                          fontWeight: 700, 
                          color: idx === 0 ? 'var(--qt-accent)' : 'var(--qt-accent-alt)',
                          fontSize: 13,
                          fontFamily: '"Courier New", monospace'
                        }}>
                          |{bits}⟩
                        </div>
                        <div style={{ 
                          fontSize: 14, 
                          fontWeight: 600,
                          color: 'var(--qt-text)',
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
      {sections.includes('amps') && amplitudeRows.length > 0 && (
        <>
          <SectionHeader
            label="State Amplitudes"
            sectionKey="amps"
            count={amplitudeRows.length}
            extra={WavesToggle}
            icon={<Sparkles size={16} />}
          />
          {open.amps && (
            <div className="qt-tmpl-panel-box">
              <InfoTooltip sectionKey="amps" />
              
              {/* Measurement collapse explanation */}
              {circuitHasMeasurement && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                  marginBottom: 14,
                  padding: '10px 14px',
                  background: 'linear-gradient(135deg, rgba(255,183,77,0.12), rgba(255,183,77,0.04))',
                  border: '1px solid rgba(255,183,77,0.25)',
                  borderRadius: 10,
                  fontSize: 12,
                  lineHeight: 1.5
                }}>
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 2, color: '#ffb74d' }} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#ffb74d', marginBottom: 4 }}>
                      Measurement Collapse
                    </div>
                    <div style={{ color: 'var(--qt-text-dim)' }}>
                      After measurement, the quantum state <strong style={{ color: 'var(--qt-text)' }}>collapses</strong> into a single outcome based on probability amplitudes. 
                      The amplitudes shown here represent <strong style={{ color: 'var(--qt-text)' }}>one random collapsed state</strong> from a single backend run. 
                      See the <strong style={{ color: 'var(--qt-accent)' }}>Measurement Counts</strong> above for statistical distribution over {shotsPerformed.toLocaleString()} shots.
                    </div>
                  </div>
                </div>
              )}
              
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
                        ? 'linear-gradient(135deg, color-mix(in srgb, var(--qt-accent) 12%, transparent), color-mix(in srgb, var(--qt-accent) 4%, transparent))'
                        : 'var(--qt-surface-alt)',
                      borderRadius: 10,
                      padding: 10,
                      border: idx === 0 
                        ? '1px solid color-mix(in srgb, var(--qt-accent) 25%, transparent)'
                        : '1px solid var(--qt-border)'
                    }}>
                      <div style={{ 
                        fontWeight: 700, 
                        color: idx === 0 ? 'var(--qt-accent)' : 'var(--qt-accent-alt)',
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
                          <span style={{ color: 'var(--qt-text-dim)' }}>|α|²: </span>
                          <span style={{ color: 'var(--qt-text)', fontWeight: 600 }}>
                            {(row.prob * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--qt-text-dim)' }}>θ: </span>
                          <span style={{ color: 'var(--qt-text)', fontWeight: 600 }}>
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
                  color: 'var(--qt-accent-alt)', 
                  fontSize: 11,
                  marginBottom: 8
                }}>
                  View all {amplitudeRows.length} amplitudes
                </summary>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr style={{ background: 'var(--qt-surface-alt)' }}>
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
                            background: i % 2 === 0 ? 'var(--qt-surface-alt)' : 'transparent',
                            borderBottom: '1px solid var(--qt-border)'
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
                          <td style={{ padding: '6px', textAlign: 'center', color: 'var(--qt-accent-alt)' }}>
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