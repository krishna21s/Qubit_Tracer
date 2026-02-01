import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import html2canvas from 'html2canvas';
import AdvancedBlochViewer from '../AdvancedBlochViewer';
import { applyUnitary, G, presets, stateToParams, formatPi, stateToProb, c } from '../../utils/singleQubitMath';
import './gateLab.css';

// Preset display names
const PRESET_LABELS = {
    zero: '|0⟩',
    one: '|1⟩',
    plus: '|+⟩',
    minus: '|-⟩',
    plusI: '|+i⟩',
    minusI: '|-i⟩',
    custom: 'Custom'
};

export default function GateLabPanel() {
    const viewerRef = useRef(null);

    // Statevector |ψ⟩ = [α, β] complex
    const [state, setState] = useState(presets.zero());
    const [theta, setTheta] = useState(Math.PI / 4);
    const [phi, setPhi] = useState(0);
    const [useSliderAngle, setUseSliderAngle] = useState(true);
    const [stepPreset, setStepPreset] = useState(Math.PI / 8);
    
    // Sequence now includes both states and gates
    // Format: { type: 'state' | 'gate', name: string, state?: [...], theta?: number }
    const [sequence, setSequence] = useState([{ type: 'state', name: 'zero', state: presets.zero() }]);
    const [seqIndex, setSeqIndex] = useState(0);
    
    // Reset key for BlochViewer trajectory
    const [resetKey, setResetKey] = useState(0);

    const [playing, setPlaying] = useState(false);
    const playingRef = useRef(false);
    useEffect(() => { playingRef.current = playing; }, [playing]);

    const blochVector = useMemo(() => {
        const [a, b] = state;
        const x = 2 * (a.re * b.re + a.im * b.im);
        const y = 2 * (a.re * b.im - a.im * b.re);
        const z = (a.re * a.re + a.im * a.im) - (b.re * b.re + b.im * b.im);
        return [[x, y, z]];
    }, [state]);

    const psiParams = useMemo(() => stateToParams(state), [state]);
    const probs = useMemo(() => stateToProb(state), [state]);

    const cloneState = (st) => st.map(c => ({ re: c.re, im: c.im }));

    const resolveUnitary = (op) => {
        switch (op.name) {
            case 'x': return G.X();
            case 'y': return G.Y();
            case 'z': return G.Z();
            case 'h': return G.H();
            case 's': return G.S();
            case 'sdg': return G.SDG();
            case 't': return G.T();
            case 'tdg': return G.TDG();
            case 'sx': return G.SX();
            case 'sxdg': return G.SXDG();
            case 'rx': return G.RX(op.theta);
            case 'ry': return G.RY(op.theta);
            case 'rz': return G.RZ(op.theta);
            default: return G.I();
        }
    };

    // Get state at a specific sequence index
    const getStateAtIndex = useCallback((targetIndex) => {
        if (targetIndex < 0 || !sequence.length) return presets.zero();
        
        // Find the last state before or at this index
        let baseState = presets.zero();
        let gateStartIndex = 0;
        
        for (let i = 0; i <= targetIndex && i < sequence.length; i++) {
            if (sequence[i].type === 'state') {
                baseState = sequence[i].state ? cloneState(sequence[i].state) : presets[sequence[i].name]();
                gateStartIndex = i + 1;
            }
        }
        
        // Apply gates from gateStartIndex to targetIndex
        let st = cloneState(baseState);
        for (let i = gateStartIndex; i <= targetIndex && i < sequence.length; i++) {
            if (sequence[i].type === 'gate') {
                st = applyUnitary(st, resolveUnitary(sequence[i]));
            } else if (sequence[i].type === 'measure') {
                // For measurement, use the recorded result
                st = sequence[i].result === 0 ? presets.zero() : presets.one();
            }
        }
        return st;
    }, [sequence]);

    const pushGate = (op) => {
        const currentState = getStateAtIndex(seqIndex);
        const U = resolveUnitary(op);
        const next = applyUnitary(currentState, U);
        setState(cloneState(next));
        
        // Add gate to sequence
        const newSeq = sequence.slice(0, seqIndex + 1);
        newSeq.push({ type: 'gate', ...op });
        setSequence(newSeq);
        setSeqIndex(newSeq.length - 1);
    };

    const applyPreset = (key) => {
        const s = presets[key]();
        setState(cloneState(s));
        
        // Add state to sequence (replaces everything after current position)
        const newSeq = sequence.slice(0, seqIndex + 1);
        newSeq.push({ type: 'state', name: key, state: cloneState(s) });
        setSequence(newSeq);
        setSeqIndex(newSeq.length - 1);
        setPlaying(false);
    };

    const applyCustomAngles = () => {
        const th = Math.max(0, Math.min(Math.PI, theta));
        const ph = Math.max(-Math.PI, Math.min(Math.PI, phi));
        const a = { re: Math.cos(th / 2), im: 0 };
        const phase = { re: Math.cos(ph), im: Math.sin(ph) };
        const s = Math.sin(th / 2);
        const beta = { re: phase.re * s, im: phase.im * s };
        const newState = [a, beta];
        setState(cloneState(newState));
        
        // Add custom state to sequence
        const newSeq = sequence.slice(0, seqIndex + 1);
        newSeq.push({ type: 'state', name: 'custom', state: cloneState(newState), theta: th, phi: ph });
        setSequence(newSeq);
        setSeqIndex(newSeq.length - 1);
        setPlaying(false);
    };

    const performMeasurement = () => {
        const { p0 } = stateToProb(state);
        const result = Math.random() < p0 ? 0 : 1;
        const collapsedState = result === 0 ? presets.zero() : presets.one();
        setState(cloneState(collapsedState));
        
        // Add measurement to sequence
        const newSeq = sequence.slice(0, seqIndex + 1);
        newSeq.push({ type: 'measure', name: 'measure', result, probability: result === 0 ? p0 : 1 - p0 });
        setSequence(newSeq);
        setSeqIndex(newSeq.length - 1);
    };

    const updateStateForIndex = (i) => {
        const newState = getStateAtIndex(i);
        setState(cloneState(newState));
        setSeqIndex(i);
    };

    const handleClear = () => {
        const initialState = presets.zero();
        setState(cloneState(initialState));
        setSequence([{ type: 'state', name: 'zero', state: cloneState(initialState) }]);
        setSeqIndex(0);
        setPlaying(false);
        playingRef.current = false;
        // Increment reset key to clear BlochViewer trajectory
        setResetKey(k => k + 1);
    };

    const startPlayback = async () => {
        if (sequence.length <= 1) return;
        playingRef.current = true;
        setPlaying(true);

        // Start from beginning
        updateStateForIndex(0);
        await new Promise(r => setTimeout(r, 400));

        for (let i = 1; i < sequence.length; i++) {
            if (!playingRef.current) break;
            await new Promise(r => setTimeout(r, 550));
            updateStateForIndex(i);
        }
        setPlaying(false);
        playingRef.current = false;
    };

    const handlePlayToggle = () => {
        if (sequence.length <= 1) return;
        if (playingRef.current) {
            playingRef.current = false;
            setPlaying(false);
            return;
        }
        startPlayback();
    };

    const exportPNG = async () => {
        if (!viewerRef.current) return;
        try {
            const canvas = await html2canvas(viewerRef.current, { backgroundColor: '#0b1623', scale: 2, useCORS: true });
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            const ts = new Date().toISOString().replace(/[:.]/g, '-');
            a.download = `gate-lab-${ts}.png`;
            a.click();
        } catch {
            alert('Export failed');
        }
    };

    const angleForRot = useMemo(() => (useSliderAngle ? theta : stepPreset), [useSliderAngle, theta, stepPreset]);

    const addRot = (axis, sign) => {
        pushGate({ name: `r${axis}`, theta: angleForRot * (sign < 0 ? -1 : 1) });
    };

    const getSequenceLabel = (item, idx) => {
        if (item.type === 'state') {
            if (item.name === 'custom') {
                return `State(${formatPi(item.theta)}, ${formatPi(item.phi)})`;
            }
            return `State: ${PRESET_LABELS[item.name] || item.name}`;
        }
        if (item.type === 'measure') {
            return `Measure → ${item.result}`;
        }
        // Gate
        const name = item.name.toUpperCase();
        if (item.theta != null) {
            return `${name}(${formatPi(item.theta)})`;
        }
        return name;
    };

    const formulaText = '|ψ⟩ = cos(θ/2)|0⟩ + e^{iφ} sin(θ/2)|1⟩';

    return (
        <div className="glab-root">
            <div className="glab-left" ref={viewerRef}>
                <div className="glab-header">
                    <div className="glab-title">Single‑Qubit Visualizer</div>
                    <div className="glab-actions">
                        <button className="qt-btn" onClick={exportPNG}>Export PNG</button>
                    </div>
                </div>
                <div className="glab-viewer">
                    <AdvancedBlochViewer 
                        key={resetKey}
                        vectors={blochVector} 
                        labels={['|ψ⟩']} 
                    />
                </div>
                <div className="glab-formula">
                    {formulaText}
                    <div className="glab-sub">
                        θ ≈ {formatPi(psiParams.theta)}, φ ≈ {formatPi(psiParams.phi)} • |α|²={(probs.p0 * 100).toFixed(2)}% | |β|²={(probs.p1 * 100).toFixed(2)}%
                    </div>
                </div>
            </div>

            <div className="glab-right">
                <div className="glab-card">
                    <div className="glab-card-title">Initial State</div>
                    <div className="glab-row">
                        <div className="glab-presets">
                            <button className="qt-btn" onClick={() => applyPreset('zero')}>|0⟩</button>
                            <button className="qt-btn" onClick={() => applyPreset('one')}>|1⟩</button>
                            <button className="qt-btn" onClick={() => applyPreset('plus')}>|+⟩</button>
                            <button className="qt-btn" onClick={() => applyPreset('minus')}>|-⟩</button>
                            <button className="qt-btn" onClick={() => applyPreset('plusI')}>|+i⟩</button>
                            <button className="qt-btn" onClick={() => applyPreset('minusI')}>|-i⟩</button>
                        </div>
                    </div>
                    <div className="glab-subtle">or set custom angles</div>
                    <div className="glab-row sliders">
                        <div className="glab-slider">
                            <label>θ (0 → π)</label>
                            <input type="range" min={0} max={Math.PI} step={Math.PI / 180} value={theta} onChange={e => setTheta(parseFloat(e.target.value))} />
                            <div className="glab-note">{formatPi(theta)}</div>
                        </div>
                        <div className="glab-slider">
                            <label>φ (−π → π)</label>
                            <input type="range" min={-Math.PI} max={Math.PI} step={Math.PI / 180} value={phi} onChange={e => setPhi(parseFloat(e.target.value))} />
                            <div className="glab-note">{formatPi(phi)}</div>
                        </div>
                        <button className="qt-btn primary" onClick={applyCustomAngles}>Apply</button>
                    </div>
                </div>

                <div className="glab-card">
                    <div className="glab-card-title">Gates</div>
                    <div className="glab-gates">
                        <div className="glab-gcol">
                            <button className="qt-btn" onClick={() => pushGate({ name: 'x' })}>X</button>
                            <button className="qt-btn" onClick={() => pushGate({ name: 'y' })}>Y</button>
                            <button className="qt-btn" onClick={() => pushGate({ name: 'z' })}>Z</button>
                            <button className="qt-btn" onClick={() => pushGate({ name: 'h' })}>H</button>
                            <button className="qt-btn" onClick={() => pushGate({ name: 's' })}>S</button>
                            <button className="qt-btn" onClick={() => pushGate({ name: 'sdg' })}>S†</button>
                            <button className="qt-btn" onClick={() => pushGate({ name: 't' })}>T</button>
                            <button className="qt-btn" onClick={() => pushGate({ name: 'tdg' })}>T†</button>
                            <button className="qt-btn" onClick={() => pushGate({ name: 'sx' })}>√X</button>
                            <button className="qt-btn" onClick={() => pushGate({ name: 'sxdg' })}>√X†</button>
                        </div>
                        <div className="glab-gcol">
                            <div className="glab-rot-head">
                                <span>Rotations (θ)</span>
                                <label className="glab-switch">
                                    <input type="checkbox" checked={useSliderAngle} onChange={e => setUseSliderAngle(e.target.checked)} />
                                    <span>Use slider angle</span>
                                </label>
                            </div>
                            {!useSliderAngle && (
                                <div className="glab-steps">
                                    Step:
                                    <button className={`qt-btn ${stepPreset === Math.PI / 8 ? 'active' : ''}`} onClick={() => setStepPreset(Math.PI / 8)}>π/8</button>
                                    <button className={`qt-btn ${stepPreset === Math.PI / 12 ? 'active' : ''}`} onClick={() => setStepPreset(Math.PI / 12)}>π/12</button>
                                </div>
                            )}
                            <div className="glab-rot">
                                <button className="qt-btn" onClick={() => addRot('x', +1)}>Rx +θ</button>
                                <button className="qt-btn" onClick={() => addRot('x', -1)}>Rx −θ</button>
                                <button className="qt-btn" onClick={() => addRot('y', +1)}>Ry +θ</button>
                                <button className="qt-btn" onClick={() => addRot('y', -1)}>Ry −θ</button>
                                <button className="qt-btn" onClick={() => addRot('z', +1)}>Rz +θ</button>
                                <button className="qt-btn" onClick={() => addRot('z', -1)}>Rz −θ</button>
                            </div>
                        </div>
                    </div>
                    <div className="glab-measure-section">
                        <button className="qt-btn measure-btn" onClick={performMeasurement}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10"/>
                                <path d="M12 12L12 6"/>
                                <path d="M12 12L16 16"/>
                            </svg>
                            Measure
                        </button>
                    </div>
                </div>

                <div className="glab-card">
                    <div className="glab-card-title">
                        Sequence
                        <span className="glab-seq-count">{sequence.length} step{sequence.length !== 1 ? 's' : ''}</span>
                    </div>
                    <div className="glab-seq">
                        {sequence.map((item, idx) => (
                            <div 
                                key={idx} 
                                className={`glab-chip ${idx === seqIndex ? 'active' : ''} ${item.type}`}
                                onClick={() => updateStateForIndex(idx)}
                                title={`Step ${idx + 1}: Click to jump here`}
                            >
                                <span className="glab-chip-num">{idx + 1}</span>
                                {getSequenceLabel(item, idx)}
                            </div>
                        ))}
                    </div>
                    <div className="glab-row">
                        <button className="qt-btn" onClick={handleClear}>Clear</button>
                        <button
                            className="qt-btn"
                            onClick={() => {
                                const ni = Math.max(0, seqIndex - 1);
                                updateStateForIndex(ni);
                            }}
                            disabled={seqIndex <= 0}
                        >
                            Prev
                        </button>
                        <button
                            className="qt-btn"
                            onClick={() => {
                                const ni = Math.min(sequence.length - 1, seqIndex + 1);
                                updateStateForIndex(ni);
                            }}
                            disabled={seqIndex >= sequence.length - 1}
                        >
                            Next
                        </button>
                        <button
                            className="qt-btn primary"
                            disabled={sequence.length <= 1}
                            onClick={handlePlayToggle}
                            title={playing ? 'Pause' : 'Play'}
                        >
                            {playing ? 'Pause' : 'Play'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}