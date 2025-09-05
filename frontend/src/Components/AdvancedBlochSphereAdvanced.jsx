import React, { useRef, useMemo, useEffect, useState } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { Html } from "@react-three/drei";

/**
 * AdvancedBlochSphereAdvanced (LIGHT core) with Phase 2/3 enhancements.
 * NOTE: No changes made here for the screenshot feature (all handled in viewer).
 * (Kept identical to prior version you approved.)
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
  tooltipActive = false
}) {
  const pathsGroupRef = useRef(new THREE.Group());
  const purityRef = useRef();
  const arrowGroupRef = useRef();
  const tipRef = useRef();
  const projectionDotsRef = useRef([]);
  const currentDirRef = useRef(new THREE.Vector3(0, 0, 1));
  const targetDirRef = useRef(new THREE.Vector3(0, 0, 1));
  const lastVectorKeyRef = useRef("");
  const progressRef = useRef(1);
  const activeArcRef = useRef(null);

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

  const assets = useMemo(() => {
    return {
      sphereOuter: new THREE.SphereGeometry(radius, 32, 32),
      sphereInner: new THREE.SphereGeometry(radius * 0.995, 24, 24),
      purity: new THREE.SphereGeometry(radius * 0.999, 32, 32),
      cylinder: new THREE.CylinderGeometry(0.015, 0.015, 1, 14, 1, true),
      cone: new THREE.ConeGeometry(0.06, 0.2, 20),
      tip: new THREE.SphereGeometry(0.045, 12, 12),
      circleXY: buildCircle("xy", radius),
      circleXZ: buildCircle("xz", radius),
      circleYZ: buildCircle("yz", radius)
    };
    function buildCircle(plane, r) {
      const pts = [];
      const steps = 96;
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
  }, [radius]);

  const mats = useMemo(() => {
    return {
      outer: new THREE.MeshPhysicalMaterial({
        color: "#0b2744", transparent: true, opacity: 0.16, roughness: 0.55,
        metalness: 0.08, transmission: 0.35, thickness: 0.4,
        clearcoat: 0.35, clearcoatRoughness: 0.5
      }),
      inner: new THREE.MeshBasicMaterial({ color: "#2a7fb5", transparent: true, opacity: 0.05 }),
      purity: new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.08 }),
      circle: new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.28, transparent: true }),
      axisX: new THREE.LineBasicMaterial({ color: 0xff3a33 }),
      axisY: new THREE.LineBasicMaterial({ color: 0x20b44a }),
      axisZ: new THREE.LineBasicMaterial({ color: 0x2d74ff }),
      arrowBody: new THREE.MeshPhongMaterial({ color: "#d39a16", shininess: 50 }),
      arrowTip: new THREE.MeshPhongMaterial({
        color: "#d39a16",
        emissive: new THREE.Color("#d39a16").multiplyScalar(0.35)
      }),
      tip: new THREE.MeshBasicMaterial({ color: "#ffd56b" })
    };
  }, []);

  useEffect(() => { pathsGroupRef.current.visible = showPaths; }, [showPaths, localVersionTick]);

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
      ? startDir.angleTo(endDir)
      : 0;

    if (startDir.length() > 1e-6 && endDir.length() > 1e-6 && angle > 1e-4) {
      const arcGeom = buildGreatCircleArc(startDir, endDir, radius);
      const axis = startDir.clone().cross(endDir);
      if (axis.length() < 1e-8) axis.set(0, 0, 0); else axis.normalize();
      const tube = buildPathTube(arcGeom, pathColor, pathThickness, true);
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
    progressRef.current = animate ? 0 : 1;
    if (!animate) currentDirRef.current.copy(targetDirRef.current);
  }, [vector, animate, pathColor, pathThickness, maxPaths, radius, registerPath]);

  useEffect(() => {
    pathsGroupRef.current.children.forEach(m => m);
    setLocalVersionTick(t => t + 1);
  }, [pathThickness]);

  useFrame((_, delta) => {
    if (progressRef.current < 1) {
      const p = Math.min(1, progressRef.current + delta * 1.6);
      progressRef.current = p;
      const a = currentDirRef.current.clone();
      const b = targetDirRef.current.clone();
      if (a.length() < 1e-8) currentDirRef.current.copy(b.clone().multiplyScalar(p));
      else if (b.length() < 1e-8) currentDirRef.current.copy(a.clone().multiplyScalar(1 - p));
      else {
        const dot = THREE.MathUtils.clamp(a.dot(b), -1, 1);
        const omega = Math.acos(dot);
        if (omega < 1e-6) currentDirRef.current.copy(b);
        else {
          const sinOm = Math.sin(omega);
          const s1 = Math.sin((1 - p) * omega) / sinOm;
          const s2 = Math.sin(p * omega) / sinOm;
          currentDirRef.current.copy(
            a.clone().multiplyScalar(s1).add(b.clone().multiplyScalar(s2))
          );
        }
      }
      if (p === 1 && activeArcRef.current) {
        activeArcRef.current.material.emissiveIntensity = 0.75;
        activeArcRef.current.userData.isActive = false;
        activeArcRef.current = null;
      }
    }
    if (arrowGroupRef.current) {
      const dir = currentDirRef.current.clone();
      const len = dir.length();
      if (len < 1e-6) {
        arrowGroupRef.current.visible = false;
      } else {
        arrowGroupRef.current.visible = true;
        const up = new THREE.Vector3(0, 0, 1);
        const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
        arrowGroupRef.current.setRotationFromQuaternion(q);
        const body = arrowGroupRef.current.children[0];
        const cone = arrowGroupRef.current.children[1];
        if (body) {
          body.scale.set(1, 1, len * radius);
          body.position.set(0, 0, (len * radius) / 2);
        }
        if (cone) cone.position.set(0, 0, len * radius);
      }
    }
    if (tipRef.current) {
      const s = 1 + 0.15 * Math.sin(performance.now() * 0.006);
      tipRef.current.scale.setScalar(s);
      tipRef.current.position.copy(currentDirRef.current.clone().multiplyScalar(radius));
    }
    if (purityRef.current) {
      const len = currentDirRef.current.length();
      purityRef.current.scale.setScalar(len);
      purityRef.current.visible = len > 0.01;
    }
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
  });

  function ensureProjectionDots() {
    if (projectionDotsRef.current.length) return;
    const colors = [0xffffff, 0xffffff, 0xffffff];
    for (let i = 0; i < 3; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 12, 12),
        new THREE.MeshBasicMaterial({ color: colors[i], transparent: true, opacity: 0.35 })
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

  const basisLabels = useMemo(() => ([
    { pos: [0, 0, radius * 1.08], text: "|0⟩", color: "#ffffff" },
    { pos: [0, 0, -radius * 1.08], text: "|1⟩", color: "#7d8894" },
    { pos: [radius * 1.18, 0, 0], text: "|+⟩", color: "#ffc4c2" },
    { pos: [-radius * 1.18, 0, 0], text: "|-⟩", color: "#ffc4c2" },
    { pos: [0, radius * 1.18, 0], text: "|+i⟩", color: "#b9ffd8" },
    { pos: [0, -radius * 1.18, 0], text: "|-i⟩", color: "#b9ffd8" }
  ]), [radius]);

  return (
    <group>
      <group ref={pathsGroupRef} />
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
        <meshBasicMaterial color="#ffd56b" />
      </mesh>
      {basisLabels.map((b, i) => (
        <Html key={i} position={b.pos} center style={{ pointerEvents: "none" }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: b.color, textShadow: "0 0 4px rgba(0,0,0,0.8)" }}>
            {b.text}
          </div>
        </Html>
      ))}
      {showInfo && (
        <Html position={[radius * 1.55, radius * 1.15, 0]} style={{ pointerEvents: "none" }}>
          <div style={{
            background: "rgba(9,20,32,0.78)",
            border: "1px solid rgba(110,170,220,0.25)",
            padding: "6px 8px",
            borderRadius: 8,
            minWidth: 118,
            fontSize: 11,
            fontFamily: "Inter, sans-serif",
            color: "#d7ecff",
            lineHeight: 1.4
          }}>
            <div style={{ fontWeight: 700, fontSize: 12, marginBottom: 4 }}>{label}</div>
            <div>θ: {(stats.theta * 180 / Math.PI).toFixed(1)}°</div>
            <div>φ: {(stats.phi * 180 / Math.PI).toFixed(1)}°</div>
            <div>|r|: {stats.r.toFixed(3)}</div>
            <div style={{ marginTop: 4 }}>|α|²: {(stats.alpha * 100).toFixed(1)}%</div>
            <div>|β|²: {(stats.beta * 100).toFixed(1)}%</div>
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
  const start = startDir.clone().normalize();
  const end = endDir.clone().normalize();
  const dot = THREE.MathUtils.clamp(start.dot(end), -1, 1);
  const omega = Math.acos(dot);
  const points = [];
  const steps = Math.max(18, Math.ceil((omega / Math.PI) * 60));
  if (omega < 1e-6) {
    points.push(start.clone().multiplyScalar(radius));
  } else {
    const sinOm = Math.sin(omega);
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const a = Math.sin((1 - t) * omega) / sinOm;
      const b = Math.sin(t * omega) / sinOm;
      const p = start.clone().multiplyScalar(a).add(end.clone().multiplyScalar(b));
      points.push(p.multiplyScalar(radius));
    }
  }
  return new THREE.BufferGeometry().setFromPoints(points);
}

function buildPathTube(lineGeometry, color, thickness, highlight) {
  const posAttr = lineGeometry.getAttribute("position");
  const pts = [];
  for (let i = 0; i < posAttr.count; i++) {
    pts.push(new THREE.Vector3(posAttr.getX(i), posAttr.getY(i), posAttr.getZ(i)));
  }
  const curve = new THREE.CatmullRomCurve3(pts);
  const tubeGeom = new THREE.TubeGeometry(curve, Math.min(180, pts.length * 3), thickness, 14, false);
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