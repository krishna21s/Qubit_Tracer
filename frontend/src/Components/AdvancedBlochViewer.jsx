import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  useCallback
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import html2canvas from "html2canvas";
import AdvancedBlochSphereAdvanced from "./AdvancedBlochSphereAdvanced";
import "../styles/blochTheme.css"; // NEW: theme variables for viewer

const DEFAULT_PATH_PALETTE = [
  "#ff2f43",
  "#ff8c00",
  "#ffd300",
  "#3ddc97",
  "#19b5fe",
  "#8968ff",
  "#ff5fbf",
  "#00c2ff",
  "#b4de2e",
  "#ff7ad9"
];

/**
 * AdvancedBlochViewer (printing-friendly minor enhancement)
 *
 * New (minimal) feature:
 *  - Optional props: cameraPosition = [x,y,z], cameraTarget = [x,y,z]
 *  - Optional props: effects = string[] (per-qubit gate tag) and stepKey (number)
 *    These are used only to trigger a subtle pulse on affected spheres per step.
 *  - Theme-aware via CSS variables (see blochTheme.css). Also respects --qt-bloch-quality
 *    for low-end optimization (affects DPR/antialias/segments).
 */
export default function AdvancedBlochViewer({
  vectors = [],
  labels = [],
  showInfoDefault = true,
  spacing = 3.7,
  background = "#050b14",
  cameraPosition,      // optional
  cameraTarget,        // optional
  effects = [],        // optional: per-qubit effect tags (e.g., 'h','cx-control','measure')
  stepKey               // optional: increments each step to re-trigger effects
}) {
  const [showInfo, setShowInfo] = useState(showInfoDefault);
  const [showPaths, setShowPaths] = useState(true);
  const [showAxes, setShowAxes] = useState(true);
  const [showGrid, setShowGrid] = useState(true);
  const [pathFade, setPathFade] = useState(false);
  const [pathThickness, setPathThickness] = useState(0.03);
  const [focusIndex, setFocusIndex] = useState(null);
  const [showProjections, setShowProjections] = useState(false);
  const [tooltipEnabled, setTooltipEnabled] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  const [forceSingleRow, setForceSingleRow] = useState(false);

  const [showMainControlPanel, setShowMainControlPanel] = useState(false);
  const [showNavPanel, setShowNavPanel] = useState(false);
  const [screenshotMode, setScreenshotMode] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const cameraRef = useRef();
  const controlsRef = useRef();
  const canvasWrapperRef = useRef();
  const raycaster = useRef(new THREE.Raycaster());
  const pointer = useRef(new THREE.Vector2());

  const count = Math.max(1, vectors.length);
  const autoGridThreshold = 4;

  // Read CSS variables (once per mount + when container changes)
  const [blochTheme, setBlochTheme] = useState(() => ({
    colors: {
      bg: background,
      grid: "rgba(255,255,255,0.28)",
      axisX: "#ff3a33",
      axisY: "#20b44a",
      axisZ: "#2d74ff",
      arrow: "#d39a16",
      tip: "#ffd56b",
      label: "#ffffff",
      labelDim: "#7d8894",
      accent: "#66d8ff",
      accentAlt: "#1781cc"
    },
    quality: 1
  }));

  useEffect(() => {
    if (!canvasWrapperRef.current) return;
    const cs = getComputedStyle(canvasWrapperRef.current);
    const get = (n, fb) => {
      const v = cs.getPropertyValue(n);
      return (v && v.trim()) || fb;
    };
    const qRaw = parseFloat(get("--qt-bloch-quality", "1"));
    const q = Number.isFinite(qRaw) ? Math.max(0.5, Math.min(1.25, qRaw)) : 1;

    setBlochTheme({
      colors: {
        bg: get("--qt-bloch-bg", background),
        grid: get("--qt-bloch-grid", "rgba(255,255,255,0.28)"),
        axisX: get("--qt-bloch-axis-x", "#ff3a33"),
        axisY: get("--qt-bloch-axis-y", "#20b44a"),
        axisZ: get("--qt-bloch-axis-z", "#2d74ff"),
        arrow: get("--qt-bloch-arrow", "#d39a16"),
        tip: get("--qt-bloch-tip", "#ffd56b"),
        label: get("--qt-bloch-label", "#ffffff"),
        labelDim: get("--qt-bloch-label-dim", "#7d8894"),
        accent: get("--qt-bloch-accent", "#66d8ff"),
        accentAlt: get("--qt-bloch-accent-alt", "#1781cc")
      },
      quality: q
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vectors.length, stepKey]);

  const layoutPositions = useMemo(() => {
    if (forceSingleRow || count <= autoGridThreshold) {
      if (count === 1) return [[0, 0, 0]];
      const start = -((count - 1) * spacing) / 2;
      return Array.from({ length: count }).map((_, i) => [
        start + i * spacing,
        0,
        0
      ]);
    }
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);
    const rowSpacing = spacing * 1.05;
    const colSpacing = spacing;
    const totalW = (cols - 1) * colSpacing;
    const totalH = (rows - 1) * rowSpacing;
    return Array.from({ length: count }).map((_, i) => {
      const r = Math.floor(i / cols);
      const c = i % cols;
      const x = c * colSpacing - totalW / 2;
      const y = -(r * rowSpacing - totalH / 2);
      return [x, y, 0];
    });
  }, [count, spacing, forceSingleRow]);

  function sanitizeVector(v) {
    if (!Array.isArray(v) || v.length < 3) return [0, 0, 0];
    const [x, y, z] = v.map(n =>
      typeof n === "number" && isFinite(n) ? n : 0
    );
    const mag = Math.sqrt(x * x + y * y + z * z);
    if (mag > 1e-8 && mag > 1) {
      const s = 1 / mag;
      return [x * s, y * s, z * s];
    }
    return [x, y, z];
  }

  // Build a theme-driven palette (fallback to previous static palette)
  const palette = useMemo(() => {
    const a = blochTheme.colors.accent;
    const b = blochTheme.colors.accentAlt;
    try {
      const toRgb = (hex) => {
        const h = hex.replace("#", "");
        const bigint = parseInt(h.length === 3
          ? h.split("").map(c => c + c).join("")
          : h, 16);
        return {
          r: (bigint >> 16) & 255,
          g: (bigint >> 8) & 255,
          b: bigint & 255
        };
      };
      const toHex = ({ r, g, b }) =>
        "#" +
        [r, g, b]
          .map((v) => {
            const s = v.toString(16);
            return s.length === 1 ? "0" + s : s;
          })
          .join("");

      const mix = (rgb1, rgb2, t) => ({
        r: Math.round(rgb1.r * (1 - t) + rgb2.r * t),
        g: Math.round(rgb1.g * (1 - t) + rgb2.g * t),
        b: Math.round(rgb1.b * (1 - t) + rgb2.b * t)
      });

      const rgbA = toRgb(a || "#66d8ff");
      const rgbB = toRgb(b || "#1781cc");
      const arr = [];
      for (let i = 0; i < 10; i++) {
        const t = i / 9;
        arr.push(toHex(mix(rgbA, rgbB, t)));
      }
      return arr;
    } catch {
      return DEFAULT_PATH_PALETTE;
    }
  }, [blochTheme.colors.accent, blochTheme.colors.accentAlt]);

  const [rotationHistory, setRotationHistory] = useState([]);
  const [hoverTooltip, setHoverTooltip] = useState(null);

  const MIN_DIST = 0.18;
  const MAX_DIST = 60;

  const zoomCamera = useCallback((factor) => {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;
    const target = ctrl.target.clone();
    const dir = cam.position.clone().sub(target);
    dir.multiplyScalar(factor);
    const dist = dir.length();
    if (dist < MIN_DIST) dir.setLength(MIN_DIST);
    if (dist > MAX_DIST) dir.setLength(MAX_DIST);
    cam.position.copy(target).add(dir);
    cam.updateProjectionMatrix();
    ctrl.update();
  }, []);

  const panCamera = useCallback((dx, dy) => {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;
    const dist = cam.position.distanceTo(ctrl.target);
    const panScale = dist * 0.12;
    const te = cam.matrix.elements;
    const xAxis = new THREE.Vector3(te[0], te[1], te[2]).multiplyScalar(
      -dx * panScale
    );
    const yAxis = new THREE.Vector3(te[4], te[5], te[6]).multiplyScalar(
      dy * panScale
    );
    const move = xAxis.add(yAxis);
    cam.position.add(move);
    ctrl.target.add(move);
    ctrl.update();
  }, []);

  const fitAll = useCallback(() => {
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (!cam || !ctrl) return;
    if (!layoutPositions.length) return;
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    layoutPositions.forEach(([x, y]) => {
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    });
    const spanX = maxX - minX;
    const spanY = maxY - minY;
    const span = Math.max(spanX, spanY);
    const dist = Math.max(3.2, span * 0.85 + 2.2);
    cam.position.set(0, 0, dist);
    ctrl.target.set(0, 0, 0);
    cam.updateProjectionMatrix();
    ctrl.update();
    setFocusIndex(null);
  }, [layoutPositions]);

  // Initial fit + apply optional external camera override
  useEffect(() => {
    fitAll();
    if (cameraPosition && Array.isArray(cameraPosition) && cameraPosition.length === 3) {
      const cam = cameraRef.current;
      const ctrl = controlsRef.current;
      if (cam) {
        cam.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
        cam.updateProjectionMatrix();
      }
      if (ctrl && cameraTarget && Array.isArray(cameraTarget) && cameraTarget.length === 3) {
        ctrl.target.set(cameraTarget[0], cameraTarget[1], cameraTarget[2]);
        ctrl.update();
      } else if (ctrl) {
        ctrl.target.set(0, 0, 0);
        ctrl.update();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count, layoutPositions, fitAll]);

  // If parent changes cameraPosition later AND no focus is active, allow adjusting
  useEffect(() => {
    if (!cameraPosition || focusIndex != null) return;
    if (!Array.isArray(cameraPosition) || cameraPosition.length !== 3) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;
    if (cam) {
      cam.position.set(cameraPosition[0], cameraPosition[1], cameraPosition[2]);
      cam.updateProjectionMatrix();
    }
    if (ctrl && cameraTarget && Array.isArray(cameraTarget) && cameraTarget.length === 3) {
      ctrl.target.set(cameraTarget[0], cameraTarget[1], cameraTarget[2]);
      ctrl.update();
    }
  }, [cameraPosition, cameraTarget, focusIndex]);

  const registerPath = useCallback((record) => {
    setRotationHistory(h => [...h, record]);
  }, []);

  const exportHistory = useCallback(() => {
    if (!rotationHistory.length) {
      alert("No rotation history yet.");
      return;
    }
    const blob = new Blob([JSON.stringify(rotationHistory, null, 2)], {
      type: "application/json"
    });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    a.download = `rotation-history-${ts}.json`;
    a.click();
  }, [rotationHistory]);

  const clearHistory = useCallback(() => {
    setRotationHistory([]);
    setShowPaths(false);
    setTimeout(() => setShowPaths(true), 15);
  }, []);

  const adjustThickness = (delta) => {
    setPathThickness(t => {
      const nt = Math.min(0.25, Math.max(0.005, t + delta));
      return parseFloat(nt.toFixed(4));
    });
  };

  const handlePointerMove = (e) => {
    if (!tooltipEnabled || !showPaths) return;
    const rect = e.currentTarget.getBoundingClientRect();
    pointer.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    pointer.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
  };

  function TooltipRaycaster() {
    const { scene, camera } = useThree();
    useFrame(() => {
      if (!tooltipEnabled || !showPaths) return;
      if (!cameraRef.current) return;
      raycaster.current.setFromCamera(pointer.current, camera);
      const meshes = [];
      scene.traverse(obj => {
        if (
          obj.userData &&
          obj.userData.isRotationPath &&
          obj.userData.meta &&
          obj.visible
        ) {
          meshes.push(obj);
        }
      });
      const intersects = raycaster.current.intersectObjects(meshes, false);
      if (intersects.length) {
        const m = intersects[0].object;
        const meta = m.userData.meta;
        const axis = meta.axis
          .toArray()
          .map(c => c.toFixed(2))
          .join(", ");
        setHoverTooltip({
          x: intersects[0].point.x,
          y: intersects[0].point.y,
          z: intersects[0].point.z,
          text: `${meta.label}\nAngle: ${meta.angleDeg.toFixed(2)}°\nAxis: (${axis})`
        });
      } else {
        setHoverTooltip(null);
      }
    });
    return null;
  }

  useEffect(() => {
    function onKey(e) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "s") return;
      if (!cameraRef.current) return;
      if (e.target && ["INPUT", "TEXTAREA"].includes(e.target.tagName)) return;
      const fine = e.shiftKey;
      switch (e.key) {
        case "i": case "I": setShowInfo(s => !s); break;
        case "p": case "P": setShowPaths(s => !s); break;
        case "a": case "A": setShowAxes(s => !s); break;
        case "g": case "G": setShowGrid(s => !s); break;
        case "f": case "F": setPathFade(s => !s); break;
        case "[": adjustThickness(-0.005); break;
        case "]": adjustThickness(0.005); break;
        case "o": case "O": setShowProjections(s => !s); break;
        case "t": case "T": setTooltipEnabled(s => !s); break;
        case "l": case "L": setForceSingleRow(s => !s); break;
        case "e": case "E": exportHistory(); break;
        case "h": case "H": clearHistory(); break;
        case "?": setHelpVisible(v => !v); break;
        case "Escape": setFocusIndex(null); break;
        case "+": case "=": zoomCamera(fine ? 0.985 : 0.95); break;
        case "-": case "_": zoomCamera(fine ? 1.015 : 1.05); break;
        case "ArrowLeft": panCamera(1, 0); break;
        case "ArrowRight": panCamera(-1, 0); break;
        case "ArrowUp": panCamera(0, 1); break;
        case "ArrowDown": panCamera(0, -1); break;
        case "0": fitAll(); break;
        default: break;
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [zoomCamera, panCamera, fitAll, exportHistory, clearHistory]);

  const handleSphereClick = (idx) => {
    setFocusIndex(cur => (cur === idx ? null : idx));
  };

  const holdRepeat = (fn, interval = 140) => {
    let active = true;
    fn();
    const id = setInterval(() => active && fn(), interval);
    return () => { active = false; clearInterval(id); };
  };

  function IconButton({ glyph, title, onClick, onHold }) {
    return (
      <button
        title={title}
        onClick={onClick || onHold}
        onMouseDown={
          onHold
            ? (e) => {
              e.preventDefault();
              const stop = holdRepeat(onHold);
              const up = () => {
                window.removeEventListener("mouseup", up);
                stop();
              };
              window.addEventListener("mouseup", up);
            }
            : undefined
        }
        style={{
          width: 38,
          height: 38,
          background: "rgba(15,30,46,0.8)",
          border: "1px solid #274459",
          color: "#d6eefc",
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 10,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(0,0,0,0.4)"
        }}
      >
        {glyph}
      </button>
    );
  }

  const handleScreenshot = async () => {
    const wrapperEl = canvasWrapperRef.current;
    const canvasEl = wrapperEl?.querySelector("canvas");
    if (!wrapperEl || !canvasEl) {
      alert("Canvas not ready for screenshot.");
      return;
    }
    const prev = {
      showMainControlPanel,
      showNavPanel,
      showInfo,
      helpVisible,
      tooltipEnabled,
      showHint
    };
    try {
      setScreenshotMode(true);
      setShowMainControlPanel(false);
      setShowNavPanel(false);
      setShowInfo(false);
      setHelpVisible(false);
      setTooltipEnabled(false);
      setShowHint(false);

      await new Promise(r => requestAnimationFrame(() =>
        requestAnimationFrame(r)
      ));

      let dataURL = null;
      try {
        const canvasShot = await html2canvas(wrapperEl, {
          backgroundColor: blochTheme.colors.bg || background,
          scale: 2,
          useCORS: true
        });
        dataURL = canvasShot.toDataURL("image/png");
      } catch (e) {
        try {
          dataURL = canvasEl.toDataURL("image/png");
        } catch { }
      }

      if (dataURL) {
        const link = document.createElement("a");
        const ts = new Date().toISOString().replace(/[:.]/g, "-");
        link.download = `bloch-visualization-${ts}.png`;
        link.href = dataURL;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        alert("Screenshot failed.");
      }
    } finally {
      setShowMainControlPanel(prev.showMainControlPanel);
      setShowNavPanel(prev.showNavPanel);
      setShowInfo(prev.showInfo);
      setHelpVisible(prev.helpVisible);
      setTooltipEnabled(prev.tooltipEnabled);
      setShowHint(prev.showHint);
      setScreenshotMode(false);
    }
  };

  // DPR / Antialias tuning for low-end template
  const computedDpr = useMemo(() => {
    const q = blochTheme.quality;
    const cap = q < 0.75 ? 1.25 : q < 0.9 ? 1.75 : 2;
    const scale = q < 0.75 ? 0.75 : 1;
    return Math.min(cap, window.devicePixelRatio * scale);
  }, [blochTheme.quality]);

  const glAntialias = blochTheme.quality >= 0.7;

  return (
    <div
      ref={canvasWrapperRef}
      style={{ width: "100%", height: "100%", position: "relative" }}
      onPointerMove={handlePointerMove}
    >
      {showMainControlPanel ? (
        <div
          style={{
            position: "absolute",
            top: 10,
            left: 10,
            zIndex: 25,
            display: "flex",
            gap: 8,
            flexWrap: "wrap",
            maxWidth: 560
          }}
        >
          <button onClick={() => setShowInfo(s => !s)} style={btnStyle} title="Toggle info (I)">
            {showInfo ? "Info ✔" : "Info ✖"}
          </button>
          <button onClick={() => setShowPaths(s => !s)} style={btnStyle} title="Toggle paths (P)">
            {showPaths ? "Paths ✔" : "Paths ✖"}
          </button>
          <button onClick={() => setShowAxes(s => !s)} style={btnStyle} title="Toggle axes (A)">
            {showAxes ? "Axes ✔" : "Axes ✖"}
          </button>
          <button onClick={() => setShowGrid(s => !s)} style={btnStyle} title="Toggle grid (G)">
            {showGrid ? "Grid ✔" : "Grid ✖"}
          </button>
          <button onClick={() => setPathFade(s => !s)} style={btnStyle} title="Toggle fading (F)">
            {pathFade ? "Fade ✔" : "Fade ✖"}
          </button>
          <button
            onClick={() => setShowProjections(s => !s)}
            style={btnStyle}
            title="Toggle projections (O)"
          >
            {showProjections ? "Proj ✔" : "Proj ✖"}
          </button>
          <button
            onClick={() => setTooltipEnabled(s => !s)}
            style={btnStyle}
            title="Toggle tooltips (T)"
          >
            {tooltipEnabled ? "Tips ✔" : "Tips ✖"}
          </button>
          <button
            onClick={() => adjustThickness(0.005)}
            style={btnStyle}
            title="Increase path thickness (])"
          >
            Path +
          </button>
          <button
            onClick={() => adjustThickness(-0.005)}
            style={btnStyle}
            title="Decrease path thickness ([)"
          >
            Path −
          </button>
          <button
            onClick={() => setForceSingleRow(s => !s)}
            style={btnStyle}
            title="Toggle layout (L)"
          >
            {forceSingleRow ? "Row" : "Grid"}
          </button>
          <button onClick={exportHistory} style={btnStyle} title="Export history (E)">
            Export
          </button>
          <button onClick={clearHistory} style={btnStyle} title="Clear history (H)">
            Clear H
          </button>
          <button
            onClick={() => setHelpVisible(v => !v)}
            style={btnStyle}
            title="Help (?)"
          >
            ?
          </button>
          <button
            onClick={handleScreenshot}
            style={btnStyle}
            title="Download clean PNG (includes basis labels)"
            disabled={screenshotMode}
          >
            Shot
          </button>
          <button
            onClick={() => setShowMainControlPanel(false)}
            style={btnStyle}
            title="Hide control buttons"
          >
            Hide
          </button>
        </div>
      ) : (
        !screenshotMode && (
          <button
            style={{
              ...btnStyle,
              position: "absolute",
              top: 10,
              left: 10,
              zIndex: 26
            }}
            title="Show controls"
            onClick={() => setShowMainControlPanel(true)}
          >
            Show
          </button>
        )
      )}

      {!screenshotMode && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 620,
            zIndex: 25,
            background: "rgba(15,30,46,0.65)",
            border: "1px solid #274459",
            padding: "6px 10px",
            borderRadius: 10,
            fontSize: 10,
            color: "#cdeafe",
            fontWeight: 600
          }}
        >
          t={pathThickness.toFixed(3)}{" "}
          {focusIndex != null && `• Focus q[${focusIndex}]`}
        </div>
      )}

      {showNavPanel && !screenshotMode ? (
        <div style={navPanelStyle}>
          <div style={{ position: "absolute", top: 6, right: 6 }}>
            <button
              onClick={() => setShowNavPanel(false)}
              style={{
                background: "rgba(15,30,46,0.8)",
                border: "1px solid #274459",
                color: "#d6eefc",
                fontSize: 11,
                fontWeight: 600,
                padding: "4px 8px",
                borderRadius: 6,
                cursor: "pointer"
              }}
              title="Hide navigation controls"
            >
              Hide
            </button>
          </div>
          <div style={navRowStyle}>
            <IconButton
              glyph="↑"
              title="Pan Up (Arrow ↑)"
              onHold={() => panCamera(0, 1)}
            />
          </div>
          <div style={navRowStyle}>
            <IconButton
              glyph="←"
              title="Pan Left (Arrow ←)"
              onHold={() => panCamera(1, 0)}
            />
            <IconButton glyph="⟳" title="Fit All (0)" onClick={fitAll} />
            <IconButton
              glyph="→"
              title="Pan Right (Arrow →)"
              onHold={() => panCamera(-1, 0)}
            />
          </div>
          <div style={navRowStyle}>
            <IconButton
              glyph="↓"
              title="Pan Down (Arrow ↓)"
              onHold={() => panCamera(0, -1)}
            />
          </div>
          <div style={{ marginTop: 6, display: "flex", gap: 6 }}>
            <IconButton
              glyph="+"
              title="Zoom In (+/=) • Shift=fine"
              onHold={() => zoomCamera(0.97)}
            />
            <IconButton
              glyph="−"
              title="Zoom Out (-) • Shift=fine"
              onHold={() => zoomCamera(1.03)}
            />
          </div>
        </div>
      ) : (
        !screenshotMode && (
          <button
            style={{
              ...btnStyle,
              position: "absolute",
              right: 12,
              bottom: 12,
              zIndex: 30
            }}
            title="Show navigation controls"
            onClick={() => setShowNavPanel(true)}
          >
            Nav
          </button>
        )
      )}

      {helpVisible && !screenshotMode && (
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 12,
            zIndex: 40,
            background: "rgba(8,18,28,0.92)",
            border: "1px solid #1d4257",
            padding: "12px 14px",
            borderRadius: 10,
            fontSize: 11,
            lineHeight: 1.55,
            maxWidth: 280,
            color: "#d6f2ff",
            boxShadow: "0 4px 18px rgba(0,0,0,0.4)"
          }}
        >
          <strong>Shortcuts:</strong>
          <br />I info • P paths • A axes • G grid • F fade
          <br />O projections • T tooltips • L layout
          <br />[ / ] thickness • E export history
          <br />H clear history • 0 fit • Arrows pan
          <br />+/- zoom (Shift=fine) • ? help • Esc unfocus
        </div>
      )}

      {hoverTooltip && !screenshotMode && (
        <Tooltip3D
          point={[hoverTooltip.x, hoverTooltip.y, hoverTooltip.z]}
          text={hoverTooltip.text}
        />
      )}

      <Canvas
        camera={{ position: [0, 0, 5.2], fov: 50 }}
        onCreated={({ camera }) => {
          cameraRef.current = camera;
        }}
        gl={{ antialias: glAntialias, powerPreference: blochTheme.quality < 0.75 ? "low-power" : "high-performance" }}
        dpr={computedDpr}
      >
        <color attach="background" args={[blochTheme.colors.bg || background]} />
        <ambientLight intensity={blochTheme.quality < 0.75 ? 0.45 : 0.55} />
        <directionalLight position={[5, 7, 6]} intensity={blochTheme.quality < 0.75 ? 0.8 : 0.95} />
        <group>
          {vectors.map((v, i) => {
            const focused = focusIndex === i;
            const dimOthers = focusIndex != null && !focused;
            const pos = layoutPositions[i];
            const effect = Array.isArray(effects) ? effects[i] || null : null;
            return (
              <group
                key={i}
                position={pos}
                onClick={(e) => {
                  e.stopPropagation();
                  handleSphereClick(i);
                }}
                style={{ cursor: "pointer" }}
              >
                <group
                  scale={focused ? 1.08 : 1}
                  renderOrder={focused ? 10 : 0}
                  opacity={dimOthers ? 0.18 : 1}
                >
                  <AdvancedBlochSphereAdvanced
                    vector={sanitizeVector(v)}
                    label={labels[i] ?? `q[${i}]`}
                    showInfo={showInfo && !dimOthers && !screenshotMode}
                    showPaths={showPaths}
                    showAxes={showAxes}
                    showGrid={showGrid}
                    pathFade={pathFade}
                    pathThickness={pathThickness}
                    pathColor={palette[i % palette.length]}
                    showProjections={showProjections}
                    registerPath={registerPath}
                    tooltipActive={tooltipEnabled && !screenshotMode}
                    effect={effect}
                    stepKey={stepKey}
                    theme={blochTheme} // NEW: pass theme+quality down
                  />
                </group>
              </group>
            );
          })}
        </group>
        <OrbitControls
          ref={controlsRef}
          enablePan
          enableZoom
          enableRotate
          dampingFactor={0.08}
          rotateSpeed={0.9}
          zoomSpeed={0.85}
          minDistance={MIN_DIST}
          maxDistance={MAX_DIST}
        />
        {tooltipEnabled && !screenshotMode && <TooltipRaycaster />}
      </Canvas>

      {!screenshotMode && (
        <button
          onClick={() => setShowHint(h => !h)}
          style={{
            ...btnStyle,
            position: "absolute",
            left: 10,
            bottom: showHint ? 64 : 12,
            zIndex: 32,
            padding: "4px 10px",
            fontSize: 10,
            minWidth: 44
          }}
          title={showHint ? "Hide shortcut hint" : "Show shortcut hint"}
        >
          {!showHint ? "Show guide!" : "hide guide"}
        </button>
      )}

      {showHint && !screenshotMode && (
        <div
          style={{
            position: "absolute",
            bottom: 8,
            left: 10,
            fontSize: 11,
            color: "#8fb1c8",
            fontFamily: "Inter, sans-serif",
            background: "rgba(0,0,0,0.4)",
            padding: "4px 8px",
            borderRadius: 6,
            maxWidth: 560,
            lineHeight: 1.4
          }}
        >
          Click sphere = focus • I=info • P=paths • A=axes • G=grid • F=fade •
          O=proj • T=tooltips • [ / ] thickness • E export • H clear • L layout •
          0 fit • Shift+Zoom fine • ? help
        </div>
      )}
    </div>
  );
}

