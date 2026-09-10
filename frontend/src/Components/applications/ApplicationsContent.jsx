import React from "react";
import {
  Box,
  Typography,
  Stack,
  Button,
  Paper,
} from "@mui/material";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import SecurityIcon from "@mui/icons-material/Security";
import QueryStatsIcon from "@mui/icons-material/QueryStats";
import { useNavigate } from "react-router-dom";

import ApplicationCard from "./ApplicationCard";

import "../../styles/applicationsCards.css";

export default function ApplicationsContent() {
  const navigate = useNavigate();

  const cards = [
    {
      title: "Quantum Materials Discovery",
      subtitle: "AI + Quantum",
      description:
        "Discover and screen candidate materials using quantum ML workflows. Interact with compositions, visualize circuits, and review AI-guided decisions.",
      tags: ["VQC", "Materials", "Explainable AI", "3D"],
      status: "available",
      actionLabel: "Open",
      onClick: () => navigate("/applications/materials-discovery"),
      icon: <ScienceRoundedIcon fontSize="inherit" />,
    },
    {
      title: "Quantum Security Analyzer",
      subtitle: "Practical App",
      description: "Placeholder for future quantum security assessments with noise-aware circuits.",
      tags: ["Cryptography", "Noise"],
      status: "upcoming",
      actionLabel: "Preview",
      onClick: () => {},
      icon: <SecurityIcon fontSize="inherit" />,
    },
    {
      title: "Quantum Optimization Lab",
      subtitle: "Practical App",
      description: "Placeholder for combinatorial optimization scenarios leveraging QAOA-style workflows.",
      tags: ["QAOA", "Optimization"],
      status: "upcoming",
      actionLabel: "Preview",
      onClick: () => {},
      icon: <QueryStatsIcon fontSize="inherit" />,
    },
  ];

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
              Quantum Applications Gallery
            </Typography>
            <Typography variant="body2" sx={{ maxWidth: 960, color: "var(--qt-text-dim)", lineHeight: 1.6 }}>
              Browse practical quantum applications designed for the Qubit Tracer platform. Each card will open directly within this workspace, keeping the sidebar and top bar consistent. The first experience is the Quantum Materials Discovery dashboard.
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => {}}
                sx={{ background: "var(--qt-button-primary)", '&:hover': { background: "var(--qt-button-primary-hover)" } }}
              >
                Launch Materials Discovery
              </Button>
              <Button variant="outlined" color="inherit" onClick={() => navigate("/docs")}>Learn more</Button>
            </Stack>
          </Stack>
        </Paper>

        <Box
          sx={{
            display: "grid",
            gap: 2.5,
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            alignItems: "stretch",
          }}
        >
          {cards.map((card) => (
            <ApplicationCard key={card.title} {...card} />
          ))}
        </Box>
      </Box>
  );
}
