import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  IconButton,
  Dialog,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseIcon from "@mui/icons-material/Close";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArchitectureIcon from "@mui/icons-material/Architecture";
import CodeIcon from "@mui/icons-material/Code";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import ElectricBoltIcon from "@mui/icons-material/ElectricBolt";

const GATE_CATEGORIES = [
  {
    category: "Superposition & Single-Qubit",
    gates: [
      { name: "H (Hadamard)", qiskit: "qc.h(0)", desc: "Creates equal superposition: |0⟩ → (|0⟩+|1⟩)/√2 and |1⟩ → (|0⟩-|1⟩)/√2." },
      { name: "X (Pauli-X)", qiskit: "qc.x(0)", desc: "Quantum NOT gate. Inverts |0⟩ ↔ |1⟩ (180° rotation about X-axis)." },
      { name: "Y (Pauli-Y)", qiskit: "qc.y(0)", desc: "Bit and phase flip: |0⟩ → i|1⟩, |1⟩ → -i|0⟩ (180° rotation about Y-axis)." },
      { name: "Z (Pauli-Z)", qiskit: "qc.z(0)", desc: "Phase flip: Leaves |0⟩ unchanged, flips phase of |1⟩ → -|1⟩." },
    ],
  },
  {
    category: "Phase & Rotations",
    gates: [
      { name: "S / S† (Phase)", qiskit: "qc.s(0)", desc: "Applies a π/2 phase shift (square root of Z gate): S = diag(1, i)." },
      { name: "T / T† (π/8)", qiskit: "qc.t(0)", desc: "Applies a π/4 phase shift (fourth root of Z gate). Universal computing set." },
      { name: "Rx, Ry, Rz", qiskit: "qc.rx(θ, 0)", desc: "Continuous parametric rotation of state vector by angle θ about x/y/z axes." },
    ],
  },
  {
    category: "Multi-Qubit Entanglement",
    gates: [
      { name: "CX / CNOT", qiskit: "qc.cx(c, t)", desc: "Controlled-NOT: Flips target qubit if control qubit is in state |1⟩." },
      { name: "CZ (Controlled-Z)", qiskit: "qc.cz(c, t)", desc: "Applies phase flip |11⟩ → -|11⟩ symmetrically between two qubits." },
      { name: "SWAP", qiskit: "qc.swap(a, b)", desc: "Exchanges quantum states between two qubits: |01⟩ ↔ |10⟩." },
      { name: "CCX (Toffoli)", qiskit: "qc.ccx(c1, c2, t)", desc: "Controlled-Controlled-NOT: Flips target only when both controls are |1⟩." },
    ],
  },
];

