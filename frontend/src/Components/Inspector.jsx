import React, { useMemo, useState, useRef } from 'react';
import AmplitudeWaves from './AmplitudeWaves';
import ProbabilityDistribution from './ProbabilityDistribution';

/**
 * Inspector (collapsible UI + amplitudes + probability chart)
 * Preserves your existing styles / structure.
 * Added:
 *  - Probability Distribution chart toggle inside Probabilities/Counts section
 *  - Amplitude waves toggle already integrated earlier
 *  - No color or layout changes outside added buttons
 */
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
    return (
      <div style={{ color: '#9fb4c8' }}>
        No simulation yet. Run a circuit to inspect results.
      </div>
    );
  }

  // ----------- Normalized Accessors -----------
  const openqasm =
    result.openqasm ||
    result.openQasm ||
    result.qasm ||
    '(No OpenQASM provided)';

  const blochVectors = result.bloch_vectors ||
    result.blochVectors ||
    [];

  const densityMatrices = result.density_matrices ||
    result.densityMatrices ||
    [];

  const probabilities = result.probabilities ||
    result.Probabilities ||
    null;

  const counts = result.counts ||
    result.measurement_counts ||
    null;

  const amplitudes = result.amplitudes || null;

  // ----------- Derived Data -----------
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

  const topProbRows = useMemo(() => {
    if (!probabilities || typeof probabilities !== 'object') return [];
    return Object.entries(probabilities)
      .map(([bits, p]) => [bits, typeof p === 'number' ? p : 0])
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12);
  }, [probabilities]);

  const amplitudeRows = useMemo(() => {
    if (!amplitudes || typeof amplitudes !== 'object') return [];
    return Object.entries(amplitudes).map(([bits, obj]) => {
      const re = safeNum(obj?.re);
      const im = safeNum(obj?.im);
      const prob = safeNum(obj?.prob);
      return { bits, re, im, prob };
    });
  }, [amplitudes]);

  // ----------- Helpers -----------
  function safeNum(v) {
    return typeof v === 'number' && isFinite(v) ? v : 0;
  }

  function formatMatrixValue(val) {
    if (Array.isArray(val) && val.length === 2) {
      const re = Number(val[0]);
      const im = Number(val[1]);
      if (isFinite(re) && (Math.abs(im) < 1e-10 || !isFinite(im))) {
        return re.toFixed(2);
      }
      if (isFinite(re) && isFinite(im)) {
        return `${re.toFixed(2)} ${im < 0 ? '-' : '+'} ${Math.abs(im).toFixed(2)}i`;
      }
      return 'N/A';
    }
    if (typeof val === 'number' && isFinite(val)) {
      return val.toFixed(2);
    }
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
    } catch {
      /* ignore */
    }
  }

  // ----------- Small UI Subcomponents -----------
  const SectionHeader = ({ label, sectionKey, count, extra }) => (
    <div
      onClick={() => toggle(sectionKey)}
      style={{
        cursor: 'pointer',
        userSelect: 'none',
        background: 'linear-gradient(90deg,#142330,#0e1b27)',
        padding: '8px 10px',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        border: '1px solid #223749'
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          background: open[sectionKey] ? '#1781cc' : '#2d4a5c',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          fontWeight: 700,
          color: '#e6f6ff',
          letterSpacing: 0.5
        }}
      >
        {open[sectionKey] ? '−' : '+'}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#cfefff' }}>
        {label}
        {typeof count === 'number' && (
          <span style={{ color: '#6fb5d9', fontWeight: 400, marginLeft: 6 }}>
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

  const CopyButtons = () => (
    <div style={{ display: 'flex', gap: 6 }}>
      <button
        onClick={(e) => { e.stopPropagation(); copyToClipboard('qasm'); }}
        style={copyBtnStyle}
        title="Copy QASM"
      >
        {copied === 'qasm' ? '✔ Copied' : 'Copy QASM'}
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); copyToClipboard('json'); }}
        style={copyBtnStyle}
        title="Copy full JSON"
      >
        {copied === 'json' ? '✔ JSON' : 'Copy JSON'}
      </button>
    </div>
  );

  const WavesToggle = amplitudes ? (
    <button
      onClick={() => setShowWaves(s => !s)}
      style={{
        ...copyBtnStyle,
        fontSize: 11,
        padding: '4px 8px',
        background: showWaves
          ? 'linear-gradient(135deg,#1781cc,#12649f)'
          : copyBtnStyle.background
      }}
      title={showWaves ? 'Hide amplitude wave visualization' : 'Show amplitude wave visualization'}
    >
      {showWaves ? '🙈 Waves' : '👁️ Waves'}
    </button>
  ) : null;

  const ProbChartToggle = (probabilities || counts) ? (
    <button
      onClick={() => setShowProbChart(c => !c)}
      style={{
        ...copyBtnStyle,
        fontSize: 11,
        padding: '4px 8px',
        background: showProbChart
          ? 'linear-gradient(135deg,#1781cc,#12649f)'
          : copyBtnStyle.background
      }}
      title={showProbChart ? 'Hide probability chart' : 'Show probability chart'}
    >
      {showProbChart ? '🙈 Chart' : '📊 Chart'}
    </button>
  ) : null;

  return (
    <div style={{ fontSize: 12, lineHeight: 1.5 }}>
      {/* OpenQASM Section */}
      <SectionHeader
        label="OpenQASM"
        sectionKey="qasm"
        extra={<CopyButtons />}
      />
      {open.qasm && (
        <div style={panelBox}>
          <pre
            style={{
              margin: 0,
              whiteSpace: 'pre-wrap',
              fontFamily: 'Courier New, monospace',
              fontSize: 11,
              color: '#d7ecf8'
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
        <div style={panelBox}>
          {!blochWithMagnitude.length && (
            <div style={emptyText}>No Bloch vectors available.</div>
          )}
          {!!blochWithMagnitude.length && (
            <table style={tableStyle}>
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
                      <td style={{ fontWeight: 600, color: '#79d2ff' }}>
                        q[{index}]
                      </td>
                      <td>
                        [{vec[0].toFixed(3)}, {vec[1].toFixed(3)},{' '}
                        {vec[2].toFixed(3)}]
                      </td>
                      <td>{r.toFixed(3)}</td>
                      <td style={{ color: '#a3d5f2' }}>{purityNote}</td>
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
        <div style={panelBox}>
          {!densityMatrices.length && (
            <div style={emptyText}>No density matrices available.</div>
          )}
          {densityMatrices.map((matrix, idx) => (
            <div
              key={idx}
              style={{
                marginBottom: 12,
                border: '1px solid #2a4254',
                borderRadius: 8,
                overflow: 'hidden'
              }}
            >
              <div
                style={{
                  background: '#132330',
                  padding: '4px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  color: '#cfefff'
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
                                border: '1px solid #2d4254',
                                padding: '4px 6px',
                                textAlign: 'center',
                                fontFamily: 'Courier New, monospace',
                                color: '#dff4ff'
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
            <div style={panelBox}>
              {probabilities && topProbRows.length > 0 && (
                <table style={tableStyle}>
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
                        <td className="qb-bits" style={{ fontWeight: 600 }}>
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
                <table style={tableStyle}>
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
                          <td style={{ fontWeight: 600, color: '#79d2ff' }}>
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
            <div style={panelBox}>
              <table style={tableStyle}>
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
                    .map((row) => (
                      <tr key={row.bits}>
                        <td style={{ fontWeight: 600, color: '#79d2ff' }}>
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

/* ---------------- Styles ---------------- */
const panelBox = {
  marginTop: 8,
  marginBottom: 14,
  background: 'rgba(12,25,36,0.55)',
  border: '1px solid #203445',
  padding: '10px 12px 12px',
  borderRadius: 10,
  boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
};

const emptyText = {
  fontSize: 12,
  color: '#7fb5d9',
  fontStyle: 'italic'
};

const tableStyle = {
  width: '100%',
  borderCollapse: 'collapse',
  fontSize: 11
};

const copyBtnStyle = {
  background: 'linear-gradient(135deg,#1d4c69,#123346)',
  border: '1px solid #265774',
  color: '#d6eefc',
  fontSize: 10,
  fontWeight: 600,
  padding: '4px 8px',
  borderRadius: 6,
  cursor: 'pointer',
  letterSpacing: 0.4
};