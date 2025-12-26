import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  TextField,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Chip,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import CodeIcon from "@mui/icons-material/Code";
import BugReportIcon from "@mui/icons-material/BugReport";
import DownloadIcon from "@mui/icons-material/Download";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HistoryIcon from "@mui/icons-material/History";
import GetAppIcon from "@mui/icons-material/GetApp";
import ExtensionIcon from "@mui/icons-material/Extension";
import Editor from "@monaco-editor/react";
import AdvancedBlochViewer from "../AdvancedBlochViewer";
import VisualCircuitRenderer from "../circuit/VisualCircuitRenderer";
import { getSnippetsByCategory } from "../../data/codeSnippets";
import DebugPanel from "./DebugPanel";
import OptimizationPanel from "./OptimizationPanel";
import "./algohub-debug.css";

const STORAGE_KEY = "algohub_custom_circuits";
const AUTOSAVE_KEY = "algohub_autosave";

// Default blank template
const BLANK_TEMPLATE = `from qiskit import QuantumCircuit, transpile
from qiskit_aer import AerSimulator
from qiskit.quantum_info import Statevector
from algohub_runtime import report

# Create your quantum circuit here
qc = QuantumCircuit(2, 2)

# Add your gates
qc.h(0)
qc.cx(0, 1)

# Measure
qc.measure([0, 1], [0, 1])

print("My Custom Circuit:")
print(qc.draw(output='text'))

# Simulate
simulator = AerSimulator()
compiled_circuit = transpile(qc, simulator)
job = simulator.run(compiled_circuit, shots=1000)
result = job.result()
counts = result.get_counts()

# Capture data for visualization
statevector = Statevector.from_instruction(qc.remove_final_measurements(inplace=False))
report(circuit=qc, statevector=statevector, counts=counts)

print("\\nMeasurement Results:")
print(counts)
`;

