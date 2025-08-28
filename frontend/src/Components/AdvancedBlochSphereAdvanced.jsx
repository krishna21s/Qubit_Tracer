// src/components/AdvancedBlochSphereAdvanced.jsx
import React, { useRef, useEffect, useMemo } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { gsap } from "gsap";
import { CatmullRomCurve3, TubeGeometry, Vector3, BufferGeometry, BufferAttribute } from "three";

/**
 * Advanced Bloch Sphere — Glass + Thick Trail + Clouds + Snow
 *
 * Props:
 *  - vector: [x,y,z]  (target Bloch vector; length <=1; 0-vector = maximally mixed)
 *  - label: string
 *  - inside: bool
 *  - onEnterInside: function
 *  - isMobile: bool
 *
 * Requirements: mount this inside <Canvas> (r3f)
 */

const CLOUD_LAYERS = 0;

export default function AdvancedBlochSphereAdvanced({
  vector = [0, 0, 1],
  label = "q0",
  inside = false,
  onEnterInside = () => { },
  isMobile = false
}) {
  const radius = 1.0;

  // Refs
  const arrowRef = useRef();
  const tipRef = useRef();
  const trailMeshRef = useRef();
  const cloudLayersRef = useRef([]);
  const snowRef = useRef();
  const cloudUniformsRef = useRef([]);
  const targetRef = useRef(new THREE.Vector3(0, 0, 1));
  const prevDirRef = useRef(new THREE.Vector3(0, 0, 1));
  const tweenRef = useRef(null);

  // Trail storage as array of Vector3 (for Tube)
  const trailPoints = useRef([]);
  const MAX_POINTS = isMobile ? 40 : 100;

  // inspector values
  const { thetaDeg, phiDeg, alphaPct, betaPct } = useMemo(() => {
    const v = new THREE.Vector3(vector[0], vector[1], vector[2]);
    const eps = 1e-8;
    if (v.length() < eps) return { thetaDeg: 0, phiDeg: 0, alphaPct: 50, betaPct: 50 };
    v.normalize();
    const theta = Math.acos(THREE.MathUtils.clamp(v.z, -1, 1));
    const phi = Math.atan2(v.y, v.x);
    const alpha = (1 + v.z) / 2;
    return { thetaDeg: (theta * 180) / Math.PI, phiDeg: (phi * 180) / Math.PI, alphaPct: alpha * 100, betaPct: (1 - alpha) * 100 };
  }, [vector]);

  // Prepare arcs (theta & phi) points for static display — computed from current target vector
  const tipStatic = useMemo(() => new THREE.Vector3(vector[0] * radius, vector[1] * radius, vector[2] * radius), [vector, radius]);

  // Animated great-circle transition + trail build
  useEffect(() => {
    const vNew = new THREE.Vector3(vector[0], vector[1], vector[2]);
    const isZero = vNew.length() < 1e-8;
    const newNorm = isZero ? new THREE.Vector3(0, 0, 0) : vNew.clone().normalize();

    const prev = prevDirRef.current.clone();
    const start = prev.length() < 1e-8 ? new THREE.Vector3(0, 0, 1) : prev.clone().normalize();
    const end = newNorm.length() < 1e-8 ? new THREE.Vector3(0, 0, 0) : newNorm.clone();

    if (tweenRef.current) {
      tweenRef.current.kill(); tweenRef.current = null;
    }

    const duration = 1.0;
    const state = { t: 0 };

    // reset trail if new vector is very different (optional)
    // comment or adjust threshold if you want continuous trails between sims
    if (start.distanceTo(end) > 1.5) {
      trailPoints.current = [];
      if (trailMeshRef.current?.geometry) {
        trailMeshRef.current.geometry.dispose();
        trailMeshRef.current.geometry = null;
      }
    }

    tweenRef.current = gsap.to(state, {
      t: 1,
      duration,
      ease: "power2.inOut",
      onUpdate: () => {
        const tt = state.t;
        let cur;
        if (start.length() < 1e-8 && end.length() < 1e-8) cur = new THREE.Vector3(0, 0, 0);
        else if (start.length() < 1e-8) cur = end.clone().multiplyScalar(tt);
        else if (end.length() < 1e-8) cur = start.clone().multiplyScalar(1 - tt);
        else {
          const dot = THREE.MathUtils.clamp(start.dot(end), -1, 1);
          const omega = Math.acos(dot);
          if (Math.abs(omega) < 1e-5) cur = start.clone();
          else {
            const sinOm = Math.sin(omega);
            const a = Math.sin((1 - tt) * omega) / sinOm;
            const b = Math.sin(tt * omega) / sinOm;
            cur = start.clone().multiplyScalar(a).add(end.clone().multiplyScalar(b));
          }
        }
        // scaled target position
        targetRef.current.set(cur.x * radius, cur.y * radius, cur.z * radius);

        // push small distance increments to trailPoints
        const L = trailPoints.current.length;
        const last = L > 0 ? trailPoints.current[L - 1] : null;
        if (!last || last.distanceTo(targetRef.current) > 0.01) {
          trailPoints.current.push(targetRef.current.clone());
          if (trailPoints.current.length > MAX_POINTS) trailPoints.current.shift();
          // rebuild tube geometry when new points added (cheap for small N)
          rebuildTrailMesh();
        }
      },
      onComplete: () => { prevDirRef.current = end.clone(); }
    });

    return () => { if (tweenRef.current) { tweenRef.current.kill(); tweenRef.current = null; } };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vector]);

  // Rebuild TubeGeometry from trailPoints into trailMeshRef
  function rebuildTrailMesh() {
    const pts = trailPoints.current;
    if (pts.length < 2) return;
    // create Catmull curve through points
    const curve = new CatmullRomCurve3(pts.map(p => p.clone()), false, "catmullrom", 0.5);
    const segments = Math.max(8, pts.length * 6);
    const tubularSegments = Math.min(200, segments);
    const radiusTrail = isMobile ? 0.02 : 0.035; // thicker on desktop
    const geometry = new TubeGeometry(curve, segments, radiusTrail, 8, false);
    geometry.computeVertexNormals();

    // create material for glow-like effect (emissive)
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#66d8ff"),
      emissive: new THREE.Color("#66d8ff"),
      emissiveIntensity: 1.2,
      metalness: 0.2,
      roughness: 0.1,
      transparent: true,
      opacity: 0.95,
      side: THREE.DoubleSide
    });

    // free previous
    if (trailMeshRef.current) {
      if (trailMeshRef.current.geometry) trailMeshRef.current.geometry.dispose();
      if (trailMeshRef.current.material) trailMeshRef.current.material.dispose();
      trailMeshRef.current.geometry = geometry;
      trailMeshRef.current.material = mat;
    } else {
      // create placeholder mesh
      const mesh = new THREE.Mesh(geometry, mat);
      trailMeshRef.current = mesh;
    }
  }

  // Snow particle system initialization
  useEffect(() => {
    const COUNT = isMobile ? 300 : 900;
    const positions = new Float32Array(COUNT * 3);
    const speeds = new Float32Array(COUNT); // per-particle speed
    for (let i = 0; i < COUNT; i++) {
      // spawn in a wide dome above the scene
      positions[i * 3 + 0] = (Math.random() - 0.5) * 12; // x
      positions[i * 3 + 1] = Math.random() * 6 + 1;      // y (height)
      positions[i * 3 + 2] = (Math.random() - 0.5) * 12; // z
      speeds[i] = 0.6 + Math.random() * 1.2;
    }
    // attach to ref for update
    snowRef.current = { positions, speeds, count: COUNT };
    // cleanup on unmount
    return () => { snowRef.current = null; };
  }, [isMobile]);

  // Cloud layers: create rotating semi-transparent shells (animated)
  useEffect(() => {
    cloudLayersRef.current = [];
    for (let i = 0; i < CLOUD_LAYERS; i++) {
      const u = {
        speed: (0.02 + i * 0.01) * (i % 2 ? -1 : 1),
        offset: Math.random() * 100
      };
      cloudUniformsRef.current[i] = u;
    }
  }, []);

  // Frame loop: update arrow, tip, snow, cloud uniforms
  useFrame((state) => {
    // 1) arrow orientation and tip placement (based on targetRef)
    if (arrowRef.current) {
      const cur = targetRef.current.clone();
      const len = cur.length();
      if (len < 1e-5) {
        arrowRef.current.visible = false;
      } else {
        arrowRef.current.visible = true;
        // orient arrow from +Z to cur direction
        const up = new THREE.Vector3(0, 0, 1);
        const q = new THREE.Quaternion().setFromUnitVectors(up, cur.clone().normalize());
        arrowRef.current.setRotationFromQuaternion(q);
        // place arrow midpoint at half length
        arrowRef.current.position.copy(cur.clone().normalize().multiplyScalar(len * 0.5));
        // scale cylinder child
        const cyl = arrowRef.current.children[0];
        const cone = arrowRef.current.children[1];
        if (cyl) cyl.scale.set(1, 1, Math.max(0.0001, len * 0.8));
        if (cyl) cyl.position.set(0, 0, (len * 0.8) / 2);
        if (cone) cone.position.set(0, 0, len * 0.9);
      }
    }

    // 2) tip pulsing
    if (tipRef.current) {
      const s = 1 + 0.12 * Math.sin(state.clock.elapsedTime * 6);
      tipRef.current.scale.set(s, s, s);
      // also position tip at exact target (so even while animating)
      tipRef.current.position.copy(targetRef.current);
    }

    // 3) scene snow update
    if (snowRef.current) {
      const { positions, speeds, count } = snowRef.current;
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 1] -= speeds[i] * (isMobile ? 0.006 : 0.012); // fall speed scaled
        if (positions[i * 3 + 1] < -1.5) {
          positions[i * 3 + 0] = (Math.random() - 0.5) * 12;
          positions[i * 3 + 1] = Math.random() * 6 + 3;
          positions[i * 3 + 2] = (Math.random() - 0.5) * 12;
        }
      }
    }

    // 4) animate cloud layers by rotating their group (the parent group is in JSX)
    if (cloudLayersRef.current.length) {
      // we store rotation via cloudUniformsRef speeds — actual rotation applied in JSX mesh onUpdate callbacks
      // no-op here unless you want dynamic uniform changes
    }
  });

  // helper: build geometry for static meridian/latitude lines
  const meridians = useMemo(() => {
    const M = 8;
    const mer = [];
    for (let i = 0; i < M; i++) {
      const angle = (i / M) * Math.PI * 2;
      const pts = [];
      for (let t = 0; t <= Math.PI + 0.0001; t += Math.PI / 80) {
        pts.push(new Vector3(radius * Math.sin(t) * Math.cos(angle), radius * Math.sin(t) * Math.sin(angle), radius * Math.cos(t)));
      }
      mer.push(pts);
    }
    const latArr = [];
    const parallels = 5;
    for (let j = 1; j < parallels; j++) {
      const lat = (j / parallels) * Math.PI - Math.PI / 2;
      const pts = [];
      for (let a = 0; a <= Math.PI * 2 + 0.0001; a += Math.PI / 80) {
        pts.push(new Vector3(radius * Math.cos(lat) * Math.cos(a), radius * Math.cos(lat) * Math.sin(a), radius * Math.sin(lat)));
      }
      latArr.push(pts);
    }
    return { meridians: mer, latitudes: latArr };
  }, [radius]);

  // build theta arc (great circle from north pole to tip direction)
  const thetaArcPoints = useMemo(() => {
    const endDir = new Vector3(vector[0], vector[1], vector[2]);
    if (endDir.length() < 1e-6) return [];
    endDir.normalize();
    const start = new Vector3(0, 0, 1);
    const dot = Math.max(-1, Math.min(1, start.dot(endDir)));
    const omega = Math.acos(dot);
    const steps = Math.max(8, Math.ceil((omega / Math.PI) * 40));
    const pts = [];
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      // slerp start -> end
      if (omega < 1e-6) pts.push(start.clone().multiplyScalar(radius));
      else {
        const sinOm = Math.sin(omega);
        const a = Math.sin((1 - t) * omega) / sinOm;
        const b = Math.sin(t * omega) / sinOm;
        const v = start.clone().multiplyScalar(a).add(endDir.clone().multiplyScalar(b));
        pts.push(v.clone().multiplyScalar(radius));
      }
    }
    return pts;
  }, [vector, radius]);

  // build phi arc (circle at polar angle theta from x-axis to vector's azimuth)
  const phiArcPoints = useMemo(() => {
    const endDir = new Vector3(vector[0], vector[1], vector[2]);
    if (endDir.length() < 1e-6) return [];
    endDir.normalize();
    const theta = Math.acos(THREE.MathUtils.clamp(endDir.z, -1, 1));
    const phi = Math.atan2(endDir.y, endDir.x);
    const steps = Math.max(8, Math.ceil(Math.abs(phi) / (Math.PI) * 40));
    const pts = [];
    const sign = phi >= 0 ? 1 : -1;
    const a0 = 0;
    const a1 = phi;
    const segments = Math.max(6, Math.ceil(Math.abs(a1 - a0) / (Math.PI * 2) * 60));
    for (let i = 0; i <= segments; i++) {
      const a = a0 + (i / segments) * (a1 - a0);
      pts.push(new Vector3(radius * Math.sin(theta) * Math.cos(a), radius * Math.sin(theta) * Math.sin(a), radius * Math.cos(theta)));
    }
    return pts;
  }, [vector, radius]);

  // JSX render
  return (
    <group>
      {/* --- Cloud background layers (big, slow-rotating semi-transparent shells) --- */}
      <group>
        {/* large far sphere to tint background */}
        <mesh scale={[18, 18, 18]}>
          <sphereGeometry args={[1, 32, 32]} />
          <meshBasicMaterial color="#0a0f1f" side={THREE.BackSide} />

        </mesh>

        {/* rotating cloud layers (simple approach: many semi-transparent slightly noisy spheres) */}
        {new Array(CLOUD_LAYERS).fill(0).map((_, i) => {
          const s = 6 + i * 2;
          const opacity = 0.12 + i * 0.03;
          const rotSpeed = 0.004 * (i % 2 ? -1 : 1);
          return (
            <mesh
              key={`cloud-${i}`}
              scale={[s, s, s]}
              rotation={[0, i * 0.6, 0]}
              onUpdate={(self) => {
                self.rotation.y += rotSpeed;
              }}
            >
              <icosahedronGeometry args={[1, 4]} />
              <meshPhysicalMaterial
                color="#0099ff"
                transparent
                opacity={0.35}
                transmission={0.9}
                roughness={0.05}
                metalness={0.2}
                clearcoat={0.6}
                clearcoatRoughness={0.1}
                reflectivity={0.6}
                side={THREE.DoubleSide}
              />
            </mesh>
          );
        })}
      </group>

      {/* --- Snow particle field (points) --- */}
      {snowRef.current && (
        <points>
          <bufferGeometry attach="geometry" onUpdate={(geom) => {
            const { positions } = snowRef.current;
            const attr = new BufferAttribute(positions, 3);
            geom.setAttribute("position", attr);
          }} />
          <pointsMaterial attach="material" size={isMobile ? 0.02 : 0.035} color="#ffffff" transparent opacity={0.9} />
        </points>
      )}

      {/* --- Glass Bloch sphere (visible + double-sided so inside renders) --- */}
      <mesh>
        <sphereGeometry args={[radius, isMobile ? 48 : 96, isMobile ? 48 : 96]} />
        <meshPhysicalMaterial
          color="#a8dfff"
          transparent
          opacity={0.24}
          transmission={0.9}
          roughness={0.06}
          metalness={0.15}
          clearcoat={0.5}
          clearcoatRoughness={0.1}
          reflectivity={0.5}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* subtle inner wireframe-ish highlight (to see inner surface) */}
      <mesh scale={[1.001, 1.001, 1.001]}>
        <sphereGeometry args={[radius, isMobile ? 36 : 72, isMobile ? 36 : 72]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.035} side={THREE.DoubleSide} />
      </mesh>

      {/* probability cloud on sphere surface (shader) */}
      <mesh>
        <sphereGeometry args={[radius * 1.002, isMobile ? 36 : 72, isMobile ? 36 : 72]} />
        <shaderMaterial
          uniforms={{
            uStateDir: { value: new THREE.Vector3(vector[0], vector[1], vector[2]).length() < 1e-6 ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(vector[0], vector[1], vector[2]).normalize() },
            uColor: { value: new THREE.Color("#66d8ff") },
            uSharpness: { value: 6.0 },
            uIntensity: { value: 1.25 },
            uOpacity: { value: inside ? 0.6 : 0.45 }
          }}
          vertexShader={`
            varying vec3 vNormal;
            void main(){
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
            }
          `}
          fragmentShader={`
            uniform vec3 uStateDir;
            uniform vec3 uColor;
            uniform float uIntensity;
            uniform float uSharpness;
            uniform float uOpacity;
            varying vec3 vNormal;
            void main(){
              float d = max(dot(normalize(vNormal), normalize(uStateDir)), 0.0);
              float fall = pow(d, uSharpness);
              vec3 col = uColor * (0.25 + uIntensity * fall);
              float alpha = uOpacity * fall;
              alpha *= smoothstep(0.0, 0.02 + 0.98 * fall, fall);
              gl_FragColor = vec4(col, alpha);
            }
          `}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* --- grid meridians & latitudes (thin lines) --- */}
      {meridians.meridians.map((pts, i) => (
        <line key={`mer-${i}`}>
          <bufferGeometry attach="geometry" onUpdate={(geom) => {
            const arr = new Float32Array(pts.length * 3);
            for (let k = 0; k < pts.length; k++) { arr[k * 3] = pts[k].x; arr[k * 3 + 1] = pts[k].y; arr[k * 3 + 2] = pts[k].z; }
            geom.setAttribute("position", new BufferAttribute(arr, 3));
          }} />
          <lineBasicMaterial attach="material" color="#2a3b40" transparent opacity={0.06} linewidth={1} />
        </line>
      ))}

      {meridians.latitudes.map((pts, i) => (
        <line key={`lat-${i}`}>
          <bufferGeometry attach="geometry" onUpdate={(geom) => {
            const arr = new Float32Array(pts.length * 3);
            for (let k = 0; k < pts.length; k++) { arr[k * 3] = pts[k].x; arr[k * 3 + 1] = pts[k].y; arr[k * 3 + 2] = pts[k].z; }
            geom.setAttribute("position", new BufferAttribute(arr, 3));
          }} />
          <lineBasicMaterial attach="material" color="#2a3b40" transparent opacity={0.06} linewidth={1} />
        </line>
      ))}

      {/* --- axes lines + labels --- */}
      {[{ start: [-radius, 0, 0], end: [radius, 0, 0], color: "#e94b4b", label: "X" },
      { start: [0, -radius, 0], end: [0, radius, 0], color: "#54b86b", label: "Y" },
      { start: [0, 0, -radius], end: [0, 0, radius], color: "#4b87e9", label: "Z" }].map((a, idx) => (
        <group key={`ax-${idx}`}>
          <line>
            <bufferGeometry attach="geometry" onUpdate={(geom) => {
              const arr = new Float32Array([...a.start, ...a.end]);
              geom.setAttribute("position", new BufferAttribute(arr, 3));
            }} />
            <lineBasicMaterial attach="material" color={a.color} linewidth={2} />
          </line>
          <Html position={a.end} center>
            <div style={{
              fontSize: 12, padding: "4px 6px", borderRadius: 6,
              background: "rgba(255,255,255,0.9)", color: "#052b33", fontWeight: 700
            }}>{a.label}</div>
          </Html>
        </group>
      ))}

      {/* --- Theta & Phi arcs (visual) --- */}
      {thetaArcPoints.length > 1 && (
        <line>
          <bufferGeometry attach="geometry" onUpdate={(geom) => {
            const arr = new Float32Array(thetaArcPoints.length * 3);
            for (let k = 0; k < thetaArcPoints.length; k++) {
              arr[k * 3] = thetaArcPoints[k].x; arr[k * 3 + 1] = thetaArcPoints[k].y; arr[k * 3 + 2] = thetaArcPoints[k].z;
            }
            geom.setAttribute("position", new BufferAttribute(arr, 3));
          }} />
          <lineBasicMaterial attach="material" color="#f59a42" linewidth={3} transparent opacity={0.9} />
        </line>
      )}
      {phiArcPoints.length > 1 && (
        <line>
          <bufferGeometry attach="geometry" onUpdate={(geom) => {
            const arr = new Float32Array(phiArcPoints.length * 3);
            for (let k = 0; k < phiArcPoints.length; k++) {
              arr[k * 3] = phiArcPoints[k].x; arr[k * 3 + 1] = phiArcPoints[k].y; arr[k * 3 + 2] = phiArcPoints[k].z;
            }
            geom.setAttribute("position", new BufferAttribute(arr, 3));
          }} />
          <lineBasicMaterial attach="material" color="#9b6bf5" linewidth={3} transparent opacity={0.9} />
        </line>
      )}

      {/* --- Animated arrow and tip --- */}
      <group ref={arrowRef}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 1, 12, 1, true]} />
          <meshStandardMaterial color="#09a8ff" metalness={0.5} roughness={0.22} />
        </mesh>
        <mesh ref={tipRef}>
          <coneGeometry args={[0.06, 0.18, 18]} />
          <meshStandardMaterial emissive="#66d8ff" emissiveIntensity={1.8} color="#bfefff" />
        </mesh>
      </group>

      {/* --- Bold glowing trail mesh (Tube) - created/updated by rebuildTrailMesh() --- */}
      {trailMeshRef.current && (
        <primitive object={trailMeshRef.current} />
      )}
      {/* fallback static arrow line for immediate view */}
      <line>
        <bufferGeometry attach="geometry" onUpdate={(geom) => {
          const arr = new Float32Array([0, 0, 0, tipStatic.x, tipStatic.y, tipStatic.z]);
          geom.setAttribute("position", new BufferAttribute(arr, 3));
        }} />
        <lineBasicMaterial attach="material" color="#00e5ff" linewidth={2} transparent opacity={0.9} />
      </line>

      {/* tip stationary for initial render (also used by Html if needed) */}
      <mesh position={[tipStatic.x, tipStatic.y, tipStatic.z]}>
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshStandardMaterial emissive="#66d8ff" emissiveIntensity={0.9} color="#eaffff" />
      </mesh>

      {/* floating HTML inspector */}
      <Html position={[1.35, 1.35, 0]} center>
        <div style={{
          background: "rgba(255,255,255,0.96)",
          padding: "8px 10px",
          borderRadius: 8,
          color: "#07202a",
          fontSize: 12,
          minWidth: 150,
          boxShadow: "0 8px 24px rgba(2,8,15,0.08)"
        }}>
          <div style={{ fontWeight: 700 }}>{label}</div>
          <div style={{ marginTop: 6 }}>θ: <b>{thetaDeg.toFixed(1)}°</b></div>
          <div>φ: <b>{phiDeg.toFixed(1)}°</b></div>
          <div style={{ marginTop: 6 }}>|α|²: <b>{alphaPct.toFixed(1)}%</b></div>
          <div>|β|²: <b>{betaPct.toFixed(1)}%</b></div>
        </div>
      </Html>

      {/* Enter button */}
      {!inside && (
        <Html position={[0, -1.25, 0]} center>
          <button onClick={onEnterInside} style={{
            padding: "8px 12px", borderRadius: 8, border: "none",
            background: "#ffffff", cursor: "pointer", fontWeight: 700
          }}>Enter Sphere</button>
        </Html>
      )}
    </group>
  );
}
