import React, { useState, useMemo } from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Grid,
  Paper,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ReplayIcon from "@mui/icons-material/Replay";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import SchemaIcon from "@mui/icons-material/Schema";
import TimelineIcon from "@mui/icons-material/Timeline";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import { useNavigate } from "react-router-dom";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Legend,
  AreaChart,
  Area,
  BarChart,
  Bar,
} from "recharts";

import PeriodicTable, { PeriodicLegend } from "./PeriodicTable";
import CompositionBuilder from "./CompositionBuilder";
import Composition3DView from "./Composition3DView";

import "../../../styles/dashboardTheme.css";
import "../../../styles/dashboardCards.css";
import "../../../styles/materialsDiscovery.css";

function normalizeRatios(ratios) {
  const values = Object.values(ratios).filter((v) => v > 0);
  if (!values.length) return {};
  const min = Math.min(...values);
  const scaled = Object.fromEntries(
    Object.entries(ratios).map(([k, v]) => [k, v / min])
  );
  return Object.fromEntries(
    Object.entries(scaled).map(([k, v]) => {
      const rounded = Math.round(v * 10) / 10;
      const maybeInt = Math.round(rounded);
      return [k, Math.abs(maybeInt - rounded) < 0.05 ? maybeInt : rounded];
    })
  );
}

function buildFormula(selected, ratios) {
  if (!selected.length) return "";
  return selected
    .map((el) => {
      const part = ratios[el.symbol] ?? 0;
      if (part === 0) return null;
      return `${el.symbol}${part === 1 ? "" : part}`;
    })
    .filter(Boolean)
    .join("");
}

