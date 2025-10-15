import React, { useMemo, useRef, useState, useEffect } from 'react';
import html2canvas from 'html2canvas';
import AdvancedBlochViewer from '../AdvancedBlochViewer';
import { applyUnitary, G, presets, stateToParams, formatPi, stateToProb } from '../../utils/singleQubitMath';
import './gateLab.css';

export default function GateLabPanel() {
    const viewerRef = useRef(null);

    // Statevector |ψ> = [α, β] complex
    const [state, setState] = useState(presets.zero());
    const baseStateRef = useRef(state); // playback base
    const [theta, setTheta] = useState(Math.PI / 4); // 0..π
    const [phi, setPhi] = useState(0);               // −π..π
    const [useSliderAngle, setUseSliderAngle] = useState(true);
    const [stepPreset, setStepPreset] = useState(Math.PI / 8); // quick ±θ
    const [sequence, setSequence] = useState([]); // [{name, params?}...]
    const [seqIndex, setSeqIndex] = useState(-1);

    const [playing, setPlaying] = useState(false);
    const playingRef = useRef(false);
    useEffect(() => { playingRef.current = playing; }, [playing]);

    const blochVector = useMemo(() => {
        // derive Bloch from current state
        const [a, b] = state;
        const x = 2 * (a.re * b.re + a.im * b.im);
        const y = 2 * (a.re * b.im - a.im * b.re);
        const z = (a.re * a.re + a.im * a.im) - (b.re * b.re + b.im * b.im);
        return [[x, y, z]];
    }, [state]);

    const psiParams = useMemo(() => stateToParams(state), [state]);
    const probs = useMemo(() => stateToProb(state), [state]);

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
            case 'rx': return G.RX(op.theta);
            case 'ry': return G.RY(op.theta);
            case 'rz': return G.RZ(op.theta);
            default: return G.I();
        }
    };

    const cloneState = (st) => st.map(c => ({ re: c.re, im: c.im }));

    const pushGate = (op) => {
        // Apply immediately to current state
        const U = resolveUnitary(op);
        const next = applyUnitary(state, U);
        setState(cloneState(next));
        setSequence(prev => [...prev, op]);
        setSeqIndex(idx => idx + 1);
    };

    const applyPreset = (key) => {
        const s = presets[key]();
        setState(cloneState(s));
        baseStateRef.current = cloneState(s);  // update base for playback
        setSequence([]);
        setSeqIndex(-1);
        setPlaying(false);
    };

    const applyCustomAngles = () => {
        // |ψ> = cos(θ/2)|0> + e^{iφ} sin(θ/2)|1>
        const th = Math.max(0, Math.min(Math.PI, theta));
        const ph = Math.max(-Math.PI, Math.min(Math.PI, phi));
        const a = { re: Math.cos(th / 2), im: 0 };
        const phase = { re: Math.cos(ph), im: Math.sin(ph) };
        const s = Math.sin(th / 2);
        const beta = { re: phase.re * s, im: phase.im * s };
        const newState = [a, beta];
        setState(cloneState(newState));
        baseStateRef.current = cloneState(newState); // update base for playback
        setSequence([]);
        setSeqIndex(-1);
        setPlaying(false);
    };

    // Rebuild state from base + first (i+1) gates
    const updateStateForIndex = (i) => {
        let st = cloneState(baseStateRef.current);
        if (i >= 0) {
            for (let k = 0; k <= i; k++) {
                st = applyUnitary(st, resolveUnitary(sequence[k]));
            }
        }
        setState(cloneState(st));
        setSeqIndex(i);
    };

    const startPlayback = async () => {
        if (!sequence.length) return;
        playingRef.current = true;
        setPlaying(true);

        // Start from base state
        let st = cloneState(baseStateRef.current);
        setState(cloneState(st));
        setSeqIndex(-1);

        for (let i = 0; i < sequence.length; i++) {
            if (!playingRef.current) break;
            // small delay between gates
            await new Promise(r => setTimeout(r, 550));
            st = applyUnitary(st, resolveUnitary(sequence[i]));
            setState(cloneState(st));
            setSeqIndex(i);
        }
        setPlaying(false);
        playingRef.current = false;
    };

    const handlePlayToggle = () => {
        if (!sequence.length) return;
        if (playingRef.current) {
            // Pause
            playingRef.current = false;
            setPlaying(false);
            return;
        }
        // Play
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
                    <AdvancedBlochViewer vectors={blochVector} labels={['|ψ⟩']} />
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
                </div>

                <div className="glab-card">
                    <div className="glab-card-title">Sequence</div>
                    <div className="glab-seq">
                        {sequence.length === 0 && <div className="glab-empty">No gates yet</div>}
                        {sequence.map((op, idx) => (
                            <div key={idx} className={`glab-chip ${idx === seqIndex ? 'active' : ''}`}>
                                {op.name.toUpperCase()}{op.theta != null ? `(${formatPi(op.theta)})` : ''}
                            </div>
                        ))}
                    </div>
                    <div className="glab-row">
                        <button
                            className="qt-btn"
                            onClick={() => {
                                setSequence([]);
                                setSeqIndex(-1);
                                setPlaying(false);
                                playingRef.current = false;
                                setState(cloneState(baseStateRef.current));
                            }}
                        >
                            Clear
                        </button>
                        <button
                            className="qt-btn"
                            onClick={() => {
                                const ni = Math.max(-1, seqIndex - 1);
                                updateStateForIndex(ni);
                            }}
                            disabled={sequence.length === 0 || seqIndex < 0}
                        >
                            Prev
                        </button>
                        <button
                            className="qt-btn"
                            onClick={() => {
                                const ni = Math.min(sequence.length - 1, seqIndex + 1);
                                updateStateForIndex(ni);
                            }}
                            disabled={sequence.length === 0 || seqIndex >= sequence.length - 1}
                        >
                            Next
                        </button>
                        <button
                            className="qt-btn primary"
                            disabled={!sequence.length}
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