import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BugReportIcon from "@mui/icons-material/BugReport";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import { algorithmTemplates, getDifficultyLevel } from "../../data/algorithmTemplates";
import Editor from "@monaco-editor/react";
import AdvancedBlochViewer from "../AdvancedBlochViewer";
import VisualCircuitRenderer from "../circuit/VisualCircuitRenderer";

export default function AlgoWorkspaceContent({ algoId, onBack }) {
  const [algorithm, setAlgorithm] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [executing, setExecuting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);

  useEffect(() => {
    const algo = algorithmTemplates.find((a) => a.id === algoId);
    if (algo) {
      setAlgorithm(algo);
      setCode(algo.code);
      setOutput("");
      setError(null);
      setVisualizationData(null);
    } else {
      setError("Algorithm not found");
    }
  }, [algoId]);

  const handleTestCode = async () => {
    setTesting(true);
    setError(null);
    setOutput("Running syntax checks...\n");

    await new Promise((resolve) => setTimeout(resolve, 500));

    if (code.includes("import os") || code.includes("import sys")) {
      setOutput(
        "❌ Security Error: Dangerous imports detected (os, sys not allowed)\n"
      );
      setTesting(false);
      return;
    }

    setOutput("✅ Code passed basic validation checks\n");
    setTesting(false);
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

      const data = await response.json();
      
      // Debug logging
      console.log("[AlgoHub] API Response:", data);
      console.log("[AlgoHub] bloch_vectors:", data.bloch_vectors);
      console.log("[AlgoHub] openqasm:", data.openqasm ? "present" : "missing");
      console.log("[AlgoHub] counts:", data.counts);

      if (response.ok && data.success) {
        const stdoutText = typeof data.stdout === "string" ? data.stdout : "";
        setOutput((prev) => prev + "\n" + stdoutText);

        // Wire real data from backend
        const hasBlochVectors = Array.isArray(data.bloch_vectors) && data.bloch_vectors.length > 0;
        const hasOpenQasm = data.openqasm && typeof data.openqasm === "string";
        const hasCounts = data.counts && typeof data.counts === "object";
        
        if (hasBlochVectors || hasOpenQasm || hasCounts) {
          console.log("[AlgoHub] Setting visualization data:", {
            bloch_vectors: data.bloch_vectors,
            bloch_vectors_valid: hasBlochVectors,
            openqasm: hasOpenQasm ? "present" : "missing",
            counts: data.counts
          });
          setVisualizationData({
            bloch_vectors: hasBlochVectors ? data.bloch_vectors : null,
            openqasm: hasOpenQasm ? data.openqasm : null,
            counts: hasCounts ? data.counts : null,
            probabilities: data.probabilities || null,
          });
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
      }
    } catch (err) {
      setError("Failed to connect to backend");
      setOutput((prev) => prev + "\n❌ Connection Error: " + err.message);
    } finally {
      setExecuting(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setOutput((prev) => prev + "\n📋 Code copied to clipboard!\n");
  };

  if (!algorithm) {
    return (
      <Box sx={{ textAlign: "center", py: 8 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2, color: "var(--qt-text-dim)" }}>
          {error || "Loading algorithm..."}
        </Typography>
      </Box>
    );
  }

  const difficultyInfo = getDifficultyLevel(algorithm.difficulty);

  return (
    <Box sx={{ width: "100%", pb: 3 }}>
      {/* Header */}
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
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={onBack}
            sx={{
              background: "var(--qt-surface)",
              border: "1px solid var(--qt-border)",
              "&:hover": { background: "var(--qt-surface-glass)" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "var(--qt-text)", mb: 0.5 }}
            >
              {algorithm.name}
            </Typography>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                label={difficultyInfo.label}
                size="small"
                sx={{
                  backgroundColor: difficultyInfo.color,
                  color: "white",
                  fontWeight: 600,
                }}
              />
              <Chip
                label={algorithm.category}
                size="small"
                variant="outlined"
                sx={{ borderColor: "var(--qt-border)" }}
              />
            </Box>
          </Box>
        </Box>

        <Box sx={{ display: "flex", gap: 1 }}>
          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={handleCopyCode}
            sx={{
              borderColor: "var(--qt-border)",
              color: "var(--qt-text)",
              "&:hover": { borderColor: "var(--qt-primary)" },
            }}
          >
            Copy
          </Button>
          <Button
            variant="outlined"
            startIcon={<BugReportIcon />}
            onClick={handleTestCode}
            disabled={testing}
            sx={{
              borderColor: "var(--qt-border)",
              color: "var(--qt-text)",
              "&:hover": { borderColor: "#FFA726" },
            }}
          >
            {testing ? "Testing..." : "Test Code"}
          </Button>
          <Button
            variant="contained"
            startIcon={executing ? <CircularProgress size={16} /> : <PlayArrowIcon />}
            onClick={handleExecute}
            disabled={executing}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontWeight: 600,
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6b3f8f 100%)",
              },
            }}
          >
            {executing ? "Running..." : "Execute"}
          </Button>
        </Box>
      </Box>

      {/* Main Content - Split Layout */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.05fr 1fr" },
          gap: 3,
          alignItems: "start",
        }}
      >
        {/* Left Panel - Code Editor + Output */}
        <Box
          sx={{
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Monaco Editor */}
          <Paper
            sx={{
              background: "var(--qt-surface)",
              border: "1px solid var(--qt-border)",
              borderRadius: 2,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: { xs: 360, sm: 400, md: 460, xl: 520 },
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
                Python Code
              </Typography>
              <Chip label="Read-Only (Phase 1)" size="small" sx={{ fontSize: "0.7rem" }} />
            </Box>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <Editor
                height="100%"
                defaultLanguage="python"
                value={code}
                onChange={(value) => {
                  if (typeof value === "string") {
                    setCode(value);
                  }
                }}
                theme="vs-dark"
                options={{
                  readOnly: true,
                  minimap: { enabled: false },
                  fontSize: 13,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                }}
              />
            </Box>
          </Paper>

          {/* Output Console */}
          <Paper
            sx={{
              background: "#1e1e1e",
              border: "1px solid var(--qt-border)",
              borderRadius: 2,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: { xs: 200, sm: 220, md: 260 },
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
              {output || "No output yet. Click 'Execute' to run the code."}
            </Box>
          </Paper>
        </Box>

        {/* Right Panel - Visualizations + Guidance */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: 2,
          }}
        >
          {/* Bloch Spheres */}
          <Card
            sx={{
              background: "var(--qt-surface-glass, var(--qt-surface))",
              border: "1px solid var(--qt-border)",
              borderRadius: 2,
              minHeight: 280,
            }}
          >
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2, height: "100%" }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--qt-text)" }}>
                Bloch Sphere Visualization
              </Typography>
              <Box sx={{ flex: 1, minHeight: 400, position: "relative" }}>
                {(() => {
                  const hasValidVectors = Array.isArray(visualizationData?.bloch_vectors) && visualizationData.bloch_vectors.length > 0;
                  console.log("[AlgoHub Render] visualizationData:", visualizationData);
                  console.log("[AlgoHub Render] bloch_vectors:", visualizationData?.bloch_vectors);
                  console.log("[AlgoHub Render] hasValidVectors:", hasValidVectors);
                  
                  if (hasValidVectors) {
                    console.log("[AlgoHub Render] ✅ Rendering Bloch spheres with vectors:", visualizationData.bloch_vectors);
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
                    console.log("[AlgoHub Render] ❌ No valid Bloch vectors, showing placeholder");
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
                        Run the algorithm to inspect qubit orientations.
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
                    Execute the code to view the circuit rendering.
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          {/* Measurement Counts */}
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

          {/* About This Algorithm */}
          <Card
            sx={{
              background: "var(--qt-surface-glass, var(--qt-surface))",
              border: "1px solid var(--qt-border)",
              borderRadius: 2,
              mt: 1,
            }}
          >
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="h6" sx={{ fontWeight: 600, color: "var(--qt-text)" }}>
                About This Algorithm
              </Typography>
              <Typography variant="body2" sx={{ color: "var(--qt-text-dim)", lineHeight: 1.7 }}>
                {algorithm.description}
              </Typography>

              <Divider sx={{ borderColor: "var(--qt-border)" }} />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: "var(--qt-text)" }}>
                  Learning Goals
                </Typography>
                <Box component="ul" sx={{ m: 0, pl: 2.5, color: "var(--qt-text-dim)" }}>
                  {algorithm.learningGoals.map((goal, idx) => (
                    <Typography component="li" key={idx} variant="body2" sx={{ mb: 0.5, lineHeight: 1.6 }}>
                      {goal}
                    </Typography>
                  ))}
                </Box>
              </Box>

              <Divider sx={{ borderColor: "var(--qt-border)" }} />

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5, color: "var(--qt-text)" }}>
                  Expected Output
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--qt-text-dim)", lineHeight: 1.6 }}>
                  {algorithm.expectedOutput}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );
}
