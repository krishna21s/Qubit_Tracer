import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArticleIcon from "@mui/icons-material/Article";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SchoolIcon from "@mui/icons-material/School";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MenuBookIcon from "@mui/icons-material/MenuBook";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import FormatQuoteIcon from "@mui/icons-material/FormatQuote";
import { getAlgoPapersData } from "../../data/algoPapersData";
import { getDifficultyLevel } from "../../data/algorithmTemplates";

export default function AlgoPapersPage({
  algorithm,
  algoId,
  onBack,
}) {
  const papers = getAlgoPapersData(algoId, algorithm?.name || "Quantum Algorithm");
  const difficultyInfo = algorithm ? getDifficultyLevel(algorithm.difficulty) : null;

  return (
    <Box sx={{ width: "100%", pb: 6 }}>
      {/* Top Header Navigation Bar - Adapts to active app theme */}
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
            title="Back to Algorithm Overview"
            sx={{
              background: "var(--qt-surface, #1e293b)",
              border: "1px solid var(--qt-border, rgba(255,255,255,0.1))",
              color: "var(--qt-text, #e2e8f0)",
              "&:hover": {
                background: "var(--qt-surface-glass, rgba(255,255,255,0.08))",
                transform: "translateX(-2px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            <ArrowBackIcon />
          </IconButton>

          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
              <Typography
                variant="h5"
                sx={{ fontWeight: 700, color: "var(--qt-text, #e2e8f0)", mb: 0.5 }}
              >
                {algorithm?.name || "Algorithm"}
              </Typography>
              <Chip
                icon={<ArticleIcon sx={{ fontSize: "15px !important", color: "var(--qt-accent, #4cc3fa)" }} />}
                label="Research Papers"
                size="small"
                sx={{
                  background: "rgba(76, 195, 250, 0.12)",
                  color: "var(--qt-accent, #4cc3fa)",
                  border: "1px solid var(--qt-border, rgba(255,255,255,0.15))",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                }}
              />
              <Chip
                icon={<LockOpenIcon sx={{ fontSize: "14px !important", color: "#48bb78" }} />}
                label="100% Free Open-Access"
                size="small"
                sx={{
                  background: "rgba(72, 187, 120, 0.12)",
                  color: "#48bb78",
                  border: "1px solid rgba(72, 187, 120, 0.25)",
                  fontWeight: 700,
                  fontSize: "0.75rem",
                }}
              />
              {difficultyInfo && (
                <Chip
                  label={difficultyInfo.label}
                  size="small"
                  sx={{
                    backgroundColor: difficultyInfo.color,
                    color: "white",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                  }}
                />
              )}
            </Box>
            <Typography variant="body2" sx={{ color: "var(--qt-text-dim, #94a3b8)" }}>
              Curated peer-reviewed publications and landmark papers with free full-text access
            </Typography>
          </Box>
        </Box>

        {/* Search Database Shortcuts */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            variant="contained"
            startIcon={<SchoolIcon />}
            endIcon={<OpenInNewIcon sx={{ fontSize: "15px !important" }} />}
            onClick={() =>
              window.open(
                `https://scholar.google.com/scholar?q=${encodeURIComponent(
                  algorithm?.name + " quantum algorithm"
                )}`,
                "_blank"
              )
            }
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontWeight: 700,
              fontSize: "0.95rem",
              px: 3,
              py: 1,
              color: "#ffffff",
              boxShadow: "0 4px 18px rgba(102, 126, 234, 0.4)",
              transition: "all 0.2s ease",
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6b3f8f 100%)",
                boxShadow: "0 6px 24px rgba(102, 126, 234, 0.6)",
                transform: "translateY(-1px)",
              },
            }}
          >
            Google Scholar
          </Button>

          <Button
            variant="contained"
            startIcon={<MenuBookIcon />}
            endIcon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
            onClick={() =>
              window.open(
                `https://ieeexplore.ieee.org/search/searchresult.jsp?newsearch=true&queryText=${encodeURIComponent(
                  algorithm?.name || ""
                )}`,
                "_blank"
              )
            }
            sx={{
              background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              fontWeight: 700,
              fontSize: "0.95rem",
              px: 3,
              py: 1,
              color: "#ffffff",
              boxShadow: "0 4px 18px rgba(102, 126, 234, 0.4)",
              transition: "all 0.2s ease",
              textTransform: "none",
              "&:hover": {
                background: "linear-gradient(135deg, #5568d3 0%, #6b3f8f 100%)",
                boxShadow: "0 6px 24px rgba(102, 126, 234, 0.6)",
                transform: "translateY(-1px)",
              },
            }}
          >
            IEEE Xplore
          </Button>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
        {/* List of Research Papers - Dynamic theme styling with theme-based borders */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {papers.map((paper, index) => {
            return (
              <Paper
                key={paper.id || index}
                elevation={0}
                sx={{
                  p: { xs: 2.5, md: 3 },
                  borderRadius: "16px",
                  background: "var(--qt-surface-glass, var(--qt-surface, #1e293b))",
                  border: "1px solid var(--qt-border, rgba(255, 255, 255, 0.12))",
                  borderLeft: "4px solid var(--qt-accent, #4cc3fa)",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  transition: "all 0.25s ease",
                  "&:hover": {
                    borderColor: "var(--qt-accent, #4cc3fa)",
                    borderLeftColor: "var(--qt-accent, #4cc3fa)",
                    boxShadow: "0 8px 30px rgba(0, 0, 0, 0.18)",
                    transform: "translateY(-2px)",
                  },
                }}
              >
                {/* Top metadata tags */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                    mb: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                    <Chip
                      label={`Paper #${index + 1}`}
                      size="small"
                      sx={{
                        background: "rgba(76, 195, 250, 0.12)",
                        color: "var(--qt-accent, #4cc3fa)",
                        border: "1px solid var(--qt-border, rgba(76, 195, 250, 0.25))",
                        fontWeight: 800,
                        fontSize: "0.75rem",
                      }}
                    />
                    <Chip
                      icon={<AutoAwesomeIcon sx={{ fontSize: "14px !important", color: "var(--qt-accent, #4cc3fa)" }} />}
                      label={paper.keyContribution}
                      size="small"
                      sx={{
                        background: "var(--qt-surface-alt, rgba(255, 255, 255, 0.04))",
                        border: "1px solid var(--qt-border, rgba(255, 255, 255, 0.1))",
                        color: "var(--qt-text, #e2e8f0)",
                        fontWeight: 700,
                        fontSize: "0.75rem",
                      }}
                    />
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Chip
                      label={`Year: ${paper.year}`}
                      size="small"
                      sx={{
                        background: "var(--qt-surface-alt, rgba(255, 255, 255, 0.04))",
                        border: "1px solid var(--qt-border, rgba(255, 255, 255, 0.08))",
                        color: "var(--qt-text-dim, #94a3b8)",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    />
                    {paper.citations && (
                      <Chip
                        icon={<FormatQuoteIcon sx={{ fontSize: "14px !important", color: "var(--qt-text-dim, #94a3b8)" }} />}
                        label={`${paper.citations} Citations`}
                        size="small"
                        sx={{
                          background: "var(--qt-surface-alt, rgba(255, 255, 255, 0.04))",
                          border: "1px solid var(--qt-border, rgba(255, 255, 255, 0.08))",
                          color: "var(--qt-text-dim, #94a3b8)",
                          fontSize: "0.75rem",
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>
                </Box>

                {/* Title */}
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    color: "var(--qt-text, #e2e8f0)",
                    fontSize: "1.2rem",
                    lineHeight: 1.4,
                    mb: 1,
                  }}
                >
                  {paper.title}
                </Typography>

                {/* Authors & Journal */}
                <Box sx={{ mb: 2 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--qt-text-dim, #94a3b8)", display: "flex", alignItems: "center", gap: 0.8, mb: 0.6 }}
                  >
                    <PersonOutlineIcon sx={{ fontSize: 17, color: "var(--qt-accent, #4cc3fa)" }} />
                    Authors: <span style={{ color: "var(--qt-text, #e2e8f0)", fontWeight: 500 }}>{paper.authors}</span>
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--qt-text-dim, #94a3b8)", display: "flex", alignItems: "center", gap: 0.8 }}
                  >
                    <MenuBookIcon sx={{ fontSize: 17, color: "var(--qt-accent, #4cc3fa)" }} />
                    Published in: <span style={{ color: "var(--qt-text, #e2e8f0)", fontWeight: 700 }}>{paper.journal}</span>
                  </Typography>
                </Box>

                {/* Abstract Box */}
                <Box
                  sx={{
                    p: 2,
                    borderRadius: "10px",
                    background: "var(--qt-bg-alt, rgba(0, 0, 0, 0.2))",
                    border: "1px solid var(--qt-border, rgba(255, 255, 255, 0.08))",
                    mb: 2.5,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      textTransform: "uppercase",
                      letterSpacing: "0.06em",
                      fontWeight: 800,
                      color: "var(--qt-accent, #4cc3fa)",
                      display: "block",
                      mb: 0.6,
                    }}
                  >
                    Abstract & Key Findings
                  </Typography>
                  <Typography variant="body2" sx={{ color: "var(--qt-text-dim, #cbd5e1)", lineHeight: 1.7 }}>
                    {paper.abstract}
                  </Typography>
                </Box>

                {/* Action Buttons */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1.5,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                    <Button
                      variant="contained"
                      startIcon={<PictureAsPdfIcon />}
                      onClick={() => window.open(paper.pdfUrl, "_blank")}
                      sx={{
                        background: "var(--qt-button-primary, linear-gradient(135deg, #1779c2, #12649f))",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        px: 2.5,
                        py: 0.8,
                        color: "#ffffff",
                        boxShadow: "0 4px 14px rgba(0, 0, 0, 0.25)",
                        textTransform: "none",
                        "&:hover": {
                          background: "var(--qt-button-primary-hover, linear-gradient(135deg, #1f8fdc, #1674b7))",
                          transform: "translateY(-1px)",
                          boxShadow: "0 6px 18px rgba(0, 0, 0, 0.35)",
                        },
                      }}
                    >
                      Read Free PDF
                    </Button>

                    <Button
                      variant="outlined"
                      startIcon={<OpenInNewIcon sx={{ fontSize: "15px !important" }} />}
                      onClick={() => window.open(paper.openAccessUrl, "_blank")}
                      sx={{
                        borderColor: "var(--qt-border, rgba(255, 255, 255, 0.2))",
                        color: "var(--qt-text, #e2e8f0)",
                        fontWeight: 700,
                        fontSize: "0.85rem",
                        px: 2,
                        py: 0.8,
                        textTransform: "none",
                        background: "var(--qt-surface, transparent)",
                        "&:hover": {
                          background: "var(--qt-surface-alt, rgba(255, 255, 255, 0.06))",
                          borderColor: "var(--qt-accent, #4cc3fa)",
                          color: "var(--qt-accent, #4cc3fa)",
                        },
                      }}
                    >
                      Open Access Source
                    </Button>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<SchoolIcon sx={{ fontSize: "15px !important" }} />}
                      endIcon={<OpenInNewIcon sx={{ fontSize: "13px !important" }} />}
                      onClick={() => window.open(paper.scholarUrl, "_blank")}
                      sx={{
                        borderColor: "var(--qt-border, rgba(255, 255, 255, 0.15))",
                        background: "var(--qt-surface-alt, rgba(255, 255, 255, 0.04))",
                        color: "var(--qt-text, #e2e8f0)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        textTransform: "none",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "var(--qt-accent, #4cc3fa)",
                          color: "var(--qt-accent, #4cc3fa)",
                          background: "rgba(76, 195, 250, 0.08)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      Google Scholar
                    </Button>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<MenuBookIcon sx={{ fontSize: "15px !important" }} />}
                      endIcon={<OpenInNewIcon sx={{ fontSize: "13px !important" }} />}
                      onClick={() => window.open(paper.ieeeUrl, "_blank")}
                      sx={{
                        borderColor: "var(--qt-border, rgba(255, 255, 255, 0.15))",
                        background: "var(--qt-surface-alt, rgba(255, 255, 255, 0.04))",
                        color: "var(--qt-text, #e2e8f0)",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        textTransform: "none",
                        px: 1.5,
                        py: 0.5,
                        borderRadius: "8px",
                        transition: "all 0.2s ease",
                        "&:hover": {
                          borderColor: "var(--qt-accent, #4cc3fa)",
                          color: "var(--qt-accent, #4cc3fa)",
                          background: "rgba(76, 195, 250, 0.08)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      IEEE Xplore
                    </Button>
                  </Box>
                </Box>
              </Paper>
            );
          })}
        </Box>
      </Box>
    </Box>
  );
}
