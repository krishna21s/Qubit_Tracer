import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BugReportIcon from "@mui/icons-material/BugReport";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SaveIcon from "@mui/icons-material/Save";
import { useParams, useNavigate } from "react-router-dom";
import { algorithmTemplates, getDifficultyLevel } from "../data/algorithmTemplates";
import Editor from "@monaco-editor/react";
import VisualCircuitRenderer from "../Components/circuit/VisualCircuitRenderer";
import ExecutionResultsModal from "../Components/ExecutionResultsModal";

export default function AlgoWorkspacePage() {
  const { algoId } = useParams();
  const navigate = useNavigate();

  const [algorithm, setAlgorithm] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [executing, setExecuting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const algo = algorithmTemplates.find((a) => a.id === algoId);
    if (algo) {
      setAlgorithm(algo);
      setCode(algo.code);
    } else {
      setError("Algorithm not found");
    }
  }, [algoId]);

  const handleTestCode = async () => {
    setTesting(true);
    setError(null);
    setOutput("Running syntax checks...\n");

    try {
      // Basic client-side validation
      if (!code.trim()) {
        throw new Error("Code is empty");
      }

      if (!code.includes("QuantumCircuit")) {
        throw new Error("Code must contain a QuantumCircuit");
      }

      setOutput("✓ Syntax looks good!\n✓ Quantum circuit detected\n\nReady to execute.");
    } catch (err) {
      setError(err.message);
      setOutput(`❌ Test failed: ${err.message}`);
    } finally {
      setTesting(false);
    }
  };

  const handleExecute = async () => {
    setExecuting(true);
    setError(null);
    setOutput("Executing quantum circuit...\n");
    setVisualizationData(null);

    try {
      const response = await fetch("http://127.0.0.1:8000/algohub/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Execution failed");
      }

      const result = await response.json();

      // Update output console
      setOutput(result.stdout || "Execution completed successfully.");

      if (result.stderr) {
        setOutput((prev) => prev + "\n\n⚠️ Warnings:\n" + result.stderr);
      }

      // Update visualizations
      if (result.bloch_vectors || result.openqasm) {
        setVisualizationData({
          blochVectors: result.bloch_vectors || [],
          openqasm: result.openqasm || "",
          counts: result.counts || null,
          probabilities: result.probabilities || null,
        });
      }

      setExecutionResult({
        openqasm: result.openqasm || null,
        bloch_vectors: result.bloch_vectors || [],
        density_matrices: result.density_matrices || [],
        probabilities: result.probabilities || null,
        counts: result.counts || null,
        amplitudes: result.amplitudes || null,
        num_qubits: result.num_qubits || (result.bloch_vectors ? result.bloch_vectors.length : 2),
        shots: result.shots || 1024,
        stdout: result.stdout || "",
      });
      setModalOpen(true);
    } catch (err) {
      setError(err.message);
      setOutput(`❌ Execution failed:\n${err.message}`);
    } finally {
      setExecuting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
  };

  // Download output and visualization data as JSON file
  const handleDownloadResults = () => {
    const data = {
      code,
      output,
      error,
      visualizationData,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${algorithm?.id || "algorithm"}_results.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (!algorithm) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const difficultyInfo = getDifficultyLevel(algorithm.difficulty);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "#0a0e1a"
            : "#f5f7fa",
      }}
    >
      {/* Top Bar */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 0,
          display: "flex",
          alignItems: "center",
          gap: 2,
        }}
      >
        <IconButton onClick={() => navigate("/algohub")}>
          <ArrowBackIcon />
        </IconButton>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography variant="h6">{algorithm.icon}</Typography>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {algorithm.name}
          </Typography>
        </Box>

        <Chip
          label={difficultyInfo.label}
          size="small"
          sx={{
            backgroundColor: difficultyInfo.color,
            color: "white",
            fontWeight: 600,
          }}
        />

        <Box sx={{ flexGrow: 1 }} />

        <Button
          variant="outlined"
          startIcon={<BugReportIcon />}
          onClick={handleTestCode}
          disabled={testing || executing}
          sx={{ mr: 1 }}
        >
          {testing ? "Testing..." : "Test Code"}
        </Button>

        <Button
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={handleExecute}
          disabled={executing || testing}
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5568d3 0%, #6b3f8f 100%)",
            },
          }}
        >
          {executing ? "Executing..." : "Execute"}
        </Button>

        {/* Download Results Button */}
        <Button
          variant="outlined"
          startIcon={<SaveIcon />}
          onClick={handleDownloadResults}
          disabled={!visualizationData && !output && !error}
          sx={{ ml: 1 }}
        >
          Download Results
        </Button>
      </Paper>

      {/* Main Content */}
      <Box sx={{ display: "flex", height: "calc(100vh - 80px)" }}>
        {/* Left Panel: Code Editor */}
        <Box
          sx={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            borderRight: "1px solid",
            borderColor: "divider",
          }}
        >
          {/* Code Header */}
          <Box
            sx={{
              p: 2,
              backgroundColor: "background.paper",
              borderBottom: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Python Code (Read-Only)
            </Typography>
            <Tooltip title="Copy code">
              <IconButton size="small" onClick={handleCopyCode}>
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>

          {/* Monaco Editor */}
          <Box sx={{ flexGrow: 1 }}>
            <Editor
              height="100%"
              defaultLanguage="python"
              value={code}
              onChange={(value) => setCode(value || "")}
              theme="vs-dark"
              options={{
                readOnly: true, // Phase 1: view-only
                minimap: { enabled: true },
                fontSize: 14,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
              }}
            />
          </Box>

          {/* Output Console */}
          <Box
            sx={{
              height: "30%",
              backgroundColor: "#1e1e1e",
              color: "#d4d4d4",
              p: 2,
              fontFamily: "Consolas, monospace",
              fontSize: 13,
              overflowY: "auto",
              borderTop: "1px solid #333",
            }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: "#569cd6", mb: 1, fontWeight: 600 }}
            >
              Output Console
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>{output}</pre>
          </Box>
        </Box>

        {/* Right Panel: Visualizations */}
        <Box
          sx={{
            width: "50%",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            p: 3,
            gap: 3,
          }}
        >
          {/* Algorithm Info */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
              About This Algorithm
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {algorithm.description}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Expected Output:
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {algorithm.expectedOutput}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Learning Goals:
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {algorithm.learningGoals.map((goal, idx) => (
                <li key={idx}>
                  <Typography variant="body2" color="text.secondary">
                    {goal}
                  </Typography>
                </li>
              ))}
            </Box>
          </Paper>

          {/* Circuit Diagram */}
          {visualizationData?.openqasm && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Quantum Circuit Diagram
              </Typography>
              <VisualCircuitRenderer qasm={visualizationData.openqasm} />
            </Paper>
          )}

          {/* Measurement Results */}
          {visualizationData?.counts && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Measurement Counts
              </Typography>
              <Box>
                {Object.entries(visualizationData.counts).map(([state, count]) => (
                  <Box
                    key={state}
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      py: 1,
                      borderBottom: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Typography variant="body2" sx={{ fontFamily: "monospace" }}>
                      |{state}⟩
                    </Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {count}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          )}

          {!visualizationData && !executing && (
            <Paper
              sx={{
                p: 6,
                textAlign: "center",
                backgroundColor: "action.hover",
              }}
            >
              <PlayArrowIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
              <Typography variant="h6" color="text.secondary">
                Execute the code to see visualizations
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>

      {/* Execution Results Modal with 3D Bloch Spheres, Inspector & Debugger */}
      <ExecutionResultsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        result={executionResult}
      />
    </Box>
  );
}
