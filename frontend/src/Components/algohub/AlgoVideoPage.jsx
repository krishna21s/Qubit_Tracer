import React, { useRef, useEffect } from "react";
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  Paper,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { getAlgoVideoData } from "../../data/algoVideoData";
import { getDifficultyLevel } from "../../data/algorithmTemplates";

export default function AlgoVideoPage({
  algorithm,
  algoId,
  onBack,
}) {
  const video = getAlgoVideoData(algoId, algorithm?.name || "Quantum Algorithm");
  const difficultyInfo = algorithm ? getDifficultyLevel(algorithm.difficulty) : null;
  const iframeRef = useRef(null);

  useEffect(() => {
    // Automatically unmute and set standard volume when video loads
    const timer = setTimeout(() => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "unMute", args: [] }),
          "*"
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "setVolume", args: [100] }),
          "*"
        );
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [video.videoId]);

  return (
    <Box sx={{ width: "100%", pb: 5 }}>
      {/* Top Header Navigation Bar */}
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
                icon={<PlayCircleFilledWhiteIcon sx={{ fontSize: "15px !important", color: "#ff4b2b" }} />}
                label="Video Tutorial"
                size="small"
                sx={{
                  background: "rgba(255, 75, 43, 0.12)",
                  color: "#ff6b4a",
                  border: "1px solid rgba(255, 75, 43, 0.3)",
                  fontWeight: 600,
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
              Official video explanation and step-by-step visual demonstration
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Main Video Presentation Grid */}
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
        {/* Cinema-Style Video Theater Container */}
        <Paper
          elevation={0}
          sx={{
            background: "linear-gradient(145deg, #131722 0%, #0c1018 100%)",
            borderRadius: "16px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7), 0 0 30px rgba(102, 126, 234, 0.15)",
            overflow: "hidden",
            mb: 3,
          }}
        >
          {/* Responsive 16:9 Aspect Ratio IFrame */}
          <Box
            sx={{
              position: "relative",
              width: "100%",
              paddingTop: "56.25%", // 16:9 Aspect Ratio
              backgroundColor: "#000",
            }}
          >
            <iframe
              ref={iframeRef}
              src={`https://www.youtube-nocookie.com/embed/${video.videoId}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1`}
              title={video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: "none",
              }}
            />
          </Box>

          {/* Under-Video Details Bar */}
          <Box sx={{ p: 3, borderTop: "1px solid rgba(255, 255, 255, 0.08)" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 2,
                mb: 2,
              }}
            >
              <Box>
                <Typography variant="h5" sx={{ fontWeight: 700, color: "#fff", mb: 0.5 }}>
                  {video.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <VideoLibraryIcon sx={{ fontSize: 16, color: "#667eea" }} />
                    Channel: <strong style={{ color: "#e2e8f0" }}>{video.channel}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#64748b" }}>
                    •
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <AccessTimeIcon sx={{ fontSize: 16, color: "#68d391" }} />
                    Duration: <strong style={{ color: "#e2e8f0" }}>{video.duration}</strong>
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Button
                  size="small"
                  variant="outlined"
                  endIcon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
                  onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, "_blank")}
                  sx={{
                    borderColor: "rgba(255, 255, 255, 0.15)",
                    color: "#94a3b8",
                    textTransform: "none",
                    "&:hover": {
                      borderColor: "#ff4b2b",
                      color: "#fff",
                      background: "rgba(255, 75, 43, 0.08)",
                    },
                  }}
                >
                  Open on YouTube
                </Button>
              </Box>
            </Box>


            <Typography variant="body1" sx={{ color: "#cbd5e1", lineHeight: 1.7, mb: 3 }}>
              {video.description}
            </Typography>

            {/* Key Concepts Chips */}
            {video.highlights && video.highlights.length > 0 && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: "12px",
                  background: "rgba(255, 255, 255, 0.03)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                    color: "#94a3b8",
                    display: "block",
                    mb: 1.5,
                  }}
                >
                  Key Topics & Insights in this Video
                </Typography>
                <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap" }}>
                  {video.highlights.map((item, idx) => (
                    <Chip
                      key={idx}
                      icon={<CheckCircleOutlineIcon sx={{ fontSize: "15px !important", color: "#68d391" }} />}
                      label={item}
                      sx={{
                        backgroundColor: "rgba(104, 211, 145, 0.1)",
                        border: "1px solid rgba(104, 211, 145, 0.25)",
                        color: "#e2e8f0",
                        fontSize: "0.82rem",
                        fontWeight: 500,
                        py: 0.5,
                      }}
                    />
                  ))}
                </Box>
              </Box>
            )}
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}

