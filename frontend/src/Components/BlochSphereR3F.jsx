// BlochSphereR3F.jsx
import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { gsap } from "gsap";
import { Html } from "@react-three/drei";

/**
 * BlochSphereR3F
 * Props:
 *  - vector: [x,y,z] final Bloch vector
 *  - label: string
 *  - index: integer
 */
export default function BlochSphereR3F({ vector = [0, 0, 1], label = "q0", index = 0 }) {
  const groupRef = useRef();
  const arrowRef = useRef();
  const trailRef = useRef();
  const trailPoints = useRef([]);        // array of THREE.Vector3
  const TRAIL_MAX = 40;

  // For animation target storage (we animate these with gsap)
  const targetDataRef = useRef({ x: 0, y: 0, z: 1 });

  // On mount, set initial state to |0> (north pole)
  useEffect(() => {
    targetDataRef.current = { x: 0, y: 0, z: 1 };
  }, []);

  // When incoming vector changes, animate to it
  useEffect(() => {
    const tgt = { x: vector[0] ?? 0, y: vector[1] ?? 0, z: vector[2] ?? 0 };
    // handle nearly-zero vector by leaving small z to represent mixed state center (we still animate to center)
    const duration = 1.0;
    gsap.killTweensOf(targetDataRef.current);
    gsap.to(targetDataRef.current, {
      x: tgt.x, y: tgt.y, z: tgt.z,
      duration,
      ease: "power2.inOut"
    });
  }, [vector]);

  // Update arrow orientation and trail each frame
  useFrame(() => {
    const cur = targetDataRef.current;
    // Create vector and length
    const vec = new THREE.Vector3(cur.x, cur.y, cur.z);
    const length = vec.length();

    // Arrow group: point from origin along vec
    if (arrowRef.current) {
      if (length < 1e-4) {
        // collapse arrow to tiny scale if maximally mixed
        arrowRef.current.visible = false;
      } else {
        arrowRef.current.visible = true;
        // normalize and compute quaternion from +Z to vector
        const norm = vec.clone().normalize();
        const up = new THREE.Vector3(0, 0, 1);
        const quat = new THREE.Quaternion().setFromUnitVectors(up, norm);
        arrowRef.current.setRotationFromQuaternion(quat);

        // position arrow midpoint at norm * length*0.5
        arrowRef.current.position.copy(norm.clone().multiplyScalar(length * 0.5));

        // scale cylinder length and cone position
        // children[0] -> cylinder, children[1] -> cone
        const cyl = arrowRef.current.children[0];
        const cone = arrowRef.current.children[1];
        if (cyl) {
          cyl.scale.set(1, 1, Math.max(0.0001, length * 0.8)); // scale z to length*0.8
          cyl.position.set(0, 0, (length * 0.8) / 2); // move half-way
        }
        if (cone) {
          cone.position.set(0, 0, length * 0.9);
          cone.scale.set(1, 1, 1);
        }
      }
    }

    // Manage trail: push current point onto trailPoints, cap at TRAIL_MAX
    // Only add a point if it's meaningfully different from last
    const last = trailPoints.current.length ? trailPoints.current[trailPoints.current.length - 1] : null;
    if (!last || vec.distanceTo(last) > 0.01) {
      trailPoints.current.push(vec.clone());
      if (trailPoints.current.length > TRAIL_MAX) trailPoints.current.shift();
      // update buffer geometry positions
      const geom = trailRef.current?.geometry;
      if (geom) {
        const positions = geom.attributes.position.array;
        // fill positions with trailPoints (from oldest to newest)
        const L = trailPoints.current.length;
        for (let i = 0; i < TRAIL_MAX; i++) {
          const idx = i < L ? i : null;
          const p = idx !== null ? trailPoints.current[i] : new THREE.Vector3(0, 0, 0);
          positions[i * 3 + 0] = p.x;
          positions[i * 3 + 1] = p.y;
          positions[i * 3 + 2] = p.z;
        }
        geom.setDrawRange(0, L);
        geom.attributes.position.needsUpdate = true;
      }
    }
  });

  // Create initial buffer geometry for trail
  useEffect(() => {
    // pre-allocate TRAIL_MAX vertices
    const positions = new Float32Array(TRAIL_MAX * 3);
    const geom = new THREE.BufferGeometry();
    geom.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geom.setDrawRange(0, 0); // initially empty
    if (trailRef.current) {
      trailRef.current.geometry = geom;
    }
  }, []);

  // visual elements: sphere (silver material), arrow, trail line
  return (
    <group ref={groupRef} dispose={null}>
      {/* Silver sphere base */}
      <mesh>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#dfe6ea" metalness={1} roughness={0.25} envMapIntensity={1.2} />
      </mesh>

      {/* subtle inner overlay to hint mixed states */}
      <mesh scale={[0.995, 0.995, 0.995]}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshStandardMaterial color="#ffffff" metalness={0.2} roughness={0.9} opacity={0.07} transparent />
      </mesh>

      {/* trail line (thin) */}
      <line ref={trailRef}>
        <bufferGeometry />
        <lineBasicMaterial color="#6fbdf7" linewidth={2} transparent opacity={0.9} />
      </line>

      {/* Arrow group (cylinder + cone) */}
      <group ref={arrowRef}>
        <mesh>
          <cylinderGeometry args={[0.02, 0.02, 1, 12, 1, true]} />
          <meshStandardMaterial color="#d13a3a" metalness={0.6} roughness={0.3} />
        </mesh>
        <mesh>
          <coneGeometry args={[0.05, 0.18, 18]} />
          <meshStandardMaterial color="#d13a3a" metalness={0.7} roughness={0.2} />
        </mesh>
      </group>

      {/* label (HTML overlay) */}
      <Html position={[0, -1.35, 0]} center>
        <div style={{
          background: 'rgba(12,18,22,0.75)',
          padding: '6px 10px', borderRadius: 8, color: '#eaf6ff',
          fontSize: 12, border: '1px solid rgba(255,255,255,0.06)'
        }}>
          <strong>{label}</strong>
        </div>
      </Html>
    </group>
  );
}