import React, { useState } from "react";
import {
  Box,
  TextField,
  InputAdornment,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Chip,
  Button,
  Grid,
  Divider,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
  algorithmTemplates,
  getDifficultyLevel,
  getAlgorithmsByDifficulty,
  searchAlgorithms,
} from "../../data/algorithmTemplates";
import AlgoWorkspaceContent from "./AlgoWorkspaceContent";
import CustomBuildContent from "./CustomBuildContent";
import AccountTreeIcon from "@mui/icons-material/AccountTree";
import LinkIcon from "@mui/icons-material/Link";
import PublicIcon from "@mui/icons-material/Public";
import SendIcon from "@mui/icons-material/Send";
import AdjustIcon from "@mui/icons-material/Adjust";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import FunctionsIcon from "@mui/icons-material/Functions";
import ScienceIcon from "@mui/icons-material/Science";
import SecurityIcon from "@mui/icons-material/Security";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// Icon mapping for algorithms
const algorithmIcons = {
  "single-qubit-gates": <AccountTreeIcon />,
  "bell-state": <LinkIcon />,
  "ghz-state": <PublicIcon />,
  "quantum-teleportation": <SendIcon />,
  "deutsch-jozsa": <AdjustIcon />,
  "qft-3qubit": <FunctionsIcon />,
  "grovers-search": <SearchOutlinedIcon />,
  "shor-simplified": <TrendingUpIcon />,
  "vqe-h2": <ScienceIcon />,
  "qec-bit-flip": <SecurityIcon />,
};

export default function AlgoHubContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAlgoId, setSelectedAlgoId] = useState(null);
  const [showCustomBuild, setShowCustomBuild] = useState(false);

  const groupedAlgorithms = getAlgorithmsByDifficulty();
  const filteredAlgorithms = searchQuery
    ? searchAlgorithms(searchQuery)
    : null;

  const handleAlgorithmClick = (algoId) => {
    setSelectedAlgoId(algoId);
    setShowCustomBuild(false);
  };

  const handleCustomBuild = () => {
    setShowCustomBuild(true);
    setSelectedAlgoId(null);
  };

  const AlgorithmCard = ({ algo }) => {
    const difficultyInfo = getDifficultyLevel(algo.difficulty);
    const icon = algorithmIcons[algo.id] || <AccountTreeIcon />;

    return (
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          transition: "all 0.3s ease",
          background: "var(--qt-surface-glass, var(--qt-surface))",
          border: "1px solid var(--qt-border)",
          "&:hover": {
            transform: "translateY(-4px)",
            boxShadow: 6,
          },
        }}
      >
        <CardActionArea
          onClick={() => handleAlgorithmClick(algo.id)}
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "stretch",
          }}
        >
          <CardContent sx={{ flexGrow: 1, width: "100%" }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Box
                sx={{
                  mr: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 48,
                  borderRadius: 2,
                  background: `${difficultyInfo.color}20`,
                  color: difficultyInfo.color,
                }}
              >
                {icon}
              </Box>
              <Box sx={{ flexGrow: 1 }}>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    mb: 0.5,
                    color: "var(--qt-text)",
                    fontSize: "1rem",
                  }}
                >
                  {algo.name}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "var(--qt-text-dim)" }}
                >
                  {algo.category}
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="body2"
              sx={{
                mb: 2,
                minHeight: 40,
                color: "var(--qt-text-dim)",
                lineHeight: 1.5,
              }}
            >
              {algo.description}
            </Typography>

            <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
                icon={<AccessTimeIcon />}
                label={algo.estimatedTime}
                size="small"
                variant="outlined"
                sx={{ borderColor: "var(--qt-border)" }}
              />
            </Box>
          </CardContent>
        </CardActionArea>
      </Card>
    );
  };

  const DifficultySection = ({ difficulty, algorithms }) => {
    const difficultyInfo = getDifficultyLevel(difficulty);

    return (
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: "flex", alignItems: "center", mb: 3 }}>
          <Box
            sx={{
              width: 6,
              height: 32,
              backgroundColor: difficultyInfo.color,
              borderRadius: 1,
              mr: 2,
            }}
          />
          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "var(--qt-text)" }}
          >
            {difficultyInfo.label}
          </Typography>
          <Chip
            label={`${algorithms.length} algorithms`}
            size="small"
            sx={{ ml: 2, background: "var(--qt-surface)" }}
          />
        </Box>

        <Grid container spacing={3}>
          {algorithms.map((algo) => (
            <Grid item xs={12} sm={6} md={4} key={algo.id}>
              <AlgorithmCard algo={algo} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  // If custom build selected, show custom build workspace
  if (showCustomBuild) {
    return (
      <CustomBuildContent
        onBack={() => setShowCustomBuild(false)}
      />
    );
  }

  // If algorithm selected, show workspace
  if (selectedAlgoId) {
    return (
      <AlgoWorkspaceContent
        algoId={selectedAlgoId}
        onBack={() => setSelectedAlgoId(null)}
      />
    );
  }

  // Otherwise show algorithm hub
  return (
    <Box sx={{ width: "100%" }}>
      {/* Header */}
      <Box sx={{ mb: 4, textAlign: "center" }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            mb: 2,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          AlgoHub
        </Typography>
        <Typography
          variant="body1"
          sx={{ mb: 3, color: "var(--qt-text-dim)" }}
        >
          Explore quantum algorithms from beginner to advanced
        </Typography>

        {/* Search Bar */}
        <Box sx={{ maxWidth: 600, mx: "auto", mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Search algorithms, categories, or concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "var(--qt-surface)",
                border: "1px solid var(--qt-border)",
              },
            }}
          />
        </Box>

        {/* Custom Build Button */}
        <Button
          variant="contained"
          size="large"
          startIcon={<AddIcon />}
          onClick={handleCustomBuild}
          sx={{
            borderRadius: 3,
            px: 4,
            py: 1.5,
            fontWeight: 600,
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            "&:hover": {
              background: "linear-gradient(135deg, #5568d3 0%, #6b3f8f 100%)",
            },
          }}
        >
          Custom Build
        </Button>
      </Box>

      <Divider sx={{ mb: 4, borderColor: "var(--qt-border)" }} />

      {/* Algorithm Grid */}
      {filteredAlgorithms ? (
        <Box>
          <Typography
            variant="h5"
            sx={{ mb: 3, fontWeight: 600, color: "var(--qt-text)" }}
          >
            Search Results ({filteredAlgorithms.length})
          </Typography>
          {filteredAlgorithms.length === 0 ? (
            <Box sx={{ textAlign: "center", py: 8 }}>
              <SearchIcon
                sx={{ fontSize: 64, color: "var(--qt-text-dim)", mb: 2 }}
              />
              <Typography variant="h6" sx={{ color: "var(--qt-text-dim)" }}>
                No algorithms found
              </Typography>
              <Typography variant="body2" sx={{ color: "var(--qt-text-dim)" }}>
                Try different keywords or browse by difficulty below
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filteredAlgorithms.map((algo) => (
                <Grid item xs={12} sm={6} md={4} key={algo.id}>
                  <AlgorithmCard algo={algo} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      ) : (
        <>
          <DifficultySection
            difficulty="beginner"
            algorithms={groupedAlgorithms.beginner}
          />
          <DifficultySection
            difficulty="intermediate"
            algorithms={groupedAlgorithms.intermediate}
          />
          <DifficultySection
            difficulty="advanced"
            algorithms={groupedAlgorithms.advanced}
          />
        </>
      )}
    </Box>
  );
}
