import React, { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";

const MIN_VECTOR_LENGTH = 1e-5;
const MIN_AMPLITUDE = 1e-4;

const PHASE_COLOR_STOPS = [
  { angle: 0, color: [74, 144, 226] },
  { angle: 90, color: [167, 108, 255] },
  { angle: 180, color: [255, 82, 82] },
  { angle: 270, color: [64, 201, 187] },
  { angle: 360, color: [74, 144, 226] }
];

function wrap360(deg) {
  if (!Number.isFinite(deg)) return 0;
  const normalized = deg % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

function wrapSignedDeg(deg) {
  if (!Number.isFinite(deg)) return 0;
  const wrapped = ((deg + 180) % 360 + 360) % 360 - 180;
  return Math.abs(wrapped + 180) < 1e-6 ? 180 : wrapped;
}

function phaseAngleToColor(angleDeg = 0) {
  const deg = wrap360(angleDeg);
  for (let i = 0; i < PHASE_COLOR_STOPS.length - 1; i++) {
    const a = PHASE_COLOR_STOPS[i];
    const b = PHASE_COLOR_STOPS[i + 1];
    if (deg >= a.angle && deg <= b.angle) {
      const span = b.angle - a.angle || 1;
      const t = (deg - a.angle) / span;
      const r = Math.round(THREE.MathUtils.lerp(a.color[0], b.color[0], t));
      const g = Math.round(THREE.MathUtils.lerp(a.color[1], b.color[1], t));
      const bl = Math.round(THREE.MathUtils.lerp(a.color[2], b.color[2], t));
      return `rgb(${r}, ${g}, ${bl})`;
    }
  }
  const [r, g, b] = PHASE_COLOR_STOPS[0].color;
  return `rgb(${r}, ${g}, ${b})`;
}

function isClose(a, b, eps = 0.5) {
  return Math.abs(a - b) <= eps;
}

function describePhase(posDeg, signedDeg) {
  if (!Number.isFinite(signedDeg)) return "";
  const normalized = wrap360(Number.isFinite(posDeg) ? posDeg : signedDeg);
  if (isClose(normalized, 0) || isClose(normalized, 360)) return "real +";
  if (isClose(normalized, 180)) return "real -";
  if (isClose(normalized, 90)) return "+i";
  if (isClose(normalized, 270)) return "-i";
  return signedDeg > 0 ? "lead +" : signedDeg < 0 ? "lag -" : "";
}

function formatSignedAngle(value) {
  if (!Number.isFinite(value)) return "—";
  const normalized = Math.abs(value) < 1e-3 ? 0 : value;
  const absVal = Math.abs(normalized);
  const decimals = absVal < 10 && absVal % 1 !== 0 ? 1 : 0;
  const sign = normalized > 0 ? "+" : normalized < 0 ? "-" : "+";
  return `${sign}${absVal.toFixed(decimals)}°`;
}

function formatPositiveAngle(value) {
  if (!Number.isFinite(value)) return "";
  if (Math.abs(value - 360) < 1e-3) return "wrap 360°";
  const normalized = wrap360(value);
  const absVal = Math.abs(normalized);
  const decimals = absVal < 10 && absVal % 1 !== 0 ? 1 : 0;
  return `wrap ${absVal.toFixed(decimals)}°`;
}

/**
 * AdvancedBlochSphereAdvanced
 * Themed + low-end optimized (quality via theme.quality).
 * New:
 *  - theme?: { colors: {...}, quality: number } from parent viewer (optional).
 *  - Internals adapt materials/segments to theme + quality. No external API changes.
 */
export default function AdvancedBlochSphereAdvanced({
  vector = [0, 0, 1],
  label = "q0",
  showInfo = true,
  radius = 1,
  animate = true,
  pathColor = "#ff2f43",
  showPaths = true,
  showAxes = true,
  showGrid = true,
  pathFade = false,
  pathThickness = 0.03,
  maxPaths = 24,
  showProjections = false,
  registerPath,
  tooltipActive = false,
  effect = null,
  stepKey,
  theme // NEW optional
}) {
  const q = theme?.quality ?? 1;
  const colors = theme?.colors || {};
  const pathsGroupRef = useRef(new THREE.Group());
  const purityRef = useRef();
  const arrowGroupRef = useRef();
  const tipRef = useRef();
  const projectionDotsRef = useRef([]);
  const currentDirRef = useRef(new THREE.Vector3(0, 0, 1));
  const targetDirRef = useRef(new THREE.Vector3(0, 0, 1));
  const animStartDirRef = useRef(new THREE.Vector3(0, 0, 1));
  const lastVectorKeyRef = useRef("");
  const progressRef = useRef(1);
  const activeArcRef = useRef(null);

  // Pulse visuals
  const pulseTimeRef = useRef(0); // seconds remaining
  const lastStepKeyRef = useRef(undefined);
  const pulseRingRef = useRef();

  const [localVersionTick, setLocalVersionTick] = useState(0);

  const stats = useMemo(() => {
    const v = new THREE.Vector3(...vector);
    const len = v.length();
    if (len < 1e-9)
      return { theta: 0, phi: 0, alpha: 0.5, beta: 0.5, r: 0 };
    v.normalize();
    const theta = Math.acos(THREE.MathUtils.clamp(v.z, -1, 1));
    const phi = Math.atan2(v.y, v.x);
    const alpha = (1 + v.z) / 2;
    return { theta, phi, alpha, beta: 1 - alpha, r: Math.min(1, len) };
  }, [vector]);

  const phaseInfo = useMemo(() => {
    const length = new THREE.Vector3(...vector).length();
    if (length < MIN_VECTOR_LENGTH) {
      return { valid: false };
    }

    const alphaProb = THREE.MathUtils.clamp(stats.alpha, 0, 1);
    const betaProb = THREE.MathUtils.clamp(stats.beta, 0, 1);
    const alphaMag = Math.sqrt(alphaProb);
    const betaMag = Math.sqrt(betaProb);
    const phiDegPos = wrap360(THREE.MathUtils.radToDeg(stats.phi));
    const phiDegSigned = wrapSignedDeg(THREE.MathUtils.radToDeg(stats.phi));
    const alphaActive = alphaMag > MIN_AMPLITUDE;
    const betaActive = betaMag > MIN_AMPLITUDE;

    return {
      valid: true,
      alpha: {
        magnitude: alphaMag,
        phaseSignedDeg: alphaActive ? 0 : null,
        phasePosDeg: alphaActive ? 360 : null,
        descriptor: alphaActive ? "real +" : "approx 0",
        color: phaseAngleToColor(0)
      },
      beta: {
        magnitude: betaMag,
        phaseSignedDeg: betaActive ? phiDegSigned : null,
        phasePosDeg: betaActive ? phiDegPos : null,
        descriptor: betaActive ? describePhase(phiDegPos, phiDegSigned) : "approx 0",
        color: phaseAngleToColor(betaActive ? phiDegPos : 0)
      }
    };
  }, [vector, stats.alpha, stats.beta, stats.phi]);

  const renderPhaseRow = (ketLabel, data) => {
    if (!data) return null;
    const signedText = formatSignedAngle(data.phaseSignedDeg);
    const wrapText = formatPositiveAngle(data.phasePosDeg);
    const descriptor = data.descriptor || "";
    const showSecondary = Boolean(wrapText) || Boolean(descriptor);
    return (
      <div key={ketLabel} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
        <span
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            background: data.color || "#7aa3ff",
            boxShadow: "0 0 6px rgba(0,0,0,0.55)"
          }}
        />
        <span style={{ fontWeight: 600 }}>{ketLabel}</span>
        <span style={{ marginLeft: "auto", textAlign: "right" }}>
          <div style={{ fontVariantNumeric: "tabular-nums" }}>{signedText}</div>
          {showSecondary ? (
            <div style={{ fontSize: 10, color: "#96b4d5" }}>
              {wrapText}
              {wrapText && descriptor ? " | " : ""}
              {descriptor}
            </div>
          ) : null}
        </span>
      </div>
    );
  };

  // Segment density tuned by quality (low for wireframe/low-end)
  const OUTER_SEG = q >= 0.9 ? 32 : q >= 0.75 ? 24 : 16;
  const INNER_SEG = q >= 0.9 ? 24 : q >= 0.75 ? 18 : 12;
  const PURITY_SEG = OUTER_SEG;
  const CIRCLE_STEPS = q >= 0.9 ? 96 : q >= 0.75 ? 72 : 48;
  const PULSE_TORUS_RADSEG = q >= 0.9 ? 64 : q >= 0.75 ? 48 : 32;
  const PULSE_TORUS_TUBSEG = q >= 0.9 ? 12 : q >= 0.75 ? 10 : 8;
  const PATH_RADIAL_SEG = q >= 0.9 ? 14 : q >= 0.75 ? 12 : 8;

  const assets = useMemo(() => {
    return {
      sphereOuter: new THREE.SphereGeometry(radius, OUTER_SEG, OUTER_SEG),
      sphereInner: new THREE.SphereGeometry(radius * 0.995, INNER_SEG, INNER_SEG),
      purity: new THREE.SphereGeometry(radius * 0.999, PURITY_SEG, PURITY_SEG),
      cylinder: (() => {
        const geom = new THREE.CylinderGeometry(
          0.015,
          0.015,
          1,
          Math.max(10, Math.round(PATH_RADIAL_SEG * 0.8)),
          1,
          true
        );
        geom.rotateX(Math.PI / 2);
        return geom;
      })(),
      cone: (() => {
        const geom = new THREE.ConeGeometry(
          0.06,
          0.2,
          Math.max(10, Math.round(PATH_RADIAL_SEG * 0.8))
        );
        geom.rotateX(Math.PI / 2);
        return geom;
      })(),
      tip: new THREE.SphereGeometry(0.045, Math.max(8, Math.round(PATH_RADIAL_SEG * 0.6)), Math.max(8, Math.round(PATH_RADIAL_SEG * 0.6))),
      circleXY: buildCircle("xy", radius, CIRCLE_STEPS),
      circleXZ: buildCircle("xz", radius, CIRCLE_STEPS),
      circleYZ: buildCircle("yz", radius, CIRCLE_STEPS),
      pulseTorus: new THREE.TorusGeometry(radius * 1.04, 0.025, PULSE_TORUS_TUBSEG, PULSE_TORUS_RADSEG)
    };
    function buildCircle(plane, r, steps) {
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const a = (i / steps) * Math.PI * 2;
        let x = 0, y = 0, z = 0;
        if (plane === "xy") { x = r * Math.cos(a); y = r * Math.sin(a); }
        else if (plane === "xz") { x = r * Math.cos(a); z = r * Math.sin(a); }
        else { y = r * Math.cos(a); z = r * Math.sin(a); }
        pts.push(new THREE.Vector3(x, y, z));
      }
      return new THREE.BufferGeometry().setFromPoints(pts);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [radius, q]);

  const mats = useMemo(() => {
    const gridColor = colors.grid || "rgba(255,255,255,0.28)";
    const axisX = colors.axisX || "#ff3a33";
    const axisY = colors.axisY || "#20b44a";
    const axisZ = colors.axisZ || "#2d74ff";
    const arrow = colors.arrow || "#d39a16";
    const tipCol = colors.tip || "#ffd56b";
    const accent = colors.accent || "#66d8ff";

    const outerMat = q < 0.75
      ? new THREE.MeshStandardMaterial({
        color: "#0b2744", transparent: true, opacity: 0.16,
        roughness: 0.6, metalness: 0.05
      })
      : new THREE.MeshPhysicalMaterial({
        color: "#0b2744", transparent: true, opacity: 0.16, roughness: 0.55,
        metalness: 0.08, transmission: 0.35, thickness: 0.4,
        clearcoat: 0.35, clearcoatRoughness: 0.5
      });

    return {
      outer: outerMat,
      inner: new THREE.MeshBasicMaterial({ color: "#2a7fb5", transparent: true, opacity: 0.05 }),
      purity: new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.08 }),
      circle: new THREE.LineBasicMaterial({ color: new THREE.Color(gridColor), opacity: 0.28, transparent: true }),
      axisX: new THREE.LineBasicMaterial({ color: new THREE.Color(axisX) }),
      axisY: new THREE.LineBasicMaterial({ color: new THREE.Color(axisY) }),
      axisZ: new THREE.LineBasicMaterial({ color: new THREE.Color(axisZ) }),
      arrowBody: new THREE.MeshPhongMaterial({ color: new THREE.Color(arrow), shininess: 50 }),
      arrowTip: new THREE.MeshPhongMaterial({
        color: new THREE.Color(arrow),
        emissive: new THREE.Color(arrow).multiplyScalar(0.35)
      }),
      tip: new THREE.MeshBasicMaterial({ color: new THREE.Color(tipCol) }),
      pulse: new THREE.MeshBasicMaterial({ color: new THREE.Color(accent), transparent: true, opacity: 0.0 })
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q, colors.grid, colors.axisX, colors.axisY, colors.axisZ, colors.arrow, colors.tip, colors.accent]);

  useEffect(() => { pathsGroupRef.current.visible = showPaths; }, [showPaths, localVersionTick]);

  // Trigger pulse when stepKey changes and this qubit had an effect tag
  useEffect(() => {
    if (effect && stepKey !== undefined && stepKey !== lastStepKeyRef.current) {
      pulseTimeRef.current = 0.5; // seconds
      lastStepKeyRef.current = stepKey;
    }
  }, [effect, stepKey]);

  useEffect(() => {
    const key = vector.join(",");
    if (lastVectorKeyRef.current === key) return;
    lastVectorKeyRef.current = key;

    const newDir = new THREE.Vector3(...vector);
    if (newDir.length() < 1e-8) targetDirRef.current.set(0, 0, 0);
    else targetDirRef.current.copy(newDir.normalize());

    const startDir = currentDirRef.current.clone();
    const endDir = targetDirRef.current.clone();
    const angle = startDir.length() > 1e-6 && endDir.length() > 1e-6
      ? startDir.clone().normalize().angleTo(endDir.clone().normalize())
      : 0;

    if (startDir.length() > 1e-6 && endDir.length() > 1e-6 && angle > 1e-4) {
      const arcGeom = buildGreatCircleArc(startDir, endDir, radius);
      const axis = computeRotationAxis(startDir, endDir);
      const tube = buildPathTube(arcGeom, pathColor, pathThickness, true, PATH_RADIAL_SEG);
      tube.userData.birth = performance.now();
      tube.userData.isActive = true;
      tube.userData.meta = {
        from: startDir.clone(),
        to: endDir.clone(),
        angleRad: angle,
        angleDeg: (angle * 180) / Math.PI,
        axis: axis.clone(),
        label
      };
      if (activeArcRef.current) {
        activeArcRef.current.material.emissiveIntensity = 0.75;
        activeArcRef.current.material.opacity = 0.9;
        activeArcRef.current.userData.isActive = false;
      }
      activeArcRef.current = tube;
      pathsGroupRef.current.add(tube);
      registerPath && registerPath({
        sphere: label,
        time: Date.now(),
        angleDeg: tube.userData.meta.angleDeg,
        angleRad: tube.userData.meta.angleRad,
        axis: tube.userData.meta.axis.toArray(),
        from: tube.userData.meta.from.toArray(),
        to: tube.userData.meta.to.toArray()
      });
      while (pathsGroupRef.current.children.length > maxPaths) {
        const candidate = pathsGroupRef.current.children[0];
        if (candidate === activeArcRef.current) break;
        removePathMesh(candidate);
      }
    }
    animStartDirRef.current.copy(startDir);
    progressRef.current = animate ? 0 : 1;
    if (!animate) {
      currentDirRef.current.copy(targetDirRef.current);
      animStartDirRef.current.copy(currentDirRef.current);
    }
  }, [vector, animate, pathColor, pathThickness, maxPaths, radius, registerPath, PATH_RADIAL_SEG]);

  useEffect(() => {
    pathsGroupRef.current.children.forEach(m => m);
    setLocalVersionTick(t => t + 1);
  }, [pathThickness]);

  useFrame((_, delta) => {
    if (progressRef.current < 1) {
      const p = Math.min(1, progressRef.current + delta * 1.6);
      progressRef.current = p;
      const interpolated = slerpBloch(animStartDirRef.current, targetDirRef.current, p);
      currentDirRef.current.copy(interpolated);
      if (p === 1 && activeArcRef.current) {
        activeArcRef.current.material.emissiveIntensity = 0.75;
        activeArcRef.current.userData.isActive = false;
        activeArcRef.current = null;
      }
      if (p === 1) animStartDirRef.current.copy(currentDirRef.current);
    }

    // Arrow transform
    if (arrowGroupRef.current) {
      const dir = currentDirRef.current.clone();
      const len = dir.length();
      if (len < 1e-6) {
        arrowGroupRef.current.visible = false;
      } else {
        arrowGroupRef.current.visible = true;
        const up = new THREE.Vector3(0, 0, 1);
        const qrot = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
        arrowGroupRef.current.setRotationFromQuaternion(qrot);
        const body = arrowGroupRef.current.children[0];
        const cone = arrowGroupRef.current.children[1];
        if (body) {
          body.scale.set(1, 1, len * radius);
          body.position.set(0, 0, (len * radius) / 2);
        }
        if (cone) cone.position.set(0, 0, len * radius);
      }
    }

    // Tip bob
    if (tipRef.current) {
      const s = 1 + 0.15 * Math.sin(performance.now() * 0.006);
      tipRef.current.scale.setScalar(s);
      tipRef.current.position.copy(currentDirRef.current.clone().multiplyScalar(radius));
    }

    // Purity sphere sizing
    if (purityRef.current) {
      const len = currentDirRef.current.length();
      purityRef.current.scale.setScalar(len);
      purityRef.current.visible = len > 0.01;
    }

    // Projections
    if (showProjections) {
      ensureProjectionDots();
      const dir = currentDirRef.current.clone();
      const len = dir.length();
      projectionDotsRef.current.forEach(obj => (obj.visible = len > 1e-4));
      if (len > 1e-4) {
        const tip = dir.clone().multiplyScalar(radius);
        projectionDotsRef.current[0].position.set(tip.x, tip.y, 0);
        projectionDotsRef.current[1].position.set(tip.x, 0, tip.z);
        projectionDotsRef.current[2].position.set(0, tip.y, tip.z);
      }
    } else {
      projectionDotsRef.current.forEach(obj => (obj.visible = false));
    }

    // Path fading
    if (pathFade && pathsGroupRef.current) {
      const now = performance.now();
      const toRemove = [];
      pathsGroupRef.current.children.forEach(m => {
        if (!m.material) return;
        const age = (now - (m.userData.birth || now)) / 1000;
        const fadeAfter = 6;
        if (age > fadeAfter) {
          const excess = age - fadeAfter;
          const newOpacity = 0.9 * Math.max(0, 1 - excess * 0.15);
          m.material.opacity = newOpacity;
          if (newOpacity <= 0.03 && !m.userData.isActive) toRemove.push(m);
        }
      });
      toRemove.forEach(removePathMesh);
    }
    pathsGroupRef.current.visible = showPaths;

    // Gate pulse animation (subtle)
    if (pulseTimeRef.current > 0) {
      pulseTimeRef.current = Math.max(0, pulseTimeRef.current - delta);
      const t = pulseTimeRef.current;
      const k = Math.sin((1 - t / 0.5) * Math.PI); // 0..1..0 envelope over 0.5s
      // Arrow tip emissive bump
      if (arrowGroupRef.current && arrowGroupRef.current.children[1]) {
        const tipMat = arrowGroupRef.current.children[1].material;
        if (tipMat) tipMat.emissiveIntensity = 0.35 + 1.4 * k;
      }
      // Pulse ring expand/fade
      if (pulseRingRef.current) {
        pulseRingRef.current.visible = true;
        const s = 1 + 0.18 * k;
        pulseRingRef.current.scale.setScalar(s);
        pulseRingRef.current.material.opacity = 0.22 * (1 - (t / 0.5));
      }
    } else {
      if (arrowGroupRef.current && arrowGroupRef.current.children[1]) {
        const tipMat = arrowGroupRef.current.children[1].material;
        if (tipMat) tipMat.emissiveIntensity = 0.35;
      }
      if (pulseRingRef.current) {
        pulseRingRef.current.visible = false;
      }
    }
  });

  function ensureProjectionDots() {
    if (projectionDotsRef.current.length) return;
    const col = new THREE.Color(colors.grid || 0xffffff);
    for (let i = 0; i < 3; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, Math.max(8, Math.round(PATH_RADIAL_SEG * 0.6)), Math.max(8, Math.round(PATH_RADIAL_SEG * 0.6))),
        new THREE.MeshBasicMaterial({ color: col, transparent: true, opacity: 0.35 })
      );
      projectionDotsRef.current.push(mesh);
      pathsGroupRef.current.parent && pathsGroupRef.current.parent.add(mesh);
    }
  }

  function removePathMesh(mesh) {
    pathsGroupRef.current.remove(mesh);
    mesh.geometry?.dispose();
    if (Array.isArray(mesh.material)) mesh.material.forEach(m => m.dispose?.());
    else mesh.material?.dispose?.();
  }

  const basisLabels = useMemo(() => {
    const defaultBright = colors.label || "#ffffff";
    const defaultDim = colors.labelDim || "#7d8894";
    const colorZero = phaseInfo.valid && phaseInfo.alpha?.phaseSignedDeg !== null
      ? phaseInfo.alpha.color
      : defaultBright;
    const colorOne = phaseInfo.valid && phaseInfo.beta?.phaseSignedDeg !== null
      ? phaseInfo.beta.color
      : defaultDim;
    return [
      { pos: [0, 0, radius * 1.08], text: "|0⟩(z)", color: colorZero },
      { pos: [0, 0, -radius * 1.08], text: "|1⟩", color: colorOne },
      { pos: [radius * 1.18, 0, 0], text: "|+⟩(x)", color: colors.label || "#ffc4c2" },
      { pos: [-radius * 1.18, 0, 0], text: "|-⟩", color: colors.labelDim || "#ffc4c2" },
      { pos: [0, radius * 1.18, 0], text: "|+i⟩(y)", color: colors.label || "#b9ffd8" },
      { pos: [0, -radius * 1.18, 0], text: "|-i⟩", color: colors.labelDim || "#b9ffd8" }
    ];
  }, [radius, colors.label, colors.labelDim, phaseInfo]);

  return (
    // Minimal change: rotate entire Bloch sphere assembly by -90° about X.
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <group ref={pathsGroupRef} />
      {/* Subtle pulse ring (created once, hidden unless pulsing) */}
      <mesh ref={pulseRingRef} visible={false}>
        <primitive object={assets.pulseTorus} attach="geometry" />
        <primitive object={mats.pulse} attach="material" />
      </mesh>

      <mesh ref={purityRef}>
        <primitive object={assets.purity} attach="geometry" />
        <primitive object={mats.purity} attach="material" />
      </mesh>
      <mesh geometry={assets.sphereOuter} material={mats.outer} />
      <mesh geometry={assets.sphereInner} material={mats.inner} />
      {showGrid && (
        <>
          <line geometry={assets.circleXY} material={mats.circle} />
          <line geometry={assets.circleXZ} material={mats.circle} />
          <line geometry={assets.circleYZ} material={mats.circle} />
        </>
      )}
      {showAxes && (
        <>
          <AxisLine start={[-radius, 0, 0]} end={[radius, 0, 0]} material={mats.axisX} />
          <AxisLine start={[0, -radius, 0]} end={[0, radius, 0]} material={mats.axisY} />
          <AxisLine start={[0, 0, -radius]} end={[0, 0, radius]} material={mats.axisZ} />
        </>
      )}
      <group ref={arrowGroupRef}>
        <mesh geometry={assets.cylinder} material={mats.arrowBody} />
        <mesh geometry={assets.cone} material={mats.arrowTip} />
      </group>
      <mesh ref={tipRef}>
        <primitive object={assets.tip} attach="geometry" />
        <primitive object={mats.tip} attach="material" />
      </mesh>
      {basisLabels.map((b, i) => (
        <Html key={i} position={b.pos} center style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: b.color, textShadow: "0 0 4px rgba(0,0,0,0.8)" }}>
            {b.text}
          </div>
        </Html>
      ))}
      {showInfo && (
        <Html position={[radius * 1, radius * 1.0, 1.76]} style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(9,20,32,0.78)",
            border: "1px solid rgba(110,170,220,0.25)",
            padding: "6px 8px",
            borderRadius: 8,
            minWidth: 18,
            fontSize: 11,
            fontFamily: "Inter, sans-serif",
            color: "#d7ecff",
            lineHeight: 1.1
          }}>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{label}</div>
            <div>θ: {(stats.theta * 180 / Math.PI).toFixed(1)}°</div>
            <div>φ: {(stats.phi * 180 / Math.PI).toFixed(1)}°</div>
            <div>|r|: {stats.r.toFixed(3)}</div>
            <div style={{ marginTop: 4 }}>|α|²: {(stats.alpha * 100).toFixed(1)}%</div>
            <div>|β|²: {(1 - stats.alpha) * 100 % 100 ? ((1 - stats.alpha) * 100).toFixed(1) : (stats.beta * 100).toFixed(1)}%</div>
            <div
              style={{
                borderTop: "1px solid rgba(110,170,220,0.15)",
                marginTop: 8,
                paddingTop: 8,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-start",
                gap: "4px",
              }}
            >
              <div style={{ fontWeight: 600, marginBottom: 2 }}>Phase</div>

              {phaseInfo.valid ? (
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                    width: "100%",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    color: "#d0e0f0",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    {renderPhaseRow("|0⟩", phaseInfo.alpha)}
                  </div>

                  <div
                    style={{
                      borderTop: "1px dashed rgba(255,255,255,0.15)",
                      width: "100%",
                    }}
                  ></div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      width: "100%",
                    }}
                  >
                    {renderPhaseRow("|1⟩", phaseInfo.beta)}
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: 10, color: "#8ba5c1" }}>
                  Phase undefined for zero-length vector.
                </div>
              )}
            </div>

          </div>
        </Html>
      )}
    </group>
  );
}

