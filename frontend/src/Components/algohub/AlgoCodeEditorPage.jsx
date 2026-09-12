import React from "react";
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
  Card,
  CardContent,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import BugReportIcon from "@mui/icons-material/BugReport";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import VisibilityIcon from "@mui/icons-material/Visibility";
import Editor from "@monaco-editor/react";
import VisualCircuitRenderer from "../circuit/VisualCircuitRenderer";
import DebugPanel from "./DebugPanel";
import OptimizationPanel from "./OptimizationPanel";
import FrameworkSelector from "./FrameworkSelector";
import ExecutionResultsModal from "../ExecutionResultsModal";

export default function AlgoCodeEditorPage({
  algorithm,
  selectedFramework = "qiskit",
  onSelectFramework,
  code,
  setCode,
  output,
  executing,
  testing,
  error,
  setError,
  visualizationData,
  executionResult,
  modalOpen,
  setModalOpen,
  onBack,
  onExecute,
  onTestCode,
  onCopyCode,
  analyzing,
  onAnalyzeCode,
  errorAnalysis,
  codeIssues,
  circuitProfile,
  editorRef,
  monacoRef,
}) {
  // Monaco language: OpenQASM uses plaintext; all Python frameworks use "python"
  const editorLanguage = selectedFramework === "openqasm" ? "plaintext" : "python";

  return (
    <Box sx={{ width: "100%", pb: 3 }}>
      {/* Top Navigation Bar */}
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
            title="Back to Algorithm Info"
            sx={{
              background: "var(--qt-surface)",
              border: "1px solid var(--qt-border)",
              color: "var(--qt-text)",
              "&:hover": { background: "var(--qt-surface-glass)" },
            }}
          >
            <ArrowBackIcon />
          </IconButton>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "var(--qt-text)", mb: 0.5 }}
              >
                {algorithm?.name || "Algorithm"}
              </Typography>
              <Chip
                label="Code Implementation"
                size="small"
                sx={{
                  background: "rgba(102, 126, 234, 0.15)",
                  color: "#667eea",
                  border: "1px solid rgba(102, 126, 234, 0.3)",
                  fontWeight: 600,
                  fontSize: "0.75rem",
                }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: "var(--qt-text-dim)" }}>
              Inspect and execute the quantum implementation
            </Typography>
          </Box>
        </Box>

        {/* Action Controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          {onSelectFramework && (
            <FrameworkSelector
              selectedFramework={selectedFramework}
              onSelectFramework={onSelectFramework}
            />
          )}

          <Button
            variant="outlined"
            startIcon={<ContentCopyIcon />}
            onClick={onCopyCode}
            sx={{
              borderColor: "var(--qt-border)",
              color: "var(--qt-text)",
              textTransform: "none",
              "&:hover": { borderColor: "var(--qt-primary)" },
            }}
          >
            Copy
          </Button>

          {onAnalyzeCode && (
            <Tooltip title="Analyze code for potential issues">
              <Button
                variant="outlined"
                startIcon={analyzing ? <CircularProgress size={16} /> : <BugReportIcon />}
                onClick={onAnalyzeCode}
                disabled={analyzing || !code.trim()}
                sx={{
                  textTransform: "none",
                  borderColor: "#ffa726",
                  color: "#ffa726",
                  "&:hover": {
                    borderColor: "#ff9800",
                    bgcolor: "rgba(255, 167, 38, 0.1)",
                  },
                }}
              >
                {analyzing ? "Analyzing..." : "Analyze"}
              </Button>
            </Tooltip>
          )}

          <Button
            variant="contained"
            startIcon={executing ? <CircularProgress size={16} color="inherit" /> : <PlayArrowIcon />}
            onClick={onExecute}
            disabled={executing}
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontWeight: 600,
              textTransform: "none",
              px: 3,
              boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6b3f8f 100%)",
                boxShadow: "0 6px 20px rgba(102, 126, 234, 0.6)",
              },
            }}
          >
            {executing ? "Running..." : "Execute"}
          </Button>

          {executionResult && (
            <Button
              variant="outlined"
              startIcon={<VisibilityIcon />}
              onClick={() => setModalOpen(true)}
              sx={{
                borderColor: "var(--qt-accent, #4cc3fa)",
                color: "var(--qt-accent, #4cc3fa)",
                fontWeight: 600,
                textTransform: "none",
                "&:hover": {
                  borderColor: "var(--qt-accent, #4cc3fa)",
                  background: "rgba(76, 195, 250, 0.1)",
                },
              }}
            >
              Results Modal
            </Button>
          )}
        </Box>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError && setError(null)} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Main Workspace Layout - 2 Columns (same as Custom Builder) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" },
          gap: 2.5,
          alignItems: "start",
        }}
      >
        {/* Left Column: Monaco Editor + Console */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, minWidth: 0 }}>
          {/* Code Editor */}
          <Paper
            sx={{
              background: "#1e1e1e",
              border: "1px solid var(--qt-border)",
              borderRadius: 2.5,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              height: { xs: 450, sm: 500, md: 550, xl: 600 },
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.2,
                borderBottom: "1px solid var(--qt-border)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                background: "#161922",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "var(--qt-text)" }}>
                Quantum Code Editor ({selectedFramework.toUpperCase()})
              </Typography>
              <Chip
                label="Ready to Code"
                size="small"
                color="success"
                sx={{
                  fontSize: "0.7rem",
                  fontWeight: 600,
                }}
              />
            </Box>
            <Box sx={{ flex: 1, minHeight: 0 }}>
              <Editor
                height="100%"
                language={editorLanguage}
                value={code}
                onChange={(value) => {
                  if (typeof value === "string") {
                    setCode(value);
                  }
                }}
                onMount={(editor, monaco) => {
                  if (editorRef) editorRef.current = editor;
                  if (monacoRef) monacoRef.current = monaco;
                }}
                theme="vs-dark"
                options={{
                  readOnly: false,
                  minimap: { enabled: false },
                  fontSize: 13.5,
                  lineNumbers: "on",
                  scrollBeyondLastLine: false,
                  automaticLayout: true,
                  tabSize: 4,
                  wordWrap: "on",
                }}
              />
            </Box>
          </Paper>

          {/* Console Output */}
          <Paper
            sx={{
              background: "#1e1e1e",
              border: "1px solid var(--qt-border)",
              borderRadius: 2.5,
              overflow: "hidden",
              display: "flex",
              flexDirection: "column",
              minHeight: { xs: 180, sm: 200, md: 220 },
              boxShadow: "0 4px 20px rgba(0,0,0,0.06)",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1.2,
                borderBottom: "1px solid #333",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: "#d4d4d4" }}>
                Console Output
              </Typography>
              {executionResult && (
                <Chip
                  label="Results Ready"
                  size="small"
                  onClick={() => setModalOpen(true)}
                  sx={{
                    cursor: "pointer",
                    fontSize: "0.7rem",
                    backgroundColor: "rgba(76, 195, 250, 0.15)",
                    color: "var(--qt-accent, #4cc3fa)",
                    border: "1px solid rgba(76, 195, 250, 0.3)",
                    "&:hover": { background: "rgba(76, 195, 250, 0.25)" },
                  }}
                />
              )}
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
              {output || "No output yet. Click 'Execute' to run the quantum circuit."}
            </Box>
          </Paper>
        </Box>

        {/* Right Column: Visualizations & Analysis */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, minWidth: 0 }}>
          {/* Circuit Diagram */}
          <Card
            sx={{
              background: "var(--qt-surface-glass, var(--qt-surface))",
              border: "1px solid var(--qt-border)",
              borderRadius: 2.5,
            }}
          >
            <CardContent sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 2.5 }}>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "var(--qt-text)" }}>
                  Circuit Diagram
                </Typography>
                {executionResult && (
                  <Button
                    size="small"
                    startIcon={<VisibilityIcon />}
                    onClick={() => setModalOpen(true)}
                    sx={{ color: "var(--qt-accent, #4cc3fa)", textTransform: "none", fontSize: "0.75rem" }}
                  >
                    Open 3D Viewer
                  </Button>
                )}
              </Box>
              <Box
                sx={{
                  background: "var(--qt-bg-main, var(--qt-surface))",
                  borderRadius: 1.5,
                  border: "1px solid var(--qt-border)",
                  p: 2,
                  minHeight: 220,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflowX: "auto",
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
                borderRadius: 2.5,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: "var(--qt-text)" }}>
                  Measurement Distribution
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
                          height: 20,
                          background: "linear-gradient(90deg, #667eea, #764ba2)",
                          borderRadius: 1,
                          width: `${Math.min((count / 1024) * 100, 100)}%`,
                        }}
                      />
                      <Typography variant="body2" sx={{ color: "var(--qt-text-dim)", minWidth: 50, fontSize: "0.85rem" }}>
                        {count} shots
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
                borderRadius: 2.5,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1.5, color: "var(--qt-text)" }}>
                  Circuit Statistics
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
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

      {/* Execution Results Modal with 3D Bloch Spheres, Inspector & Debugger */}
      <ExecutionResultsModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        result={executionResult}
      />
    </Box>
  );
}