export default function CustomBuildContent({ onBack }) {
  const [circuitName, setCircuitName] = useState("Untitled Circuit");
  const [code, setCode] = useState(BLANK_TEMPLATE);
  const [output, setOutput] = useState("");
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);
  const [saveStatus, setSaveStatus] = useState(""); // "saved", "unsaved", "saving"
  const [lastSaved, setLastSaved] = useState(null);
  
  // Debug panel state
  const [errorAnalysis, setErrorAnalysis] = useState(null);
  const [codeIssues, setCodeIssues] = useState([]);
  const [circuitProfile, setCircuitProfile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Dialog states
  const [saveDialogOpen, setSaveDialogOpen] = useState(false);
  const [loadDialogOpen, setLoadDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [historyDialogOpen, setHistoryDialogOpen] = useState(false);
  const [snippetsDialogOpen, setSnippetsDialogOpen] = useState(false);
  const [savedCircuits, setSavedCircuits] = useState([]);
  const [tempCircuitName, setTempCircuitName] = useState("");
  const [versionHistory, setVersionHistory] = useState([]);
  
  // Monaco editor ref for decorations
  const editorRef = React.useRef(null);
  const monacoRef = React.useRef(null);

  // Load saved circuits from localStorage
  useEffect(() => {
    loadSavedCircuitsList();
    loadAutoSave();
  }, []);

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (code && code !== BLANK_TEMPLATE) {
        autoSave();
      }
    }, 30000);
    return () => clearInterval(interval);
  }, [code, circuitName]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+S or Cmd+S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveClick();
      }
      // Ctrl+Enter or Cmd+Enter to execute
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        if (!executing) {
          handleExecute();
        }
      }
      // Ctrl+E or Cmd+E for export dialog
      if ((e.ctrlKey || e.metaKey) && e.key === "e") {
        e.preventDefault();
        setExportDialogOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [code, executing]);
  
  // Monaco editor error decorations
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !errorAnalysis?.line_number) return;
    
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const lineNumber = errorAnalysis.line_number;
    
    // Create error decoration
    const decorations = editor.deltaDecorations([], [
      {
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: 'error-line-decoration',
          glyphMarginClassName: 'error-glyph-decoration',
          glyphMarginHoverMessage: { value: errorAnalysis.title || 'Error on this line' },
          hoverMessage: { value: errorAnalysis.suggestion || errorAnalysis.description },
        }
      }
    ]);
    
    // Scroll to error line
    editor.revealLineInCenter(lineNumber);
    
    // Clean up decorations when error is cleared
    return () => {
      if (editor) {
        editor.deltaDecorations(decorations, []);
      }
    };
  }, [errorAnalysis]);

  const loadSavedCircuitsList = () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setSavedCircuits(JSON.parse(saved));
      }
    } catch (err) {
      console.error("Failed to load circuits:", err);
    }
  };

  const loadAutoSave = () => {
    try {
      const autosave = localStorage.getItem(AUTOSAVE_KEY);
      if (autosave) {
        const data = JSON.parse(autosave);
        const autoSaveAge = Date.now() - data.timestamp;
        // Only restore if less than 1 hour old
        if (autoSaveAge < 3600000) {
          setCode(data.code);
          setCircuitName(data.name || "Untitled Circuit");
          setSaveStatus("autosaved");
        }
      }
    } catch (err) {
      console.error("Failed to load autosave:", err);
    }
  };

  const autoSave = () => {
    try {
      const data = {
        code,
        name: circuitName,
        timestamp: Date.now(),
      };
      localStorage.setItem(AUTOSAVE_KEY, JSON.stringify(data));
      setSaveStatus("autosaved");
      setLastSaved(new Date());
    } catch (err) {
      console.error("Auto-save failed:", err);
    }
  };

  const handleSaveClick = () => {
    setTempCircuitName(circuitName);
    setSaveDialogOpen(true);
  };

  const handleSaveConfirm = () => {
    if (!tempCircuitName.trim()) {
      alert("Please enter a circuit name");
      return;
    }

    try {
      const circuits = savedCircuits || [];
      const newCircuit = {
        id: Date.now().toString(),
        name: tempCircuitName,
        code,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Check if updating existing circuit
      const existingIndex = circuits.findIndex((c) => c.name === tempCircuitName);
      if (existingIndex >= 0) {
        circuits[existingIndex] = { ...circuits[existingIndex], code, updatedAt: newCircuit.updatedAt };
      } else {
        circuits.unshift(newCircuit);
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(circuits));
      setSavedCircuits(circuits);
      setCircuitName(tempCircuitName);
      setSaveStatus("saved");
      setLastSaved(new Date());
      setSaveDialogOpen(false);
    } catch (err) {
      console.error("Save failed:", err);
      alert("Failed to save circuit. Storage might be full.");
    }
  };

  const handleLoadCircuit = (circuit) => {
    setCode(circuit.code);
    setCircuitName(circuit.name);
    setOutput("");
    setError(null);
    setVisualizationData(null);
    setSaveStatus("saved");
    setLoadDialogOpen(false);
  };

  const handleDeleteCircuit = (circuitId, e) => {
    e.stopPropagation();
    if (window.confirm("Delete this circuit?")) {
      const filtered = savedCircuits.filter((c) => c.id !== circuitId);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      setSavedCircuits(filtered);
    }
  };

  const handleNewCircuit = () => {
    if (saveStatus === "unsaved") {
      if (!window.confirm("You have unsaved changes. Create new circuit anyway?")) {
        return;
      }
    }
    setCode(BLANK_TEMPLATE);
    setCircuitName("Untitled Circuit");
    setOutput("");
    setError(null);
    setVisualizationData(null);
    setSaveStatus("");
  };

  const handleExportPython = () => {
    const blob = new Blob([code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${circuitName.replace(/\s+/g, "_")}.py`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleExportQASM = () => {
    if (!visualizationData?.openqasm) {
      alert("Please execute the circuit first to generate QASM");
      return;
    }
    const blob = new Blob([visualizationData.openqasm], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${circuitName.replace(/\s+/g, "_")}.qasm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportDialogOpen(false);
  };

  const handleExportJSON = () => {
    const exportData = {
      name: circuitName,
      code,
      visualization: visualizationData,
      exportedAt: new Date().toISOString(),
      version: "1.0",
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${circuitName.replace(/\s+/g, "_")}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setExportDialogOpen(false);
  };

  const handleImportFile = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        
        // Check if JSON (full circuit data)
        if (file.name.endsWith(".json")) {
          const data = JSON.parse(content);
          setCode(data.code || content);
          setCircuitName(data.name || file.name.replace(".json", ""));
          if (data.visualization) {
            setVisualizationData(data.visualization);
          }
        } else {
          // Plain Python or QASM file
          setCode(content);
          setCircuitName(file.name.replace(/\.(py|qasm)$/, ""));
        }
        
        setSaveStatus("unsaved");
        setOutput("File imported successfully!");
      } catch (err) {
        alert("Failed to import file: " + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = ""; // Reset input
  };

  const handleDuplicateCircuit = (circuit, e) => {
    e.stopPropagation();
    setCode(circuit.code);
    setCircuitName(`${circuit.name} (Copy)`);
    setSaveStatus("unsaved");
    setLoadDialogOpen(false);
  };

  const handleRenameCircuit = (circuitId, newName) => {
    const updated = savedCircuits.map((c) =>
      c.id === circuitId ? { ...c, name: newName, updatedAt: new Date().toISOString() } : c
    );
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setSavedCircuits(updated);
  };

  const saveVersion = () => {
    const version = {
      id: Date.now().toString(),
      code,
      timestamp: new Date().toISOString(),
      label: `Version ${versionHistory.length + 1}`,
    };
    const newHistory = [version, ...versionHistory].slice(0, 10); // Keep last 10
    setVersionHistory(newHistory);
  };

  const loadVersion = (version) => {
    if (saveStatus === "unsaved") {
      if (!window.confirm("You have unsaved changes. Load this version anyway?")) {
        return;
      }
    }
    setCode(version.code);
    setSaveStatus("unsaved");
    setHistoryDialogOpen(false);
  };

  const insertSnippet = (snippet) => {
    // Insert at cursor position or append
    setCode((prevCode) => prevCode + "\n\n" + snippet.code);
    setSaveStatus("unsaved");
    setSnippetsDialogOpen(false);
  };

  const handleCodeChange = (value) => {
    if (typeof value === "string") {
      setCode(value);
      setSaveStatus("unsaved");
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    setError(null);
    setOutput("Executing quantum circuit...\n");
    setVisualizationData(null);
    setErrorAnalysis(null);
    setCircuitProfile(null);
    
    // Save version before execution
    saveVersion();

    try {
      const response = await fetch("http://127.0.0.1:8000/algohub/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();

      console.log("[CustomBuild] API Response:", data);

      if (response.ok && data.success) {
        const stdoutText = typeof data.stdout === "string" ? data.stdout : "";
        setOutput((prev) => prev + "\n" + stdoutText);

        const hasBlochVectors = Array.isArray(data.bloch_vectors) && data.bloch_vectors.length > 0;
        const hasOpenQasm = data.openqasm && typeof data.openqasm === "string";
        const hasCounts = data.counts && typeof data.counts === "object";

        if (hasBlochVectors || hasOpenQasm || hasCounts) {
          console.log("[CustomBuild] Setting visualization data");
          setVisualizationData({
            bloch_vectors: hasBlochVectors ? data.bloch_vectors : null,
            openqasm: hasOpenQasm ? data.openqasm : null,
            counts: hasCounts ? data.counts : null,
            probabilities: data.probabilities || null,
          });
        }
        
        // Set circuit profiling data
        if (data.circuit_profile) {
          console.log("[CustomBuild] Circuit profiling data received");
          setCircuitProfile(data.circuit_profile);
        }
      } else {
        setError(data.error || "Execution failed");
        const stderrText =
          typeof data.stderr === "string"
            ? data.stderr
            : typeof data.error === "string"
            ? data.error
            : "";
        setOutput((prev) => prev + "\n❌ Error:\n" + stderrText);
        
        // Set error analysis data
        if (data.error_analysis) {
          console.log("[CustomBuild] Error analysis received:", data.error_analysis.error_type);
          setErrorAnalysis(data.error_analysis);
        }
      }
    } catch (err) {
      setError("Failed to connect to backend");
      setOutput((prev) => prev + "\n❌ Connection Error: " + err.message);
    } finally {
      setExecuting(false);
    }
  };
  
  // Analyze code for issues (pre-execution)
  const handleAnalyzeCode = async () => {
    if (!code.trim() || analyzing) return;
    
    setAnalyzing(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/algohub/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      const data = await response.json();
      
      if (response.ok && data.success) {
        console.log("[CustomBuild] Code analysis:", data.issues.length, "issues found");
        setCodeIssues(data.issues || []);
      }
    } catch (err) {
      console.error("[CustomBuild] Code analysis failed:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSaveStatusText = () => {
    if (saveStatus === "saved" && lastSaved) {
      const seconds = Math.floor((Date.now() - lastSaved.getTime()) / 1000);
      if (seconds < 60) return `Saved ${seconds}s ago`;
      const minutes = Math.floor(seconds / 60);
      return `Saved ${minutes}m ago`;
    }
    if (saveStatus === "autosaved" && lastSaved) {
      return "Auto-saved";
    }
    if (saveStatus === "unsaved") return "Unsaved changes";
    return "";
  };

  return (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column", gap: 2, p: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 1 }}>
        <IconButton onClick={onBack} sx={{ color: "var(--qt-text)" }}>
          <ArrowBackIcon />
        </IconButton>
        <Box sx={{ flex: 1 }}>
          <TextField
            value={circuitName}
            onChange={(e) => {
              setCircuitName(e.target.value);
              setSaveStatus("unsaved");
            }}
            variant="standard"
            sx={{
              "& .MuiInput-input": {
                fontSize: "1.5rem",
                fontWeight: 600,
                color: "var(--qt-text)",
              },
            }}
            fullWidth
          />
          <Typography variant="caption" sx={{ color: "var(--qt-text-dim)", mt: 0.5 }}>
            {getSaveStatusText()}
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1 }}>
          <Tooltip title="New Circuit">
            <Button
              variant="outlined"
              startIcon={<CodeIcon />}
              onClick={handleNewCircuit}
              sx={{ textTransform: "none" }}
            >
              New
            </Button>
          </Tooltip>
          <Tooltip title="Save Circuit">
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveClick}
              sx={{ textTransform: "none" }}
            >
              Save
            </Button>
          </Tooltip>
          <Tooltip title="Load Circuit">
            <Button
              variant="outlined"
              startIcon={<FolderOpenIcon />}
              onClick={() => {
                loadSavedCircuitsList();
                setLoadDialogOpen(true);
              }}
              sx={{ textTransform: "none" }}
            >
              Load
            </Button>
          </Tooltip>
          <Tooltip title="Import File">
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{ textTransform: "none" }}
            >
              Import
              <input type="file" hidden accept=".py,.json,.qasm" onChange={handleImportFile} />
            </Button>
          </Tooltip>
          <Tooltip title="Export Options">
            <Button
              variant="outlined"
              startIcon={<GetAppIcon />}
              onClick={() => setExportDialogOpen(true)}
              sx={{ textTransform: "none" }}
            >
              Export
            </Button>
          </Tooltip>
          <Tooltip title="Code Snippets">
            <Button
              variant="outlined"
              startIcon={<ExtensionIcon />}
              onClick={() => setSnippetsDialogOpen(true)}
              sx={{ textTransform: "none" }}
            >
              Snippets
            </Button>
          </Tooltip>
          <Tooltip title="Version History">
            <IconButton onClick={() => setHistoryDialogOpen(true)} sx={{ color: "var(--qt-text)" }}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Analyze code for potential issues">
            <Button
              variant="outlined"
              startIcon={analyzing ? <CircularProgress size={16} /> : <BugReportIcon />}
              onClick={handleAnalyzeCode}
              disabled={analyzing || !code.trim()}
              sx={{ 
                textTransform: "none",
                borderColor: "#ffa726",
                color: "#ffa726",
                "&:hover": {
                  borderColor: "#ff9800",
                  bgcolor: "rgba(255, 167, 38, 0.1)"
                }
              }}
            >
              {analyzing ? "Analyzing..." : "Analyze"}
            </Button>
          </Tooltip>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError(null)} sx={{ mb: 1 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, flex: 1, minHeight: 0 }}>
        {/* Left Panel */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 0 }}>
          {/* Code Editor */}
          <Paper
            sx={{
              background: "#1e1e1e",
              border: "1px solid var(--qt-border)",
              borderRadius: 2,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: { xs: 400, sm: 450, md: 500, xl: 550 },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: "1px solid var(--qt-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "var(--qt-text)" }}>
                Python Code Editor
              </Typography>
              <Chip label="Full Editing Enabled" size="small" color="success" sx={{ fontSize: "0.7rem" }} />
            </Box>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={handleCodeChange}
                onMount={(editor, monaco) => {
                  editorRef.current = editor;
                  monacoRef.current = monaco;
                }}
                theme="vs-dark"
                options={{
                  readOnly: false,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: "on",
                }}
              />
            </Box>
          </Paper>

          {/* Execute Button */}
          <Button
            variant="contained"
            size="large"
            startIcon={executing ? <CircularProgress size={20} color="inherit" /> : <PlayArrowIcon />}
            onClick={handleExecute}
            disabled={executing}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              textTransform: "none",
              fontSize: "1rem",
              fontWeight: 600,
              py: 1.5,
            }}
          >
            {executing ? "Executing..." : "Execute Circuit"}
          </Button>

          {/* Console Output */}
          <Paper
            sx={{
              background: "#1e1e1e",
              border: "1px solid var(--qt-border)",
              borderRadius: 2,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: { xs: 200, sm: 220, md: 250 },
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.5,
                borderBottom: "1px solid #333",
                display: "flex",
                alignItems: "center",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#d4d4d4" }}>
                Console Output
              </Typography>
            </Box>
            <Box
              sx={{
                flex: 1,
                overflow: "auto",
                p: 2,
                fontFamily: "'Consolas', 'Monaco', monospace",
                fontSize: "0.85rem",
                color: "#d4d4d4",
                whiteSpace: "pre-wrap",
                lineHeight: 1.6,
              }}
            >
              {output || "No output yet. Click 'Execute Circuit' to run your code."}
            </Box>
          </Paper>
        </Box>

        {/* Right Panel - Visualizations */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, minHeight: 0, overflow: "auto" }}>
          {/* Bloch Spheres */}
          <Card
            sx={{
              background: "var(--qt-surface-glass, var(--qt-surface))",
              border: "1px solid var(--qt-border)",
              borderRadius: 2,
              minHeight: 320,
            }}
          >
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--qt-text)" }}>
                Bloch Sphere Visualization
              </Typography>
              <Box sx={{ flex: 1, minHeight: 400, position: "relative" }}>
                {(() => {
                  const hasValidVectors =
                    Array.isArray(visualizationData?.bloch_vectors) && visualizationData.bloch_vectors.length > 0;

                  if (hasValidVectors) {
                    return (
                      <Box sx={{ position: "absolute", inset: 0 }}>
                        <AdvancedBlochViewer
                          vectors={visualizationData.bloch_vectors}
                          showInfoDefault={true}
                          background="transparent"
                        />
                      </Box>
                    );
                  } else {
                    return (
                      <Box
                        sx={{
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--qt-text-dim)",
                          textAlign: "center",
                          fontSize: "0.95rem",
                        }}
                      >
                        Execute your circuit to visualize qubit states on the Bloch sphere.
                      </Box>
                    );
                  }
                })()}
              </Box>
            </CardContent>
          </Card>

          {/* Circuit Diagram */}
          <Card
            sx={{
              background: "var(--qt-surface-glass, var(--qt-surface))",
              border: "1px solid var(--qt-border)",
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--qt-text)" }}>
                Circuit Diagram
              </Typography>
              <Box
                sx={{
                  background: "var(--qt-bg-main, var(--qt-surface))",
                  borderRadius: 1,
                  border: "1px solid var(--qt-border)",
                  p: 2,
                  minHeight: 200,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {visualizationData?.openqasm ? (
                  <VisualCircuitRenderer qasm={visualizationData.openqasm} />
                ) : (
                  <Typography variant="body2" sx={{ color: "var(--qt-text-dim)" }}>
                    Circuit diagram will appear here after execution.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Measurement Results */}
          {visualizationData?.counts && (
            <Card
              sx={{
                background: "var(--qt-surface-glass, var(--qt-surface))",
                border: "1px solid var(--qt-border)",
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--qt-text)" }}>
                  Measurement Results
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                  {Object.entries(visualizationData.counts).map(([state, count]) => (
                    <Box key={state} sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Chip
                        label={state}
                        size="small"
                        sx={{
                          fontFamily: "monospace",
                          fontWeight: 600,
                          minWidth: 60,
                        }}
                      />
                      <Box
                        sx={{
                          flex: 1,
                          height: 24,
                          background: "linear-gradient(90deg, #667eea, #764ba2)",
                          borderRadius: 1,
                          width: `${Math.min((count / 1024) * 100, 100)}%`,
                        }}
                      />
                      <Typography variant="body2" sx={{ color: "var(--qt-text-dim)", minWidth: 50 }}>
                        {count}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Circuit Statistics */}
          {visualizationData?.openqasm && (
            <Card
              sx={{
                background: "var(--qt-surface-glass, var(--qt-surface))",
                border: "1px solid var(--qt-border)",
                borderRadius: 2,
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 2, color: "var(--qt-text)" }}>
                  Circuit Statistics
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ color: "var(--qt-text-dim)" }}>
                      Qubits:
                    </Typography>
                    <Typography variant="body2" sx={{ color: "var(--qt-text)", fontWeight: 600 }}>
                      {visualizationData.bloch_vectors?.length || "N/A"}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ color: "var(--qt-text-dim)" }}>
                      Total Gates:
                    </Typography>
                    <Typography variant="body2" sx={{ color: "var(--qt-text)", fontWeight: 600 }}>
                      {visualizationData.openqasm.split("\n").filter(l => !l.startsWith("//") && !l.includes("OPENQASM") && !l.includes("include") && !l.includes("qreg") && !l.includes("creg") && l.trim()).length}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                    <Typography variant="body2" sx={{ color: "var(--qt-text-dim)" }}>
                      Code Lines:
                    </Typography>
                    <Typography variant="body2" sx={{ color: "var(--qt-text)", fontWeight: 600 }}>
                      {code.split("\n").length}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}
          
          {/* Debug Panel */}
          <DebugPanel
            errorAnalysis={errorAnalysis}
            codeIssues={codeIssues}
            circuitProfile={circuitProfile}
          />
          
          {/* Optimization Panel */}
          {visualizationData?.openqasm && (
            <OptimizationPanel qasm={visualizationData.openqasm} />
          )}
        </Box>
      </Box>

      {/* Save Dialog */}
      <Dialog open={saveDialogOpen} onClose={() => setSaveDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Save Circuit</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Circuit Name"
            fullWidth
            value={tempCircuitName}
            onChange={(e) => setTempCircuitName(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleSaveConfirm();
              }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSaveDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleSaveConfirm} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={loadDialogOpen} onClose={() => setLoadDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Load Saved Circuit</DialogTitle>
        <DialogContent>
          {savedCircuits.length === 0 ? (
            <Typography variant="body2" sx={{ color: "var(--qt-text-dim)", py: 3, textAlign: "center" }}>
              No saved circuits yet. Create and save your first circuit!
            </Typography>
          ) : (
            <List>
              {savedCircuits.map((circuit) => (
                <ListItem
                  key={circuit.id}
                  disablePadding
                  secondaryAction={
                    <Box>
                      <Tooltip title="Duplicate">
                        <IconButton onClick={(e) => handleDuplicateCircuit(circuit, e)}>
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton edge="end" onClick={(e) => handleDeleteCircuit(circuit.id, e)}>
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  }
                >
                  <ListItemButton onClick={() => handleLoadCircuit(circuit)}>
                    <ListItemIcon>
                      <FileCopyIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={circuit.name}
                      secondary={`Updated: ${new Date(circuit.updatedAt).toLocaleString()}`}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLoadDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={exportDialogOpen} onClose={() => setExportDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Export Circuit</DialogTitle>
        <DialogContent>
          <List>
            <ListItem disablePadding>
              <ListItemButton onClick={handleExportPython}>
                <ListItemIcon>
                  <CodeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Python Script (.py)"
                  secondary="Export as standalone Python file"
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton
                onClick={handleExportQASM}
                disabled={!visualizationData?.openqasm}
              >
                <ListItemIcon>
                  <CodeIcon />
                </ListItemIcon>
                <ListItemText
                  primary="OpenQASM (.qasm)"
                  secondary={visualizationData?.openqasm ? "Export circuit as QASM" : "Execute circuit first"}
                />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton onClick={handleExportJSON}>
                <ListItemIcon>
                  <SaveIcon />
                </ListItemIcon>
                <ListItemText
                  primary="Full Circuit Data (.json)"
                  secondary="Export with code, name, and visualization data"
                />
              </ListItemButton>
            </ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setExportDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={historyDialogOpen} onClose={() => setHistoryDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>Version History (Last 10)</DialogTitle>
        <DialogContent>
          {versionHistory.length === 0 ? (
            <Typography variant="body2" sx={{ color: "var(--qt-text-dim)", py: 3, textAlign: "center" }}>
              No version history yet. Versions are saved automatically when you execute code.
            </Typography>
          ) : (
            <List>
              {versionHistory.map((version, index) => (
                <ListItem key={version.id} disablePadding>
                  <ListItemButton onClick={() => loadVersion(version)}>
                    <ListItemIcon>
                      <HistoryIcon />
                    </ListItemIcon>
                    <ListItemText
                      primary={`${version.label} ${index === 0 ? "(Current)" : ""}`}
                      secondary={new Date(version.timestamp).toLocaleString()}
                    />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistoryDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Code Snippets Dialog */}
      <Dialog open={snippetsDialogOpen} onClose={() => setSnippetsDialogOpen(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Code Snippets Library</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, py: 1 }}>
            {getSnippetsByCategory().map((category) => (
              <Box key={category.key}>
                <Typography variant="h6" sx={{ mb: 2, color: "var(--qt-accent)", fontWeight: 600 }}>
                  {category.label}
                </Typography>
                <Box sx={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 2 }}>
                  {category.snippets.map((snippet) => (
                    <Card
                      key={snippet.id}
                      sx={{
                        background: "var(--qt-surface)",
                        border: "1px solid var(--qt-border)",
                        cursor: "pointer",
                        transition: "all 0.2s",
                        "&:hover": {
                          transform: "translateY(-2px)",
                          boxShadow: 3,
                        },
                      }}
                      onClick={() => insertSnippet(snippet)}
                    >
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {snippet.name}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "var(--qt-text-dim)", fontSize: "0.85rem" }}>
                          {snippet.description}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSnippetsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
