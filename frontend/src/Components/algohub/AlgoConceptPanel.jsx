import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Divider,
  Dialog,
  IconButton,
} from "@mui/material";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import CloseIcon from "@mui/icons-material/Close";
import SchoolIcon from "@mui/icons-material/School";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import PublicIcon from "@mui/icons-material/Public";
import FunctionsIcon from "@mui/icons-material/Functions";
import ListAltIcon from "@mui/icons-material/ListAlt";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import RocketLaunchIcon from "@mui/icons-material/RocketLaunch";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { algoTheoryData } from "../../data/algoTheoryData";

/* ── tiny reusable section header ── */
function SectionTitle({ icon, children }) {
  return (
    <Typography
      variant="subtitle1"
      sx={{
        fontWeight: 700,
        mb: 1.5,
        color: "var(--qt-text)",
        display: "flex",
        alignItems: "center",
        gap: 1,
      }}
    >
      {icon}
      {children}
    </Typography>
  );
}

export default function AlgoConceptPanel({ algorithm, algoId }) {
  const [imageZoomOpen, setImageZoomOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  const theory = (algoId && algoTheoryData[algoId]) || null;

  const title = theory?.title || algorithm?.name || "Quantum Algorithm";
  const subtitle = theory?.subtitle || algorithm?.description || "";
  const definition = theory?.definition || null;
  const bulletPoints = theory?.bulletPoints || [];
  const imageUrl = theory?.imageUrl || null;
  const imageCaption = theory?.imageCaption || "Conceptual diagram and quantum circuit";
  const overview = theory?.overview || algorithm?.description || "";
  const flow = theory?.flow || [];
  const example = theory?.example || null;
  const mathFormula = theory?.mathFormula || null;
  const mathExplanation = theory?.mathExplanation || null;
  const keyConcepts = theory?.keyConcepts || [];
  const applications = theory?.applications || [];
  const realWorldUse = theory?.realWorldUse || "";

  /* ─── card shared style ─── */
  const sectionCardSx = {
    p: 2,
    borderRadius: 2,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid var(--qt-border)",
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5, minWidth: 0 }}>
      {/* ═══════════ PRIMARY CARD ═══════════ */}
      <Card
        sx={{
          background: "var(--qt-surface-glass, var(--qt-surface))",
          border: "1px solid var(--qt-border)",
          borderRadius: 2.5,
          overflow: "hidden",
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.08)",
        }}
      >
        <CardContent
          sx={{ p: { xs: 2.5, md: 3 }, display: "flex", flexDirection: "column", gap: 2.5 }}
        >
          {/* ── Header Metadata ── */}
          <Box>
            <Box sx={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 1, mb: 1.5 }}>
              {algorithm?.estimatedTime && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 0.5,
                    color: "var(--qt-text-dim)",
                    fontSize: "0.8rem",
                  }}
                >
                  <AccessTimeIcon sx={{ fontSize: 16 }} />
                  {algorithm.estimatedTime}
                </Box>
              )}
            </Box>

            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "var(--qt-text)", lineHeight: 1.3, mb: 0.5 }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: "var(--qt-text-dim)", lineHeight: 1.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>

          {/* ── 1 — DEFINITION BOX ── */}
          {definition && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: "linear-gradient(135deg, rgba(76,195,250,0.08) 0%, rgba(118,75,162,0.08) 100%)",
                borderLeft: "4px solid var(--qt-accent, #4cc3fa)",
                border: "1px solid rgba(76,195,250,0.18)",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "var(--qt-accent, #4cc3fa)",
                  mb: 0.8,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                }}
              >
                <InfoOutlinedIcon sx={{ fontSize: 18 }} />
                What is it?
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "var(--qt-text)", lineHeight: 1.8, fontSize: "0.92rem" }}
              >
                {definition}
              </Typography>
            </Box>
          )}

          {/* ── 2 — BULLET POINTS (quick facts) ── */}
          {bulletPoints.length > 0 && (
            <Box sx={sectionCardSx}>
              <SectionTitle
                icon={<ListAltIcon sx={{ color: "var(--qt-accent, #4cc3fa)", fontSize: 20 }} />}
              >
                Quick Facts
              </SectionTitle>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8, pl: 0.5 }}>
                {bulletPoints.map((bp, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <Box
                      sx={{
                        minWidth: 6,
                        minHeight: 6,
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background: "var(--qt-accent, #4cc3fa)",
                        mt: "8px",
                        flexShrink: 0,
                      }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--qt-text-dim)", fontSize: "0.87rem", lineHeight: 1.7 }}
                    >
                      {bp}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* ── Key Concept Chips ── */}
          {keyConcepts.length > 0 && (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
              {keyConcepts.map((concept, idx) => (
                <Chip
                  key={idx}
                  label={concept}
                  size="small"
                  icon={
                    <AutoAwesomeIcon
                      sx={{ fontSize: "14px !important", color: "var(--qt-accent, #4cc3fa) !important" }}
                    />
                  }
                  sx={{
                    background: "rgba(255, 255, 255, 0.04)",
                    border: "1px solid var(--qt-border)",
                    color: "var(--qt-text)",
                    fontSize: "0.75rem",
                    borderRadius: "6px",
                  }}
                />
              ))}
            </Box>
          )}

          {/* ── Concept Image (only rendered if a valid image exists) ── */}
          {imageUrl && !imageError && (
            <Box
              sx={{
                position: "relative",
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid var(--qt-border)",
                background: "#0d1117",
                textAlign: "center",
                cursor: "pointer",
                transition: "transform 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                  borderColor: "var(--qt-accent, #4cc3fa)",
                  "& .zoom-btn": { opacity: 1 },
                },
              }}
              onClick={() => setImageZoomOpen(true)}
            >
              <Box
                component="img"
                src={imageUrl}
                alt={title}
                onError={() => setImageError(true)}
                sx={{
                  width: "100%",
                  maxHeight: 260,
                  objectFit: "contain",
                  p: 2,
                  display: "block",
                  background: "#fff",
                  filter: "contrast(1.05)",
                }}
              />
              <Box
                className="zoom-btn"
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "rgba(0,0,0,0.75)",
                  color: "#fff",
                  borderRadius: "50%",
                  p: 0.5,
                  opacity: 0.7,
                  transition: "opacity 0.2s",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                title="Click to zoom image"
              >
                <ZoomInIcon sx={{ fontSize: 20 }} />
              </Box>
              <Box
                sx={{
                  p: 1.2,
                  background: "rgba(0,0,0,0.7)",
                  borderTop: "1px solid var(--qt-border)",
                  color: "var(--qt-text-dim)",
                  fontSize: "0.78rem",
                  textAlign: "center",
                }}
              >
                {imageCaption}
              </Box>
            </Box>
          )}

          <Divider sx={{ borderColor: "var(--qt-border)" }} />

          {/* ── 3 — CONCEPT OVERVIEW ── */}
          {overview && (
            <Box>
              <SectionTitle
                icon={<SchoolIcon sx={{ color: "var(--qt-accent, #4cc3fa)", fontSize: 20 }} />}
              >
                How It Works
              </SectionTitle>
              <Typography
                variant="body2"
                sx={{
                  color: "var(--qt-text-dim)",
                  lineHeight: 1.8,
                  whiteSpace: "pre-line",
                  fontSize: "0.9rem",
                }}
              >
                {overview}
              </Typography>
            </Box>
          )}

          {/* ── 4 — STEP-BY-STEP FLOW ── */}
          {flow.length > 0 && (
            <Box>
              <SectionTitle
                icon={<ArrowForwardIcon sx={{ color: "#66bb6a", fontSize: 20 }} />}
              >
                Step-by-Step Flow
              </SectionTitle>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0 }}>
                {flow.map((item, idx) => (
                  <Box key={idx} sx={{ display: "flex", gap: 1.5 }}>
                    {/* vertical timeline */}
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        minWidth: 28,
                      }}
                    >
                      <Box
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: "50%",
                          background: "linear-gradient(135deg, #4cc3fa 0%, #764ba2 100%)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: "0.75rem",
                          color: "#fff",
                          flexShrink: 0,
                        }}
                      >
                        {idx + 1}
                      </Box>
                      {idx < flow.length - 1 && (
                        <Box
                          sx={{
                            width: 2,
                            flexGrow: 1,
                            minHeight: 16,
                            background: "rgba(76,195,250,0.25)",
                          }}
                        />
                      )}
                    </Box>
                    {/* content */}
                    <Box sx={{ pb: 2, minWidth: 0 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          color: "var(--qt-accent, #4cc3fa)",
                          fontSize: "0.85rem",
                          lineHeight: 1.8,
                        }}
                      >
                        {item.step}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "var(--qt-text-dim)",
                          fontSize: "0.84rem",
                          lineHeight: 1.6,
                        }}
                      >
                        {item.desc}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* ── 5 — EXAMPLE ── */}
          {example && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: "rgba(102,187,106,0.06)",
                border: "1px solid rgba(102,187,106,0.25)",
              }}
            >
              <SectionTitle
                icon={<LightbulbIcon sx={{ color: "#fdd835", fontSize: 20 }} />}
              >
                Example — {example.title}
              </SectionTitle>

              {/* input */}
              <Box
                sx={{
                  mb: 1.5,
                  p: 1.2,
                  borderRadius: 1.5,
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "var(--qt-accent, #4cc3fa)", letterSpacing: 0.5 }}
                >
                  INPUT
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--qt-text)", fontSize: "0.87rem", mt: 0.3 }}>
                  {example.input}
                </Typography>
              </Box>

              {/* steps */}
              {example.steps && example.steps.length > 0 && (
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.6, mb: 1.5, pl: 1 }}>
                  {example.steps.map((s, i) => (
                    <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 0.8 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: "var(--qt-accent, #4cc3fa)",
                          fontWeight: 700,
                          fontSize: "0.82rem",
                          minWidth: 20,
                        }}
                      >
                        {i + 1}.
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "var(--qt-text-dim)", fontSize: "0.84rem", lineHeight: 1.6 }}
                      >
                        {s}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              )}

              {/* output */}
              <Box
                sx={{
                  p: 1.2,
                  borderRadius: 1.5,
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(102,187,106,0.3)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontWeight: 700, color: "#66bb6a", letterSpacing: 0.5 }}
                >
                  OUTPUT
                </Typography>
                <Typography variant="body2" sx={{ color: "var(--qt-text)", fontSize: "0.87rem", mt: 0.3 }}>
                  {example.output}
                </Typography>
              </Box>
            </Box>
          )}

          {/* ── 6 — MATHEMATICAL FORMULATION ── */}
          {mathFormula && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background: "rgba(0, 0, 0, 0.25)",
                border: "1px solid rgba(76, 195, 250, 0.25)",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "var(--qt-accent, #4cc3fa)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 1,
                }}
              >
                <FunctionsIcon sx={{ fontSize: 18 }} />
                Math (Don't Worry — It's Simpler Than It Looks!)
              </Typography>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 1.5,
                  background: "#090d16",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  fontFamily: "'Fira Code', 'Consolas', monospace",
                  color: "#64ffda",
                  fontSize: "0.92rem",
                  textAlign: "center",
                  overflowX: "auto",
                  mb: 1,
                }}
              >
                {mathFormula}
              </Box>
              {mathExplanation && (
                <Typography
                  variant="body2"
                  sx={{ color: "var(--qt-text-dim)", lineHeight: 1.6, fontSize: "0.85rem" }}
                >
                  {mathExplanation}
                </Typography>
              )}
            </Box>
          )}

          {/* ── 7 — APPLICATIONS ── */}
          {applications.length > 0 && (
            <Box sx={sectionCardSx}>
              <SectionTitle
                icon={<RocketLaunchIcon sx={{ color: "#ff7043", fontSize: 20 }} />}
              >
                Where Is This Used?
              </SectionTitle>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8, pl: 0.5 }}>
                {applications.map((app, i) => (
                  <Box key={i} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <CheckCircleOutlineIcon
                      sx={{ color: "#4caf50", fontSize: 18, mt: 0.2, flexShrink: 0 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--qt-text-dim)", fontSize: "0.87rem", lineHeight: 1.6 }}
                    >
                      {app}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* ── 8 — REAL WORLD USE (summary) ── */}
          {realWorldUse && (
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                background:
                  "linear-gradient(135deg, rgba(76,195,250,0.06) 0%, rgba(118,75,162,0.06) 100%)",
                border: "1px solid rgba(76,195,250,0.2)",
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{
                  fontWeight: 700,
                  color: "var(--qt-text)",
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  mb: 0.8,
                }}
              >
                <PublicIcon sx={{ color: "var(--qt-accent, #4cc3fa)", fontSize: 18 }} />
                Why Does This Matter?
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "var(--qt-text-dim)", fontSize: "0.87rem", lineHeight: 1.7 }}
              >
                {realWorldUse}
              </Typography>
            </Box>
          )}

          {/* ── Learning Goals (from algorithm metadata) ── */}
          {algorithm?.learningGoals && algorithm.learningGoals.length > 0 && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, color: "var(--qt-text)", mb: 1 }}>
                Learning Goals
              </Typography>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 0.8 }}>
                {algorithm.learningGoals.map((goal, idx) => (
                  <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                    <CheckCircleOutlineIcon
                      sx={{ color: "#4caf50", fontSize: 18, mt: 0.2, flexShrink: 0 }}
                    />
                    <Typography
                      variant="body2"
                      sx={{ color: "var(--qt-text-dim)", fontSize: "0.85rem", lineHeight: 1.5 }}
                    >
                      {goal}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          )}

          {/* ── Expected Output ── */}
          {algorithm?.expectedOutput && (
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                background: "rgba(255,255,255,0.03)",
                border: "1px solid var(--qt-border)",
              }}
            >
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 700,
                  color: "var(--qt-text-dim)",
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  display: "block",
                  mb: 0.5,
                }}
              >
                Expected Simulation Output
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "var(--qt-text)", fontWeight: 600, fontSize: "0.85rem" }}
              >
                {algorithm.expectedOutput}
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ═══════════ FULLSCREEN IMAGE ZOOM ═══════════ */}
      {imageUrl && (
        <Dialog
          open={imageZoomOpen}
          onClose={() => setImageZoomOpen(false)}
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              background: "#0d1117",
              border: "1px solid var(--qt-border)",
              borderRadius: 3,
              p: 2,
              position: "relative",
            },
          }}
        >
          <IconButton
            onClick={() => setImageZoomOpen(false)}
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              background: "rgba(255,255,255,0.1)",
              color: "#fff",
              "&:hover": { background: "rgba(255,255,255,0.2)" },
            }}
          >
            <CloseIcon />
          </IconButton>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "#fff", mb: 1, pr: 5 }}>
            {title} - Concept Diagram
          </Typography>
          <Box
            component="img"
            src={imageUrl}
            alt={title}
            sx={{
              width: "100%",
              maxHeight: "75vh",
              objectFit: "contain",
              borderRadius: 2,
              background: "#fff",
              p: 2,
            }}
          />
          <Typography variant="body2" sx={{ color: "var(--qt-text-dim)", mt: 1.5, textAlign: "center" }}>
            {imageCaption}
          </Typography>
        </Dialog>
      )}
    </Box>
  );
}