export default function CustomBuildGuidePanel() {
  const [zoomOpen, setZoomOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const guideImageUrl = "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Bloch_sphere.svg/800px-Bloch_sphere.svg.png";

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, minWidth: 0 }}>
      {/* Primary Overview Card */}
      <Card
        sx={{
          background: "var(--qt-surface-glass, var(--qt-surface))",
          border: "1px solid var(--qt-border)",
          borderRadius: 2.5,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}>
          {/* Header */}
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1.5 }}>
              <Chip
                label="CIRCUIT ARCHITECTURE"
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  background: "rgba(76, 195, 250, 0.12)",
                  color: "var(--qt-accent, #4cc3fa)",
                  border: "1px solid rgba(76, 195, 250, 0.3)",
                }}
              />
              <Chip
                label="CUSTOM BUILD"
                size="small"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.72rem",
                  background: "rgba(102, 126, 234, 0.15)",
                  color: "#667eea",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                }}
              />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 700, color: "var(--qt-text)", lineHeight: 1.3, mb: 0.5 }}>
              Custom Circuit Designer
            </Typography>
            <Typography variant="body2" sx={{ color: "var(--qt-text-dim)", lineHeight: 1.5 }}>
              Construct, simulate, and debug arbitrary multi-qubit algorithms with real-time state analysis.
            </Typography>
          </Box>

          {/* Architecture Illustration */}
          {!imageError && (
            <Box
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid var(--qt-border)",
                background: "#0d1117",
                textAlign: "center",
                cursor: "pointer",
                transition: "border-color 0.2s",
                "&:hover": {
                  borderColor: "var(--qt-accent, #4cc3fa)",
                  "& .zoom-btn": { opacity: 1 },
                },
              }}
              onClick={() => setZoomOpen(true)}
            >
              <Box
                component="img"
                src={guideImageUrl}
                alt="Quantum State Geometry"
                onError={() => setImageError(true)}
                sx={{
                  width: "100%",
                  maxHeight: 220,
                  objectFit: "contain",
                  p: 2,
                  display: "block",
                  background: "#fff",
                }}
              />
              <Box
                className="zoom-btn"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(0, 0, 0, 0.75)",
                  color: "#fff",
                  borderRadius: "50%",
                  p: 0.5,
                  opacity: 0.7,
                  transition: "opacity 0.2s",
                }}
              >
                <ZoomInIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box
                sx={{
                  p: 1,
                  background: "rgba(0, 0, 0, 0.7)",
                  borderTop: "1px solid var(--qt-border)",
                  color: "var(--qt-text-dim)",
                  fontSize: "0.78rem",
                  textAlign: "center",
                }}
              >
                Bloch Sphere Single-Qubit Phase & Amplitude Coordinate Geometry
              </Box>
            </Box>
          )}

          <Divider sx={{ borderColor: "var(--qt-border)" }} />

          {/* Workflow Guide */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: "var(--qt-text)", display: "flex", alignItems: "center", gap: 1 }}>
              <ArchitectureIcon sx={{ color: "var(--qt-accent, #4cc3fa)", fontSize: 20 }} />
              Circuit Design Workflow
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.2 }}>
              {[
                { title: "1. Allocation", desc: "Initialize quantum register with n qubits: qc = QuantumCircuit(n, n)" },
                { title: "2. Transformations", desc: "Apply single-qubit gates (H, X, Z) and entangling gates (CX, CZ)" },
                { title: "3. State Reporting", desc: "Use report(circuit=qc) to send statevectors and OpenQASM to the runtime" },
                { title: "4. Execution & Inspection", desc: "Click Execute Circuit (Ctrl+Enter) to open the 3D Bloch & Debugger modal" },
              ].map((step, idx) => (
                <Box
                  key={idx}
                  sx={{
                    p: 1.2,
                    borderRadius: 1.5,
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--qt-border)",
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "var(--qt-accent, #4cc3fa)", display: "block" }}>
                    {step.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "var(--qt-text-dim)", fontSize: "0.82rem" }}>
                    {step.desc}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>

          <Divider sx={{ borderColor: "var(--qt-border)" }} />

          {/* Quantum Gate Reference / Cheat Sheet */}
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, color: "var(--qt-text)", display: "flex", alignItems: "center", gap: 1 }}>
              <ElectricBoltIcon sx={{ color: "#ffd54f", fontSize: 20 }} />
              Gate Quick Reference
            </Typography>

            <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
              {GATE_CATEGORIES.map((cat, catIdx) => (
                <Accordion
                  key={catIdx}
                  defaultExpanded={catIdx === 0}
                  sx={{
                    background: "rgba(255, 255, 255, 0.02)",
                    border: "1px solid var(--qt-border)",
                    borderRadius: "8px !important",
                    "&:before": { display: "none" },
                    boxShadow: "none",
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMoreIcon sx={{ color: "var(--qt-text-dim)" }} />}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "var(--qt-text)", fontSize: "0.85rem" }}>
                      {cat.category}
                    </Typography>
                  </AccordionSummary>
                  <AccordionDetails sx={{ pt: 0, display: "flex", flexDirection: "column", gap: 1 }}>
                    {cat.gates.map((g, gIdx) => (
                      <Box key={gIdx} sx={{ p: 1, borderRadius: 1, background: "#090d16", border: "1px solid rgba(255, 255, 255, 0.04)" }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 0.5 }}>
                          <Typography variant="caption" sx={{ fontWeight: 700, color: "var(--qt-accent, #4cc3fa)" }}>
                            {g.name}
                          </Typography>
                          <Typography variant="caption" sx={{ fontFamily: "monospace", color: "#64ffda", background: "rgba(100, 255, 218, 0.08)", px: 0.8, py: 0.2, borderRadius: 0.5 }}>
                            {g.qiskit}
                          </Typography>
                        </Box>
                        <Typography variant="caption" sx={{ color: "var(--qt-text-dim)", display: "block", fontSize: "0.78rem" }}>
                          {g.desc}
                        </Typography>
                      </Box>
                    ))}
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Fullscreen Zoom Dialog */}
      <Dialog
        open={zoomOpen}
        onClose={() => setZoomOpen(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "#0d1117",
            border: "1px solid var(--qt-border)",
            borderRadius: 3,
            p: 2,
            position: "relative",
          },
        }}
      >
        <IconButton
          onClick={() => setZoomOpen(false)}
          sx={{
            position: "absolute",
            top: 12,
            right: 12,
            background: "rgba(255, 255, 255, 0.1)",
            color: "#fff",
            "&:hover": { background: "rgba(255, 255, 255, 0.2)" },
          }}
        >
          <CloseIcon />
        </IconButton>
        <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mb: 1, pr: 5 }}>
          Single-Qubit Bloch Sphere Coordinate System
        </Typography>
        <Box
          component="img"
          src={guideImageUrl}
          alt="Bloch Sphere"
          sx={{
            width: "100%",
            maxHeight: "75vh",
            objectFit: "contain",
            borderRadius: 2,
            background: "#fff",
            p: 2,
          }}
        />
      </Dialog>
    </Box>
  );
}
