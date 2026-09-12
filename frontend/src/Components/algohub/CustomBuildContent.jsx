import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Card,
  CardContent,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import FolderOpenIcon from "@mui/icons-material/FolderOpen";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DeleteIcon from "@mui/icons-material/Delete";
import FileCopyIcon from "@mui/icons-material/FileCopy";
import CodeIcon from "@mui/icons-material/Code";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import HistoryIcon from "@mui/icons-material/History";
import GetAppIcon from "@mui/icons-material/GetApp";
import ExtensionIcon from "@mui/icons-material/Extension";
import { getSnippetsByCategory } from "../../data/codeSnippets";
import ExecutionResultsModal from "../ExecutionResultsModal";
import CustomBuildGuidePanel from "./CustomBuildGuidePanel";
import CustomBuildCodeEditorPage from "./CustomBuildCodeEditorPage";
import "./algohub-debug.css";

const STORAGE_KEY = "algohub_custom_circuits";
const AUTOSAVE_KEY = "algohub_autosave";

export default function CustomBuildContent({ onBack }) {
  const [selectedFramework, setSelectedFramework] = useState("qiskit");
  const [circuitName, setCircuitName] = useState("Untitled Circuit");
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [executing, setExecuting] = useState(false);
  const [error, setError] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);
  const [saveStatus, setSaveStatus] = useState(""); // "saved", "unsaved", "saving"
  const [lastSaved, setLastSaved] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);

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
      if (code && code.trim().length > 0) {
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
        if (!executing && showCodeEditor) {
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
  }, [code, executing, showCodeEditor]);

  // Monaco editor error decorations
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current || !errorAnalysis?.line_number) return;

    const editor = editorRef.current;
    const monaco = monacoRef.current;
    const lineNumber = errorAnalysis.line_number;

    const decorations = editor.deltaDecorations([], [
      {
        range: new monaco.Range(lineNumber, 1, lineNumber, 1),
        options: {
          isWholeLine: true,
          className: "error-line-decoration",
          glyphMarginClassName: "error-glyph-decoration",
          glyphMarginHoverMessage: { value: errorAnalysis.title || "Error on this line" },
          hoverMessage: { value: errorAnalysis.suggestion || errorAnalysis.description },
        },
      },
    ]);

    editor.revealLineInCenter(lineNumber);

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
        if (autoSaveAge < 3600000 && data.code) {
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
        framework: selectedFramework,
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
        framework: selectedFramework,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const existingIndex = circuits.findIndex((c) => c.name === tempCircuitName);
      if (existingIndex >= 0) {
        circuits[existingIndex] = {
          ...circuits[existingIndex],
          code,
          framework: selectedFramework,
          updatedAt: newCircuit.updatedAt,
        };
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
    setCode(circuit.code || "");
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
    setCode("");
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
        if (file.name.endsWith(".json")) {
          const data = JSON.parse(content);
          setCode(data.code || content);
          setCircuitName(data.name || file.name.replace(".json", ""));
          if (data.visualization) {
            setVisualizationData(data.visualization);
          }
        } else {
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
    event.target.value = "";
  };

  const handleDuplicateCircuit = (circuit, e) => {
    e.stopPropagation();
    setCode(circuit.code);
    setCircuitName(`${circuit.name} (Copy)`);
    setSaveStatus("unsaved");
    setLoadDialogOpen(false);
  };

  const saveVersion = () => {
    const version = {
      id: Date.now().toString(),
      code,
      timestamp: new Date().toISOString(),
      label: `Version ${versionHistory.length + 1}`,
    };
    const newHistory = [version, ...versionHistory].slice(0, 10);
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

    saveVersion();

    try {
      const response = await fetch("http://127.0.0.1:8000/algohub/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, framework: selectedFramework }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const stdoutText = typeof data.stdout === "string" ? data.stdout : "";
        setOutput((prev) => prev + "\n" + stdoutText);

        const hasBlochVectors = Array.isArray(data.bloch_vectors) && data.bloch_vectors.length > 0;
        const hasOpenQasm = data.openqasm && typeof data.openqasm === "string";
        const hasCounts = data.counts && typeof data.counts === "object";

        if (hasBlochVectors || hasOpenQasm || hasCounts) {
          setVisualizationData({
            bloch_vectors: hasBlochVectors ? data.bloch_vectors : null,
            openqasm: hasOpenQasm ? data.openqasm : null,
            counts: hasCounts ? data.counts : null,
            probabilities: data.probabilities || null,
          });
        }

        const simResult = {
          openqasm: hasOpenQasm ? data.openqasm : null,
          bloch_vectors: hasBlochVectors ? data.bloch_vectors : [],
          density_matrices: data.density_matrices || [],
          probabilities: data.probabilities || null,
          counts: hasCounts ? data.counts : null,
          amplitudes: data.amplitudes || null,
          num_qubits: data.num_qubits || (hasBlochVectors ? data.bloch_vectors.length : 2),
          shots: data.shots || 1024,
          stdout: stdoutText,
        };
        setExecutionResult(simResult);
        setModalOpen(true);

        if (data.circuit_profile) {
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

        if (data.error_analysis) {
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

  const handleAnalyzeCode = async () => {
    if (!code.trim() || analyzing) return;

    setAnalyzing(true);
    try {
      const response = await fetch("http://127.0.0.1:8000/algohub/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, framework: selectedFramework }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
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

  // If user clicked "Code", display dedicated CustomBuildCodeEditorPage
  if (showCodeEditor) {
    return (
      <>
        <CustomBuildCodeEditorPage
          circuitName={circuitName}
          setCircuitName={(name) => {
            setCircuitName(name);
            setSaveStatus("unsaved");
          }}
          saveStatus={saveStatus}
          getSaveStatusText={getSaveStatusText}
          selectedFramework={selectedFramework}
          onSelectFramework={setSelectedFramework}
          code={code}
          handleCodeChange={handleCodeChange}
          editorRef={editorRef}
          monacoRef={monacoRef}
          executing={executing}
          handleExecute={handleExecute}
          analyzing={analyzing}
          handleAnalyzeCode={handleAnalyzeCode}
          output={output}
          error={error}
          setError={setError}
          visualizationData={visualizationData}
          executionResult={executionResult}
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
          errorAnalysis={errorAnalysis}
          codeIssues={codeIssues}
          circuitProfile={circuitProfile}
          onBack={() => setShowCodeEditor(false)}
          onSaveClick={handleSaveClick}
          onSnippetsClick={() => setSnippetsDialogOpen(true)}
          onExportClick={() => setExportDialogOpen(true)}
          onHistoryClick={() => setHistoryDialogOpen(true)}
        />

        {/* Dialogs rendered so they remain accessible while in Code Editor */}
        {renderDialogs()}
      </>
    );
  }

  // Otherwise, render Guide/Info Page with "Code" button
  function renderDialogs() {
    return (
      <>
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
                  <ListItemText primary="Python Script (.py)" secondary="Export as standalone Python file" />
                </ListItemButton>
              </ListItem>
              <ListItem disablePadding>
                <ListItemButton onClick={handleExportQASM} disabled={!visualizationData?.openqasm}>
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
                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                      gap: 2,
                    }}
                  >
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

        {/* Results Modal */}
        <ExecutionResultsModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          result={executionResult}
        />
      </>
    );
  }

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* Top Header / Nav */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1, minWidth: 260 }}>
          <IconButton
            onClick={onBack}
            title="Back to AlgoHub"
            sx={{
              background: "var(--qt-surface)",
              border: "1px solid var(--qt-border)",
              color: "var(--qt-text)",
              "&:hover": { background: "var(--qt-surface-glass)" },
            }}
          >
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
                  fontSize: "1.4rem",
                  fontWeight: 600,
                  color: "var(--qt-text)",
                },
              }}
            />
            <Typography variant="caption" sx={{ color: "var(--qt-text-dim)", display: "block", mt: 0.5 }}>
              {getSaveStatusText()}
            </Typography>
          </Box>
        </Box>

        {/* Toolbar buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
          <Tooltip title="New Circuit">
            <Button
              variant="outlined"
              startIcon={<CodeIcon />}
              onClick={handleNewCircuit}
              sx={{ textTransform: "none", borderColor: "var(--qt-border)", color: "var(--qt-text)" }}
            >
              New
            </Button>
          </Tooltip>

          <Tooltip title="Save Circuit">
            <Button
              variant="outlined"
              startIcon={<SaveIcon />}
              onClick={handleSaveClick}
              sx={{ textTransform: "none", borderColor: "var(--qt-border)", color: "var(--qt-text)" }}
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
              sx={{ textTransform: "none", borderColor: "var(--qt-border)", color: "var(--qt-text)" }}
            >
              Load
            </Button>
          </Tooltip>

          <Tooltip title="Import File">
            <Button
              variant="outlined"
              component="label"
              startIcon={<UploadFileIcon />}
              sx={{ textTransform: "none", borderColor: "var(--qt-border)", color: "var(--qt-text)" }}
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
              sx={{ textTransform: "none", borderColor: "var(--qt-border)", color: "var(--qt-text)" }}
            >
              Export
            </Button>
          </Tooltip>

          <Tooltip title="Code Snippets">
            <Button
              variant="outlined"
              startIcon={<ExtensionIcon />}
              onClick={() => setSnippetsDialogOpen(true)}
              sx={{ textTransform: "none", borderColor: "var(--qt-border)", color: "var(--qt-text)" }}
            >
              Snippets
            </Button>
          </Tooltip>

          <Tooltip title="Version History">
            <IconButton onClick={() => setHistoryDialogOpen(true)} sx={{ color: "var(--qt-text)" }}>
              <HistoryIcon />
            </IconButton>
          </Tooltip>

          {/* Prominent Code Button */}
          <Button
            variant="contained"
            startIcon={<CodeIcon />}
            onClick={() => setShowCodeEditor(true)}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontWeight: 700,
              fontSize: "0.95rem",
              px: 3,
              py: 1,
              boxShadow: "0 4px 18px rgba(102, 126, 234, 0.4)",
              transition: "all 0.2s ease",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6b3f8f 100%)",
                boxShadow: "0 6px 24px rgba(102, 126, 234, 0.6)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Code
          </Button>
        </Box>
      </Box>

      {/* Main Content - Guide Panel */}
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
        <CustomBuildGuidePanel />
      </Box>

      {/* Dialogs */}
      {renderDialogs()}
    </Box>
  );
}
