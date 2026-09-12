import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  Box,
  Typography,
  IconButton,
  Chip,
  Button,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PlayCircleFilledWhiteIcon from "@mui/icons-material/PlayCircleFilledWhite";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import { getAlgoVideoData } from "../../data/algoVideoData";

export default function VideoTutorialModal({
  open,
  onClose,
  algoId,
  algoName = "Quantum Algorithm",
}) {
  if (!open) return null;

  const video = getAlgoVideoData(algoId, algoName);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          background: "linear-gradient(145deg, #131722 0%, #0d1017 100%)",
          color: "var(--qt-text, #e2e8f0)",
          borderRadius: "16px",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          boxShadow: "0 24px 60px rgba(0, 0, 0, 0.8), 0 0 40px rgba(102, 126, 234, 0.15)",
          overflow: "hidden",
        },
      }}
    >
      {/* Dialog Header */}
      <DialogTitle
        sx={{
          m: 0,
          p: 2.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          background: "rgba(255, 255, 255, 0.02)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: "10px",
              background: "linear-gradient(135deg, #ff0844 0%, #ff4b2b 100%)",
              boxShadow: "0 4px 14px rgba(255, 8, 68, 0.4)",
              color: "#fff",
            }}
          >
            <PlayCircleFilledWhiteIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: "1.1rem" }}>
                {video.title}
              </Typography>
              <Chip
                icon={<AccessTimeIcon sx={{ fontSize: "14px !important", color: "#94a3b8" }} />}
                label={video.duration}
                size="small"
                sx={{
                  backgroundColor: "rgba(255, 255, 255, 0.06)",
                  color: "#cbd5e1",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  height: 24,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: "#94a3b8", display: "flex", alignItems: "center", gap: 0.5 }}>
              <VideoLibraryIcon sx={{ fontSize: 13 }} />
              Channel: <strong>{video.channel}</strong> • Algorithm: <strong>{algoName}</strong>
            </Typography>
          </Box>
        </Box>

        <IconButton
          onClick={onClose}
          aria-label="close"
          sx={{
            color: "#94a3b8",
            background: "rgba(255, 255, 255, 0.05)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            "&:hover": {
              background: "rgba(255, 255, 255, 0.12)",
              color: "#fff",
            },
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      {/* Dialog Body */}
      <DialogContent sx={{ p: 2.5 }}>
        {/* Responsive 16:9 YouTube Video Player Container */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            paddingTop: "56.25%", // 16:9 Aspect Ratio
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.6)",
            border: "1px solid rgba(255, 255, 255, 0.08)",
            backgroundColor: "#000",
          }}
        >
          <iframe
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

        {/* Video Information & Highlights */}
        <Box
          sx={{
            mt: 2.5,
            p: 2,
            borderRadius: "10px",
            background: "rgba(255, 255, 255, 0.03)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <Typography variant="body2" sx={{ color: "#cbd5e1", lineHeight: 1.6, mb: 1.5 }}>
            {video.description}
          </Typography>

          {video.highlights && video.highlights.length > 0 && (
            <Box sx={{ mt: 1 }}>
              <Typography
                variant="caption"
                sx={{
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 700,
                  color: "#94a3b8",
                  display: "block",
                  mb: 1,
                }}
              >
                Key Video Topics Covered
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                {video.highlights.map((item, idx) => (
                  <Chip
                    key={idx}
                    icon={<CheckCircleOutlineIcon sx={{ fontSize: "14px !important", color: "#68d391" }} />}
                    label={item}
                    size="small"
                    sx={{
                      backgroundColor: "rgba(104, 211, 145, 0.1)",
                      border: "1px solid rgba(104, 211, 145, 0.25)",
                      color: "#e2e8f0",
                      fontSize: "0.78rem",
                      fontWeight: 500,
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}

          {/* Fallback external link */}
          <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
            <Button
              size="small"
              endIcon={<OpenInNewIcon sx={{ fontSize: "14px !important" }} />}
              onClick={() => window.open(`https://www.youtube.com/watch?v=${video.videoId}`, "_blank")}
              sx={{
                color: "#94a3b8",
                fontSize: "0.78rem",
                textTransform: "none",
                "&:hover": {
                  color: "#e2e8f0",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                },
              }}
            >
              Open directly on YouTube
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
