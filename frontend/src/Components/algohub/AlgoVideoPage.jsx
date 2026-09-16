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
        <div className="lp-header-left">
          <IconButton
            onClick={onBack}
            title="Back to Algorithm Overview"
            sx={{
              background: "var(--qt-surface)",
              border: "1px solid var(--qt-border)",
              color: "var(--qt-text)",
              "&:hover": {
                background: "var(--qt-surface-alt)",
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
                sx={{ fontWeight: 700, color: "var(--qt-text)", mb: 0.5 }}
              >
                {algorithm?.name || "Algorithm"}
              </Typography>
              <Chip
                icon={<PlayCircleFilledWhiteIcon sx={{ fontSize: "15px !important", color: "var(--qt-accent)" }} />}
                label="Video Tutorial"
                size="small"
                sx={{
                  background: "var(--qt-surface-alt)",
                  color: "var(--qt-accent)",
                  border: "1px solid var(--qt-border)",
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
            <Typography variant="body2" sx={{ color: "var(--qt-text-dim)" }}>
              Official video explanation and step-by-step visual demonstration
            </Typography>
          </Box>
        </div>
      </Box>

      {/* Main Video Presentation Grid */}
      <Box sx={{ width: "100%", maxWidth: 1200, mx: "auto" }}>
        {/* Cinema-Style Video Theater Container */}
        <Paper
          elevation={0}
          sx={{
            background: "var(--qt-surface)",
            borderRadius: "16px",
            border: "1px solid var(--qt-border)",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
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
          <Box sx={{ p: 3, borderTop: "1px solid var(--qt-border)" }}>
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
                <Typography variant="h5" sx={{ fontWeight: 700, color: "var(--qt-text)", mb: 0.5 }}>
                  {video.title}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, flexWrap: "wrap" }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--qt-text-dim)", display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <VideoLibraryIcon sx={{ fontSize: 16, color: "var(--qt-accent)" }} />
                    Channel: <strong style={{ color: "var(--qt-text)" }}>{video.channel}</strong>
                  </Typography>
                  <Typography variant="body2" sx={{ color: "var(--qt-text-dim)" }}>
                    •
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ color: "var(--qt-text-dim)", display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <AccessTimeIcon sx={{ fontSize: 16, color: "var(--qt-accent)" }} />
                    Duration: <strong style={{ color: "var(--qt-text)" }}>{video.duration}</strong>
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
                    borderColor: "var(--qt-border)",
                    color: "var(--qt-text-dim)",
                    textTransform: "none",
                    borderRadius: "20px",
                    "&:hover": {
                      borderColor: "var(--qt-accent)",
                      color: "var(--qt-accent)",
                      background: "var(--qt-surface-alt)",
                    },
                  }}
                >
                  Open on YouTube
                </Button>
              </Box>
            </Box>


            <Typography variant="body1" sx={{ color: "var(--qt-text)", lineHeight: 1.7, mb: 3 }}>
              {video.description}
            </Typography>

            {/* Key Concepts Chips */}
            {video.highlights && video.highlights.length > 0 && (
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: "12px",
                  background: "var(--qt-surface-alt)",
                  border: "1px solid var(--qt-border)",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    fontWeight: 700,
                    color: "var(--qt-text-dim)",
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
                      icon={<CheckCircleOutlineIcon sx={{ fontSize: "15px !important", color: "var(--qt-accent)" }} />}
                      label={item}
                      sx={{
                        backgroundColor: "var(--qt-surface)",
                        border: "1px solid var(--qt-border)",
                        color: "var(--qt-text)",
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