function AxisLine({ start, end, material }) {
  const geomRef = useRef();
  useEffect(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([...start, ...end], 3));
    geomRef.current = g;
    return () => g.dispose();
  }, [start, end]);
  return <line geometry={geomRef.current} material={material} />;
}

function buildGreatCircleArc(startDir, endDir, radius) {
  const startLen = startDir.length();
  const endLen = endDir.length();
  if (startLen < 1e-6 || endLen < 1e-6) {
    const pts = [startDir.clone().multiplyScalar(radius)];
    if (endLen >= 1e-6) pts.push(endDir.clone().normalize().multiplyScalar(radius));
    return new THREE.BufferGeometry().setFromPoints(pts);
  }
  const steps = Math.max(18, Math.ceil((startDir.clone().normalize().angleTo(endDir.clone().normalize()) / Math.PI) * 60));
  const points = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const dir = slerpBloch(startDir, endDir, t);
    if (dir.length() > 1e-6) points.push(dir.clone().normalize().multiplyScalar(radius));
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

function buildPathTube(lineGeometry, color, thickness, highlight, radialSegments = 14) {
  const posAttr = lineGeometry.getAttribute("position");
  const pts = [];
  for (let i = 0; i < posAttr.count; i++) {
    pts.push(new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const tubeGeom = new THREE.TubeGeometry(curve, Math.min(180, pts.length * 3), thickness, radialSegments, false);
  const mat = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: highlight ? 1.5 : 0.75,
    metalness: 0.25,
    roughness: 0.35,
    transparent: true,
    opacity: highlight ? 1.0 : 0.9
  });
  const mesh = new THREE.Mesh(tubeGeom, mat);
  mesh.userData.isRotationPath = true;
  mesh.userData.pickable = true;
  return mesh;
}

const DOT_THRESHOLD = 0.9995;
const OPP_THRESHOLD = -0.9995;

function slerpBloch(startVec, endVec, t) {
  const startLen = startVec.length();
  const endLen = endVec.length();
  if (startLen < 1e-6 && endLen < 1e-6) return new THREE.Vector3(0, 0, 0);
  if (startLen < 1e-6) return endVec.clone().multiplyScalar(THREE.MathUtils.clamp(t, 0, 1));
  if (endLen < 1e-6) return startVec.clone().multiplyScalar(1 - THREE.MathUtils.clamp(t, 0, 1));

  const v0 = startVec.clone().normalize();
  const v1 = endVec.clone().normalize();
  let dot = THREE.MathUtils.clamp(v0.dot(v1), -1, 1);

  if (dot > DOT_THRESHOLD) {
    const dir = v0.clone().lerp(v1, t).normalize();
    const len = THREE.MathUtils.lerp(startLen, endLen, t);
    return dir.multiplyScalar(len);
  }

  if (dot < OPP_THRESHOLD) {
    const axis = choosePerpendicularAxis(v0);
    const quat = new THREE.Quaternion().setFromAxisAngle(axis, Math.PI * t);
    const dir = v0.clone().applyQuaternion(quat);
    const len = THREE.MathUtils.lerp(startLen, endLen, t);
    return dir.multiplyScalar(len);
  }

  const omega = Math.acos(dot);
  const sinOm = Math.sin(omega);
  const s0 = Math.sin((1 - t) * omega) / sinOm;
  const s1 = Math.sin(t * omega) / sinOm;
  const dir = v0.clone().multiplyScalar(s0).add(v1.clone().multiplyScalar(s1)).normalize();
  const len = THREE.MathUtils.lerp(startLen, endLen, t);
  return dir.multiplyScalar(len);
}

function choosePerpendicularAxis(vec) {
  const axisCandidate = Math.abs(vec.x) < 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
  const axis = new THREE.Vector3().crossVectors(vec, axisCandidate);
  if (axis.lengthSq() < 1e-6) return new THREE.Vector3(0, 0, 1);
  return axis.normalize();
}

function computeRotationAxis(startDir, endDir) {
  const start = startDir.clone();
  const end = endDir.clone();
  if (start.length() < 1e-6 || end.length() < 1e-6) return new THREE.Vector3(0, 0, 0);
  const cross = start.clone().cross(end);
  if (cross.lengthSq() > 1e-8) return cross.normalize();
  return choosePerpendicularAxis(start.clone().normalize());
}