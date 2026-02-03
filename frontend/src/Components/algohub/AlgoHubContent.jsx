import React, { useState } from "react";
import { Box } from "@mui/material";
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
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import "./algohub.css";

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

  // Algorithm Card Component
  const AlgorithmCard = ({ algo }) => {
    const icon = algorithmIcons[algo.id] || <AccountTreeIcon />;

    return (
      <div className={`algohub-card`} onClick={() => handleAlgorithmClick(algo.id)}>
        <div className="algohub-card-head">
          <div className={`algohub-card-icon ${algo.difficulty}`}>
            {icon}
          </div>
          <div className="algohub-card-info">
            <div className="algohub-card-name">{algo.name}</div>
            <div className="algohub-card-category">{algo.category}</div>
          </div>
        </div>
        <div className="algohub-card-desc">{algo.description}</div>
        <div className="algohub-card-footer">
          <span className={`algohub-badge ${algo.difficulty}`}>
            {algo.difficulty}
          </span>
          <span className="algohub-time">
            <AccessTimeIcon />
            {algo.estimatedTime}
          </span>
        </div>
      </div>
    );
  };

  // Difficulty Section Component
  const DifficultySection = ({ difficulty, algorithms }) => {
    if (!algorithms || algorithms.length === 0) return null;

    const difficultyInfo = getDifficultyLevel(difficulty);

    return (
      <section className="algohub-section algohub-fade-in">
        <div className="algohub-section-header">
          <div className={`algohub-section-bar ${difficulty}`} />
          <h2 className="algohub-section-title">{difficultyInfo.label}</h2>
          <span className="algohub-section-count">
            {algorithms.length} algorithm{algorithms.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="algohub-grid">
          {algorithms.map((algo) => (
            <AlgorithmCard key={algo.id} algo={algo} />
          ))}
        </div>
      </section>
    );
  };

  // If custom build selected, show custom build workspace
  if (showCustomBuild) {
    return <CustomBuildContent onBack={() => setShowCustomBuild(false)} />;
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

  // Main AlgoHub view
  return (
    <div className="algohub-root">
      {/* Hero Section */}
      <header className="algohub-hero">
        <h1 className="algohub-title">AlgoHub</h1>
        <p className="algohub-subtitle">
          Explore quantum algorithms from beginner to advanced — learn, build, and experiment with real quantum circuits
        </p>

        {/* Search Bar */}
        <div className="algohub-search-wrap">
          <SearchIcon className="algohub-search-icon" />
          <input
            type="text"
            className="algohub-search"
            placeholder="Search algorithms, categories, or concepts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* CTA Button */}
        <button className="algohub-cta" onClick={handleCustomBuild}>
          <AddIcon />
          Custom Build
        </button>
      </header>

      <div className="algohub-divider" />

      {/* Algorithm Grid */}
      {filteredAlgorithms ? (
        <Box>
          <div className="algohub-results-header">
            <h2 className="algohub-results-title">Search Results</h2>
            <span className="algohub-results-count">{filteredAlgorithms.length}</span>
          </div>
          {filteredAlgorithms.length === 0 ? (
            <div className="algohub-empty">
              <SearchIcon className="algohub-empty-icon" />
              <div className="algohub-empty-title">No algorithms found</div>
              <div className="algohub-empty-desc">
                Try different keywords or browse by difficulty below
              </div>
            </div>
          ) : (
            <div className="algohub-grid">
              {filteredAlgorithms.map((algo) => (
                <AlgorithmCard key={algo.id} algo={algo} />
              ))}
            </div>
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
    </div>
  );
}