export default function MaterialsDiscoveryContent() {
  const navigate = useNavigate();

  const [selectedElements, setSelectedElements] = useState([]);
  const [ratios, setRatios] = useState({});
  const [vqcConfig, setVqcConfig] = useState({
    encoding: "Angle",
    qubits: 8,
    depth: 4,
    shots: 1024,
    optimizer: "Adam",
    lr: 0.02,
    ansatz: "Hardware Efficient",
  });

  const statItems = [
    { label: "Total Materials", value: "1,245" },
    { label: "Active Experiments", value: "12" },
    { label: "Qubits Used", value: "8" },
    { label: "Candidates", value: "64" },
  ];

  const selectedSymbols = useMemo(
    () => selectedElements.map((e) => e.symbol),
    [selectedElements]
  );
  const normalizedRatios = useMemo(() => normalizeRatios(ratios), [ratios]);
  const compositionFormula = useMemo(
    () => buildFormula(selectedElements, normalizedRatios),
    [selectedElements, normalizedRatios]
  );

  const lossData = useMemo(() => {
    const base = vqcConfig.depth * 0.04 + vqcConfig.qubits * 0.008;
    return Array.from({ length: 12 }, (_, i) => {
      const step = (i + 1) * 5;
      const decay = Math.exp(-i / 5) * (0.6 + base) + 0.04;
      return { step, loss: Number(decay.toFixed(3)) };
    });
  }, [vqcConfig.depth, vqcConfig.qubits]);

  const expectationData = useMemo(() => {
    const drift = vqcConfig.lr * 8;
    return [
      { step: 0, value: 0.12 + drift },
      { step: 10, value: 0.32 + drift },
      { step: 20, value: 0.47 + drift },
      { step: 30, value: 0.55 + drift },
      { step: 40, value: 0.61 + drift },
    ];
  }, [vqcConfig.lr]);

  const probData = useMemo(() => {
    const focus = Math.min(0.55 + selectedSymbols.length * 0.05, 0.9);
    const spread = (1 - focus) / 3;
    return [
      { state: "000", prob: focus },
      { state: "001", prob: spread },
      { state: "010", prob: spread * 0.9 },
      { state: "111", prob: spread * 1.1 },
    ];
  }, [selectedSymbols.length]);

  const candidateLibrary = useMemo(
    () => [
      {
        formula: "Fe2O3Cu",
        score: 0.87,
        decision: "Practically Applicable",
        rationale:
          "Stable oxide matrix with Cu-doping for conductivity; good for catalysis and sensors.",
        bandgap: "2.1 eV",
        stability: "High",
      },
      {
        formula: "NiTiAl",
        score: 0.68,
        decision: "Conditionally Applicable",
        rationale:
          "Shape-memory alloy behavior; requires thermal cycling constraints.",
        bandgap: "Metallic",
        stability: "Medium",
      },
      {
        formula: "CuZnSn",
        score: 0.44,
        decision: "Not Recommended",
        rationale: "Competing phases and low predicted carrier mobility.",
        bandgap: "1.5 eV",
        stability: "Low",
      },
      {
        formula: "TiVCrMnFe",
        score: 0.73,
        decision: "Practically Applicable",
        rationale:
          "High-entropy alloy with promising hydrogen storage profile.",
        bandgap: "Metallic",
        stability: "High",
      },
      {
        formula: "SnSbAg",
        score: 0.62,
        decision: "Conditionally Applicable",
        rationale:
          "Thermoelectric potential; optimization needed on carrier concentration.",
        bandgap: "0.9 eV",
        stability: "Medium",
      },
    ],
    []
  );

  const dynamicCandidate = useMemo(() => {
    if (!compositionFormula) return null;
    const scoreBase = 0.55 + Math.min(selectedElements.length * 0.06, 0.25);
    return {
      formula: compositionFormula,
      score: Number(scoreBase.toFixed(2)),
      decision:
        scoreBase > 0.78
          ? "Practically Applicable"
          : scoreBase > 0.62
          ? "Conditionally Applicable"
          : "Not Recommended",
      rationale:
        "Generated from your current composition ratios; score trends with complexity and balance.",
      bandgap: `${(1.4 + selectedElements.length * 0.1).toFixed(1)} eV`,
      stability:
        scoreBase > 0.78 ? "High" : scoreBase > 0.62 ? "Medium" : "Low",
    };
  }, [compositionFormula, selectedElements.length]);

  const candidateList = useMemo(() => {
    const filtered = selectedSymbols.length
      ? candidateLibrary.filter((c) =>
          selectedSymbols.some((s) => c.formula.includes(s))
        )
      : candidateLibrary;
    const merged = dynamicCandidate
      ? [dynamicCandidate, ...filtered]
      : filtered;
    return merged.slice(0, 4);
  }, [candidateLibrary, dynamicCandidate, selectedSymbols]);

  const handleToggleElement = (el) => {
    const exists = selectedElements.find((e) => e.symbol === el.symbol);
    if (exists) {
      setSelectedElements((prev) => prev.filter((e) => e.symbol !== el.symbol));
      setRatios((prev) => {
        const next = { ...prev };
        delete next[el.symbol];
        return next;
      });
      return;
    }
    if (selectedElements.length >= 5) return;
    setSelectedElements((prev) => [...prev, el]);
    setRatios((prev) => ({ ...prev, [el.symbol]: 0.5 }));
  };

  const handleRatioChange = (symbol, value) => {
    setRatios((prev) => ({ ...prev, [symbol]: value }));
  };

  const handleVqcChange = (key, value) => {
    setVqcConfig((prev) => ({ ...prev, [key]: value }));
  };

  const handleRemove = (symbol) => {
    setSelectedElements((prev) => prev.filter((e) => e.symbol !== symbol));
    setRatios((prev) => {
      const next = { ...prev };
      delete next[symbol];
      return next;
    });
  };

  return (
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        <Paper
          variant="outlined"
          className="qt-tmpl-hero"
          sx={{
            p: 3,
            background: "var(--qt-gradient-main)",
            color: "var(--qt-text)",
            border: "1px solid var(--qt-border)",
            borderRadius: 3,
          }}
        >
          <Stack spacing={1.5}>
            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Accelerating Materials Discovery with Quantum ML
            </Typography>
            <Typography
              variant="body2"
              sx={{
                maxWidth: 980,
                color: "var(--qt-text-dim)",
                lineHeight: 1.6,
              }}
            >
              Quantum-assisted screening and evaluation of multi-element
              material compositions. Configure VQC circuits, observe training
              behavior, and review AI-supported decisions.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                sx={{
                  background: "var(--qt-button-primary)",
                  "&:hover": { background: "var(--qt-button-primary-hover)" },
                }}
              >
                Run Quantum Experiment
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<TravelExploreIcon />}
                onClick={() => navigate("/applications")}
              >
                Back to Applications
              </Button>
            </Stack>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              {statItems.map((item) => (
                <Paper
                  key={item.label}
                  variant="outlined"
                  className="qt-tmpl-panel"
                  sx={{ p: 1.5, borderRadius: 2, minWidth: 160 }}
                >
                  <Typography
                    variant="subtitle2"
                    sx={{ color: "var(--qt-text-dim)" }}
                  >
                    {item.label}
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 800 }}>
                    {item.value}
                  </Typography>
                </Paper>
              ))}
            </Stack>
          </Stack>
        </Paper>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              className="qt-tmpl-panel mdc-surface"
              sx={{ p: 1, minHeight: 320, maxWidth: 880 }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <ScienceRoundedIcon />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Periodic Table Interaction
                  </Typography>
                </Stack>
                <Chip
                  label={`${selectedElements.length}/5 selected`}
                  size="small"
                />
              </Stack>
              <Typography
                variant="body2"
                sx={{ color: "var(--qt-text-dim)", mb: 2 }}
              >
                Tap elements to select up to 5. Selections glow; others soften
                to guide focus.
              </Typography>
              <PeriodicTable
                selectedSymbols={selectedSymbols}
                onToggle={handleToggleElement}
              />
              <Box sx={{ mt: 1 }}>
                <PeriodicLegend />
              </Box>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              className="qt-tmpl-panel mdc-surface"
              sx={{ p: 2.5, minHeight: 595, maxWidth: 440 }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <SchemaIcon />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Composition Builder
                  </Typography>
                </Stack>
                <Chip label="Ratios" size="small" />
              </Stack>
              <CompositionBuilder
                selected={selectedElements}
                ratios={ratios}
                onRatioChange={handleRatioChange}
                onRemove={handleRemove}
              />
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              className="qt-tmpl-panel mdc-surface"
              sx={{ p: 2.5, minHeight: 300, minWidth: 1000 }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <ReplayIcon />
                  <Typography variant="subtitle1" fontWeight={700}>
                    3D Compound Visualization
                  </Typography>
                </Stack>
                <Chip label="Orbit/Zoom" size="small" />
              </Stack>
              <Composition3DView
                selected={selectedElements}
                ratios={normalizedRatios}
              />
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              className="qt-tmpl-panel mdc-surface"
              sx={{ p: 2.5, minHeight: 300, minWidth: 500 }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <PlayArrowIcon />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Quantum Model Configuration
                  </Typography>
                </Stack>
                <Chip label="VQC" size="small" />
              </Stack>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Encoding</InputLabel>
                    <Select
                      label="Encoding"
                      value={vqcConfig.encoding}
                      onChange={(e) =>
                        handleVqcChange("encoding", e.target.value)
                      }
                    >
                      <MenuItem value="Angle">Angle</MenuItem>
                      <MenuItem value="Amplitude">Amplitude</MenuItem>
                      <MenuItem value="IQP">IQP</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl size="small" fullWidth>
                    <InputLabel>Ansatz</InputLabel>
                    <Select
                      label="Ansatz"
                      value={vqcConfig.ansatz}
                      onChange={(e) =>
                        handleVqcChange("ansatz", e.target.value)
                      }
                    >
                      <MenuItem value="Hardware Efficient">
                        Hardware Efficient
                      </MenuItem>
                      <MenuItem value="Layered HE">Layered HE</MenuItem>
                      <MenuItem value="UCC">UCC</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>

                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="caption"
                      sx={{ color: "var(--qt-text-dim)" }}
                    >
                      Qubits
                    </Typography>
                    <Slider
                      size="small"
                      min={2}
                      max={16}
                      value={vqcConfig.qubits}
                      onChange={(_, v) => handleVqcChange("qubits", Number(v))}
                    />
                    <Typography variant="body2">
                      {vqcConfig.qubits} qubits
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="caption"
                      sx={{ color: "var(--qt-text-dim)" }}
                    >
                      Depth
                    </Typography>
                    <Slider
                      size="small"
                      min={1}
                      max={12}
                      value={vqcConfig.depth}
                      onChange={(_, v) => handleVqcChange("depth", Number(v))}
                    />
                    <Typography variant="body2">
                      Depth {vqcConfig.depth}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="caption"
                      sx={{ color: "var(--qt-text-dim)" }}
                    >
                      Shots
                    </Typography>
                    <Slider
                      size="small"
                      min={128}
                      max={4096}
                      step={128}
                      value={vqcConfig.shots}
                      onChange={(_, v) => handleVqcChange("shots", Number(v))}
                    />
                    <Typography variant="body2">
                      {vqcConfig.shots} shots
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography
                      variant="caption"
                      sx={{ color: "var(--qt-text-dim)" }}
                    >
                      Learning Rate
                    </Typography>
                    <Slider
                      size="small"
                      min={0.001}
                      max={0.1}
                      step={0.001}
                      value={vqcConfig.lr}
                      onChange={(_, v) => handleVqcChange("lr", Number(v))}
                    />
                    <Typography variant="body2">
                      lr = {vqcConfig.lr.toFixed(3)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <FormControl size="small" fullWidth>
                      <InputLabel>Optimizer</InputLabel>
                      <Select
                        label="Optimizer"
                        value={vqcConfig.optimizer}
                        onChange={(e) =>
                          handleVqcChange("optimizer", e.target.value)
                        }
                      >
                        <MenuItem value="Adam">Adam</MenuItem>
                        <MenuItem value="SGD">SGD</MenuItem>
                        <MenuItem value="COBYLA">COBYLA</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    border: "1px dashed var(--qt-border)",
                    borderRadius: 2,
                    p: 1.5,
                  }}
                >
                  <Typography variant="body2">Circuit Preview</Typography>
                  <Typography variant="body2">
                    |q0&gt; ─■──RY(θ1)──■──RY(θ2)──■─
                  </Typography>
                  <Typography variant="body2">
                    |q1&gt; ─●──RX(φ1)──●──RX(φ2)──●─
                  </Typography>
                  <Typography variant="body2">
                    |q2&gt; ─┼──────────┼──────────┼─
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "var(--qt-text-dim)" }}
                  >
                    {vqcConfig.encoding} encoding · {vqcConfig.ansatz} ansatz ·{" "}
                    {vqcConfig.qubits} qubits · depth {vqcConfig.depth}
                  </Typography>
                </Box>

                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<PlayArrowIcon />}
                    sx={{
                      background: "var(--qt-button-primary)",
                      "&:hover": {
                        background: "var(--qt-button-primary-hover)",
                      },
                    }}
                  >
                    Run Quantum Experiment
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<ReplayIcon />}
                    onClick={() =>
                      setVqcConfig({
                        encoding: "Angle",
                        qubits: 8,
                        depth: 4,
                        shots: 1024,
                        optimizer: "Adam",
                        lr: 0.02,
                        ansatz: "Hardware Efficient",
                      })
                    }
                  >
                    Reset
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>

        <Grid container spacing={2.5}>
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              className="qt-tmpl-panel mdc-surface"
              sx={{ p: 2.5, minHeight: 300 }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <TimelineIcon />
                  <Typography variant="subtitle1" fontWeight={700}>
                    Training & Measurement
                  </Typography>
                </Stack>
                <Chip label="Charts" size="small" />
              </Stack>
              <Typography
                variant="body2"
                sx={{ color: "var(--qt-text-dim)", mb: 1.5 }}
              >
                Training loss, expectation trend, and final measurement
                probabilities.
              </Typography>
              <Stack spacing={1.5}>
                <Box sx={{ height: 140 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lossData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--qt-border)"
                      />
                      <XAxis dataKey="step" stroke="var(--qt-text-dim)" />
                      <YAxis stroke="var(--qt-text-dim)" />
                      <RechartsTooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="loss"
                        stroke="#5cc9f5"
                        strokeWidth={2}
                        dot={false}
                        name="Loss"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ height: 120 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={expectationData}>
                      <defs>
                        <linearGradient
                          id="expFill"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="#8ce99a"
                            stopOpacity={0.6}
                          />
                          <stop
                            offset="95%"
                            stopColor="#8ce99a"
                            stopOpacity={0.05}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--qt-border)"
                      />
                      <XAxis dataKey="step" stroke="var(--qt-text-dim)" />
                      <YAxis stroke="var(--qt-text-dim)" />
                      <RechartsTooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#8ce99a"
                        fill="url(#expFill)"
                        name="Expectation"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
                <Box sx={{ height: 120 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={probData}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--qt-border)"
                      />
                      <XAxis dataKey="state" stroke="var(--qt-text-dim)" />
                      <YAxis stroke="var(--qt-text-dim)" />
                      <RechartsTooltip />
                      <Bar
                        dataKey="prob"
                        fill="#f7b267"
                        radius={[6, 6, 0, 0]}
                        name="P(state)"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper
              variant="outlined"
              className="qt-tmpl-panel mdc-surface"
              sx={{ p: 2.5, minHeight: 300 }}
            >
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <LeaderboardIcon />
                  <Typography variant="subtitle1" fontWeight={700}>
                    AI Decision & Candidates
                  </Typography>
                </Stack>
                <Chip label="XAI" size="small" />
              </Stack>
              <Stack spacing={1.2}>
                <Typography
                  variant="body2"
                  sx={{ color: "var(--qt-text-dim)" }}
                >
                  AI decision layer (QChemDecider) will classify: Practically
                  Applicable / Conditionally Applicable / Not Recommended.
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    Top Candidates
                  </Typography>
                  {candidateList.map((c, idx) => (
                    <Paper
                      key={c.formula + idx}
                      variant="outlined"
                      sx={{
                        p: 1.2,
                        borderRadius: 1.5,
                        borderColor: "var(--qt-border)",
                      }}
                    >
                      <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={1}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 800 }}
                        >
                          {c.formula}
                        </Typography>
                        <Chip
                          label={`${Math.round(c.score * 100)}%`}
                          size="small"
                          color={
                            c.score > 0.75
                              ? "success"
                              : c.score > 0.55
                              ? "warning"
                              : "default"
                          }
                        />
                      </Stack>
                      <Typography
                        variant="body2"
                        sx={{ color: "var(--qt-text-dim)" }}
                      >
                        {c.decision} — {c.rationale}
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{ color: "var(--qt-text-dim)" }}
                      >
                        Bandgap: {c.bandgap} · Stability: {c.stability}
                      </Typography>
                    </Paper>
                  ))}
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Box>
  );
}
