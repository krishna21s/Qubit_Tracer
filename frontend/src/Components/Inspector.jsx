import React, { useMemo, useState, useRef } from 'react';
import AmplitudeWaves from './AmplitudeWaves';
import ProbabilityDistribution from './ProbabilityDistribution';
import '../styles/inspectorTheme.css'; // NEW import

export default function Inspector({
  result,
  defaultOpen = { qasm: true, bloch: true, density: true, probs: true, amps: false },
  amplitudeWavesRef: externalWavesRef
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(null);
  const [showWaves, setShowWaves] = useState(false);
  const [showProbChart, setShowProbChart] = useState(true);
  const internalWavesRef = useRef(null);
  const wavesRef = externalWavesRef || internalWavesRef;

  if (!result) {
    return <div className="qt-tmpl-inspector-root qt-empty">No simulation yet. Run a circuit to inspect results.</div>;
  }

  const openqasm =
    result.openqasm ||
    result.openQasm ||
    result.qasm ||
    '(No OpenQASM provided)';

  const blochVectors = result.bloch_vectors || result.blochVectors || [];
  const densityMatrices = result.density_matrices || result.densityMatrices || [];
  const probabilities = result.probabilities || result.Probabilities || null;
  const counts = result.counts || result.measurement_counts || null;
  const amplitudes = result.amplitudes || null;

  const blochWithMagnitude = useMemo(
    () =>
      Array.isArray(blochVectors)
        ? blochVectors.map((v, i) => {
          if (!Array.isArray(v) || v.length < 3) return { index: i, vec: [0, 0, 0], r: 0 };
          const [x, y, z] = v.map(n => (typeof n === 'number' ? n : 0));
          const r = Math.sqrt(x * x + y * y + z * z);
          return { index: i, vec: [x, y, z], r };
        })
        : [],
    [blochVectors]
  );

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

  const amplitudeRows = useMemo(() => {
    if (!amplitudes || typeof amplitudes !== 'object') return [];
    return Object.entries(amplitudes).map(([bits, obj]) => {
      const re = safeNum(obj?.re);
      const im = safeNum(obj?.im);
      const prob = safeNum(obj?.prob);
      return { bits, re, im, prob };
    });
  }, [amplitudes]);

  function safeNum(v) { return typeof v === 'number' && isFinite(v) ? v : 0; }

  function formatMatrixValue(val) {
    if (Array.isArray(val) && val.length === 2) {
      const re = Number(val[0]); const im = Number(val[1]);
      if (isFinite(re) && (Math.abs(im) < 1e-10 || !isFinite(im))) return re.toFixed(2);
      if (isFinite(re) && isFinite(im)) {
        return `${re.toFixed(2)} ${im < 0 ? '-' : '+'} ${Math.abs(im).toFixed(2)}i`;
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

  const SectionHeader = ({ label, sectionKey, count, extra }) => {
    const isOpen = open[sectionKey];
    return (
      <div
        className={`qt-tmpl-inspector-section ${isOpen ? 'open' : ''}`}
        onClick={() => toggle(sectionKey)}
      >
        <div className="qt-tmpl-toggle-box">
          {isOpen ? '−' : '+'}
        </div>
        <div className="qt-tmpl-section-title">
          {label}
          {typeof count === 'number' && (
            <span className="qt-tmpl-section-count">
              ({count})
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

  const CopyButtons = () => (
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        onClick={(e) => { e.stopPropagation(); copyToClipboard('qasm'); }}
        className="qt-tmpl-inspector-btn"
        title="Copy QASM"
      >
        {copied === 'qasm' ? '✔ Copied' : 'Copy QASM'}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); copyToClipboard('json'); }}
        className="qt-tmpl-inspector-btn"
        title="Copy full JSON"
      >
        {copied === 'json' ? '✔ JSON' : 'Copy JSON'}
      </button>
    </div>
  );

  const WavesToggle = amplitudes ? (
    <button
      onClick={() => setShowWaves(s => !s)}
      className={`qt-tmpl-inspector-btn alt ${showWaves ? 'active' : ''}`}
      style={{ fontSize: 11, padding: '4px 8px' }}
      title={showWaves ? 'Hide amplitude wave visualization' : 'Show amplitude wave visualization'}
    >
      {showWaves ? '🙈 Waves' : '👁️ Waves'}
    </button>
  ) : null;

  const ProbChartToggle = (probabilities || counts) ? (
    <button
      onClick={() => setShowProbChart(c => !c)}
      className={`qt-tmpl-inspector-btn alt ${showProbChart ? 'active' : ''}`}
      style={{ fontSize: 11, padding: '4px 8px' }}
      title={showProbChart ? 'Hide probability chart' : 'Show probability chart'}
    >
      {showProbChart ? '🙈 Chart' : '📊 Chart'}
    </button>
  ) : null;

  return (
    <div className="qt-tmpl-inspector-root" style={{ fontSize: 12, lineHeight: 1.5 }}>
      {/* OpenQASM Section */}
      <SectionHeader label="OpenQASM" sectionKey="qasm" extra={<CopyButtons />} />
      {open.qasm && (
        <div className="qt-tmpl-panel-box">
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontFamily: 'Courier New, monospace',
              fontSize: 11,
              color: 'var(--qt-text)'
            }}
          >
            {openqasm}
          </pre>
        </div>
      )}

      {/* Bloch Vectors */}
      <SectionHeader
        label="Bloch Vectors"
        sectionKey="bloch"
        count={blochWithMagnitude.length}
      />
      {open.bloch && (
        <div className="qt-tmpl-panel-box">
          {!blochWithMagnitude.length && (
            <div className="qt-empty">No Bloch vectors available.</div>
          )}
          {!!blochWithMagnitude.length && (
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr>
                  <th>Qubit</th>
                  <th>Vector (x,y,z)</th>
                  <th>|r|</th>
                  <th>Purity Hint</th>
                </tr>
              </thead>
              <tbody>
                {blochWithMagnitude.map(({ index, vec, r }) => {
                  let purityNote = '';
                  if (r > 0.995) purityNote = 'Pure';
                  else if (r > 0.7) purityNote = 'High';
                  else if (r > 0.4) purityNote = 'Mixed';
                  else if (r > 0.15) purityNote = 'Entangled';
                  else purityNote = 'Max Mixed';
                  return (
                    <tr key={index}>
                      <td style={{ fontWeight: 600, color: 'var(--qt-accent)' }}>
                        q[{index}]
                      </td>
                      <td>
                        [{vec[0].toFixed(3)}, {vec[1].toFixed(3)}, {vec[2].toFixed(3)}]
                      </td>
                      <td>{r.toFixed(3)}</td>
                      <td style={{ color: 'var(--qt-text-dim)' }}>{purityNote}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Density Matrices */}
      <SectionHeader
        label="Reduced Density Matrices"
        sectionKey="density"
        count={densityMatrices.length}
      />
      {open.density && (
        <div className="qt-tmpl-panel-box">
          {!densityMatrices.length && (
            <div className="qt-empty">No density matrices available.</div>
          )}
          {densityMatrices.map((matrix, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: 12,
                border: '1px solid var(--qt-border)',
                borderRadius: 8,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  background: 'var(--qt-surface-alt)',
                  padding: '4px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: 'var(--qt-text)'
                }}
              >
                Qubit {idx}
              </div>
              <table
                style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  fontSize: 11
                }}
              >
                <tbody>
                  {Array.isArray(matrix) &&
                    matrix.map((row, rIdx) => (
                      <tr key={rIdx}>
                        {Array.isArray(row) &&
                          row.map((val, cIdx) => (
                            <td
                              key={cIdx}
                              style={{
                                border: '1px solid var(--qt-border)',
                                padding: '4px 6px',
                                textAlign: 'center',
                                fontFamily: 'Courier New, monospace',
                                color: 'var(--qt-text)'
                              }}
                            >
                              {formatMatrixValue(val)}
                            </td>
                          ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* Probabilities / Counts */}
      {(probabilities || counts) && (
        <>
          <SectionHeader
            label={probabilities ? 'Top Probabilities' : 'Counts'}
            sectionKey="probs"
            count={
              probabilities
                ? Object.keys(probabilities).length
                : Object.keys(counts || {}).length
            }
            extra={ProbChartToggle}
          />
          {open.probs && (
            <div className="qt-tmpl-panel-box">
              {probabilities && topProbRows.length > 0 && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr>
                      <th>State</th>
                      <th>Prob (%)</th>
                      <th>Raw</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topProbRows.map(([bits, p]) => (
                      <tr key={bits}>
                        <td style={{ fontWeight: 600, color: 'var(--qt-accent)' }}>
                          {bits}
                        </td>
                        <td>{(p * 100).toFixed(2)}%</td>
                        <td style={{ opacity: 0.75 }}>{p.toFixed(6)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              {counts && !probabilities && (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                  <thead>
                    <tr>
                      <th>State</th>
                      <th>Counts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(counts)
                      .sort((a, b) => b[1] - a[1])
                      .slice(0, 20)
                      .map(([bits, ct]) => (
                        <tr key={bits}>
                          <td style={{ fontWeight: 600, color: 'var(--qt-accent)' }}>
                            {bits}
                          </td>
                          <td>{ct}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              )}

              {showProbChart && (
                <div style={{ marginTop: 14 }}>
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

      {/* Amplitudes + Wave Visualization */}
      {amplitudeRows.length > 0 && (
        <>
          <SectionHeader
            label="Amplitudes"
            sectionKey="amps"
            count={amplitudeRows.length}
            extra={WavesToggle}
          />
          {open.amps && (
            <div className="qt-tmpl-panel-box">
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
                <thead>
                  <tr>
                    <th>State</th>
                    <th>Re(α)</th>
                    <th>Im(α)</th>
                    <th>|α|² (%)</th>
                  </tr>
                </thead>
                <tbody>
                  {amplitudeRows
                    .sort((a, b) => b.prob - a.prob)
                    .slice(0, 20)
                    .map((row, i) => (
                      <tr
                        key={row.bits}
                        className={`qt-amp-row ${i % 2 === 0 ? 'even' : 'odd'}`}
                      >
                        <td style={{ fontWeight: 600, color: 'var(--qt-accent)' }}>
                          {row.bits}
                        </td>
                        <td>{row.re.toFixed(3)}</td>
                        <td>{row.im.toFixed(3)}</td>
                        <td>{(row.prob * 100).toFixed(2)}%</td>
                      </tr>
                    ))}
                </tbody>
              </table>

              <div
                ref={wavesRef}
                style={{
                  marginTop: showWaves ? 12 : 0,
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