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
import "../../styles/dashboardCards.css";

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
      <div className="lp-card" onClick={() => handleAlgorithmClick(algo.id)} style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column' }}>
        <div className="lp-card-header">
          <div className="lp-icon-box" style={{ background: 'var(--qt-accent)', color: 'var(--qt-bg-main)' }}>
            {icon}
          </div>
          <div style={{ flex: 1, overflow: 'hidden' }}>
            <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--qt-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {algo.name}
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--qt-text-dim)' }}>{algo.category}</p>
          </div>
        </div>
        <div className="lp-card-body" style={{ flex: 1, padding: '0.5rem 1.2rem', color: 'var(--qt-text-dim)', fontSize: '0.9rem', lineHeight: 1.5 }}>
          {algo.description}
        </div>
        <div className="lp-card-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ 
            fontSize: '0.75rem', 
            fontWeight: 600, 
            padding: '4px 10px', 
            borderRadius: '12px', 
            textTransform: 'uppercase',
            backgroundColor: algo.difficulty === 'beginner' ? 'rgba(76, 175, 80, 0.1)' : algo.difficulty === 'intermediate' ? 'rgba(255, 152, 0, 0.1)' : 'rgba(244, 67, 54, 0.1)',
            color: algo.difficulty === 'beginner' ? '#4CAF50' : algo.difficulty === 'intermediate' ? '#FF9800' : '#F44336'
          }}>
            {algo.difficulty}
          </span>
          <span style={{ fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--qt-text-dim)' }}>
            <AccessTimeIcon fontSize="small" />
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
      <section className="lp-section" style={{ marginTop: '2rem' }}>
        <div className="lp-section-header" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ margin: 0, color: 'var(--qt-text)', fontSize: '1.25rem', fontWeight: 600 }}>{difficultyInfo.label}</h2>
          <span style={{ fontSize: '0.85rem', color: 'var(--qt-text-dim)', background: 'var(--qt-surface-alt)', padding: '2px 8px', borderRadius: '12px' }}>
            {algorithms.length} algorithm{algorithms.length !== 1 ? 's' : ''}
          </span>
        </div>
        <div className="lp-grid">
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
    <div className="lp-dashboard-root">
      {/* Header Section */}
      <header className="lp-header" style={{ paddingBottom: '1rem', borderBottom: 'none' }}>
        <div className="lp-header-left">
          <div className="lp-greeting">
            <h1 style={{ margin: 0, fontSize: '1.75rem', color: 'var(--qt-text)' }}>AlgoHub</h1>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--qt-text-dim)', fontSize: '0.95rem' }}>
              Explore quantum algorithms from beginner to advanced.
            </p>
          </div>
        </div>
        <div className="lp-header-right">
          <div className="lp-search-box">
            <SearchIcon style={{ width: 18, height: 18, color: 'var(--qt-text-dim)' }} />
            <input
              type="text"
              placeholder="Search algorithms..."
              className="lp-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="lp-btn-primary" onClick={handleCustomBuild} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AddIcon fontSize="small" />
            Custom Build
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="lp-hero" style={{ marginBottom: '2rem' }}>
        <div className="lp-hero-header">
          <h2 style={{ color: 'var(--qt-bg-main)', margin: 0, fontSize: '1.5rem' }}>Master Quantum Algorithms</h2>
        </div>
        <div className="lp-hero-content" style={{ color: 'var(--qt-bg-main)', opacity: 0.9 }}>
          <p style={{ margin: 0, maxWidth: '600px' }}>
            Learn, build, and experiment with real quantum circuits. Choose from predefined algorithms categorized by difficulty or create your own custom quantum circuit from scratch.
          </p>
        </div>
      </section>

      {/* Algorithm Grid */}
      {filteredAlgorithms ? (
        <Box>
          <div className="lp-section-header" style={{ marginBottom: '1rem' }}>
            <h2 style={{ color: 'var(--qt-text)', fontSize: '1.25rem' }}>Search Results</h2>
            <span style={{ marginLeft: '10px', fontSize: '0.85rem', color: 'var(--qt-text-dim)' }}>{filteredAlgorithms.length} found</span>
          </div>
          {filteredAlgorithms.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--qt-text-dim)' }}>
              <SearchIcon style={{ fontSize: 48, opacity: 0.5, marginBottom: '1rem' }} />
              <h3>No algorithms found</h3>
              <p>Try different keywords or browse by difficulty below</p>
            </div>
          ) : (
            <div className="lp-grid">
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
