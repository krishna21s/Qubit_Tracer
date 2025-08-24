import React, { useState } from "react";
import * as THREE from "three";

function App() {
  const [type, setType] = useState("bell");
  const [qasm, setQasm] = useState("");
  const [blochData, setBlochData] = useState(null);

  const fetchData = async () => {
    const payload = type === "custom" ? { type, qasm } : { type };
    const res = await fetch("http://127.0.0.1:5000/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    setBlochData(data);
    drawBlochSpheres(data.bloch_vectors);
  };

  const drawBlochSpheres = (vectors) => {
    // Clear any previous scene
    const container = document.getElementById("viewer");
    container.innerHTML = "";

    vectors.forEach((vec, index) => {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ antialias: true });
      renderer.setSize(300, 300);
      container.appendChild(renderer.domElement);

      // Bloch sphere
      const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: 0x8888ff,
        wireframe: true
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      scene.add(sphere);

      // Arrow (Bloch vector)
      const dir = new THREE.Vector3(...vec).normalize();
      const arrow = new THREE.ArrowHelper(dir, new THREE.Vector3(0, 0, 0), dir.length(), 0xff0000);
      scene.add(arrow);

      camera.position.z = 3;

      const animate = () => {
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();
    });
  };

  return (
    <div style={{ padding: 20 }}>
      <h1>Qubit-Tracer Test UI</h1>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="bell">Bell</option>
        <option value="ghz">GHZ</option>
        <option value="custom">Custom</option>
      </select>
      {type === "custom" && (
        <textarea
          rows={6}
          cols={50}
          placeholder="Paste OpenQASM here..."
          value={qasm}
          onChange={(e) => setQasm(e.target.value)}
        />
      )}
      <br />
      <button onClick={fetchData}>Simulate</button>

      <div id="viewer" style={{ display: "flex", flexWrap: "wrap", gap: "20px", marginTop: "20px" }}></div>

      {blochData && (
        <pre style={{ background: "#eee", padding: 10, marginTop: 20 }}>
          {JSON.stringify(blochData, null, 2)}
        </pre>
      )}
    </div>
  );
}

export default App;
