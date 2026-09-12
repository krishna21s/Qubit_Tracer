import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Chip,
  IconButton,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CodeIcon from "@mui/icons-material/Code";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import ArticleIcon from "@mui/icons-material/Article";
import { algorithmTemplates, getDifficultyLevel } from "../../data/algorithmTemplates";
import { getAlgorithmFrameworkCode } from "../../data/algoFrameworkTemplates";
import AlgoConceptPanel from "./AlgoConceptPanel";
import AlgoCodeEditorPage from "./AlgoCodeEditorPage";
import AlgoVideoPage from "./AlgoVideoPage";
import AlgoPapersPage from "./AlgoPapersPage";

/**
 * Returns the correct starter code for an algorithm + framework combination.
 * Falls back to the Qiskit (default) code if no framework-specific version exists.
 */
const getCodeForFramework = (algo, frameworkId) => {
  if (!algo) return "";
  if (!frameworkId || frameworkId === "qiskit") return algo.code;
  const frameworkCode = getAlgorithmFrameworkCode(algo.id, frameworkId);
  return frameworkCode || algo.code; // graceful fallback to Qiskit
};

export default function AlgoWorkspaceContent({ algoId, onBack }) {
  const [selectedFramework, setSelectedFramework] = useState("qiskit");
  const [algorithm, setAlgorithm] = useState(null);
  const [code, setCode] = useState("");
  const [output, setOutput] = useState("");
  const [executing, setExecuting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState(null);
  const [visualizationData, setVisualizationData] = useState(null);
  const [executionResult, setExecutionResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [showVideoPage, setShowVideoPage] = useState(false);
  const [showPapersPage, setShowPapersPage] = useState(false);

  // Debug panel state (same as CustomBuildContent)
  const [errorAnalysis, setErrorAnalysis] = useState(null);
  const [codeIssues, setCodeIssues] = useState([]);
  const [circuitProfile, setCircuitProfile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Monaco editor refs
  const editorRef = useRef(null);
  const monacoRef = useRef(null);

  useEffect(() => {
    const algo = algorithmTemplates.find((a) => a.id === algoId);
    if (algo) {
      setAlgorithm(algo);
      // Load the template code for the currently selected framework
      setCode(getCodeForFramework(algo, selectedFramework));
      setOutput("");
      setError(null);
      setVisualizationData(null);
      setExecutionResult(null);
      setShowCodeEditor(false);
      setShowVideoPage(false);
      setShowPapersPage(false);
    } else {
      setError("Algorithm not found");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algoId]);

  // Monaco editor error decorations (same as CustomBuildContent)
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
    setErrorAnalysis(null);
    setCircuitProfile(null);

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

        // Build execution result for the full 3-feature modal (Bloch Sphere, Inspector, Debugger)
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
      console.error("[AlgoWorkspace] Code analysis failed:", err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setOutput((prev) => prev + "\n📋 Code copied to clipboard!\n");
  };

  /**
   * Switches to a new framework AND loads the corresponding algorithm template.
   * Resets output/error so the user starts fresh with the new framework code.
   */
  const handleSelectFramework = (frameworkId) => {
    setSelectedFramework(frameworkId);
    if (algorithm) {
      setCode(getCodeForFramework(algorithm, frameworkId));
      setOutput("");
      setError(null);
      setVisualizationData(null);
      setExecutionResult(null);
    }
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

  // If user navigated to video tutorial page:
  if (showVideoPage) {
    return (
      <AlgoVideoPage
        algorithm={algorithm}
        algoId={algoId}
        onBack={() => setShowVideoPage(false)}
      />
    );
  }

  // If user navigated to research papers page:
  if (showPapersPage) {
    return (
      <AlgoPapersPage
        algorithm={algorithm}
        algoId={algoId}
        onBack={() => setShowPapersPage(false)}
      />
    );
  }

  // If user navigated to code editor page:
  if (showCodeEditor) {
    return (
      <AlgoCodeEditorPage
        algorithm={algorithm}
        selectedFramework={selectedFramework}
        onSelectFramework={handleSelectFramework}
        code={code}
        setCode={setCode}
        output={output}
        executing={executing}
        testing={testing}
        error={error}
        setError={setError}
        visualizationData={visualizationData}
        executionResult={executionResult}
        modalOpen={modalOpen}
        setModalOpen={setModalOpen}
        onBack={() => setShowCodeEditor(false)}
        onExecute={handleExecute}
        onTestCode={handleTestCode}
        onCopyCode={handleCopyCode}
        analyzing={analyzing}
        onAnalyzeCode={handleAnalyzeCode}
        errorAnalysis={errorAnalysis}
        codeIssues={codeIssues}
        circuitProfile={circuitProfile}
        editorRef={editorRef}
        monacoRef={monacoRef}
      />
    );
  }

  // Otherwise, render Algorithm Info Page
  const difficultyInfo = getDifficultyLevel(algorithm.difficulty);

  return (
    <Box sx={{ width: "100%", pb: 4 }}>
      {/* Top Header */}
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
            title="Back to Algorithms"
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
                sx={{
                  borderColor: "var(--qt-border)",
                  color: "var(--qt-text)",
                }}
              />
            </Box>
          </Box>
        </Box>

        {/* Right side: Action Buttons */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Button
            variant="contained"
            startIcon={<PlayCircleOutlineIcon />}
            onClick={() => setShowVideoPage(true)}
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
            Watch Tutorial
          </Button>
          <Button
            variant="contained"
            startIcon={<ArticleIcon />}
            onClick={() => setShowPapersPage(true)}
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
            Read Paper
          </Button>
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

      {/* Main Content - Algorithm Concept Explanation & Interactive Images */}
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
        <AlgoConceptPanel algorithm={algorithm} algoId={algoId} />
      </Box>
    </Box>
  );
}