function Tooltip3D({ point, text }) {
  const ref = useRef();
  const { camera, gl } = useThree();
  useFrame(() => {
    if (!ref.current) return;
    const v = new THREE.Vector3(...point);
    v.project(camera);
    const x = (v.x * 0.5 + 0.5) * gl.domElement.clientWidth;
    const y = (-v.y * 0.5 + 0.5) * gl.domElement.clientHeight;
    ref.current.style.transform = `translate(-50%, -50%) translate(${x}px,${y}px)`;
    ref.current.style.display = v.z < 1 ? "block" : "none";
  });
  return (
    <div
      ref={ref}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 50,
        background: "rgba(10,26,40,0.85)",
        border: "1px solid #2a4f66",
        color: "#d6f2ff",
        padding: "6px 8px",
        borderRadius: 8,
        fontSize: 11,
        whiteSpace: "pre",
        fontFamily: "Inter, sans-serif",
        lineHeight: 1.35,
        boxShadow: "0 4px 16px rgba(0,0,0,0.4)"
      }}
    >
      {text}
    </div>
  );
}

const btnStyle = {
  background: "rgba(8,18,28,0.82)",
  color: "#d5f2ff",
  border: "1px solid #1d4257",
  fontSize: 11,
  fontWeight: 600,
  padding: "6px 10px",
  borderRadius: 8,
  cursor: "pointer",
  backdropFilter: "blur(4px)",
  lineHeight: 1
};

const navPanelStyle = {
  position: "absolute",
  right: 12,
  bottom: 12,
  zIndex: 30,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  background: "rgba(6,18,30,0.55)",
  border: "1px solid #1d4257",
  padding: "10px 12px 12px",
  borderRadius: 14,
  backdropFilter: "blur(6px)",
  boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
  minWidth: 112
};

const navRowStyle = {
  display: "flex",
  gap: 6,
  justifyContent: "center",
  alignItems: "center"
};