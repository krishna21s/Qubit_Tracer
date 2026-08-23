import React from "react";
import { Popover, Box } from "@mui/material";
import { useTemplate } from "../../context/TemplateContext";
import { THEME_TEMPLATES } from "../../themeTemplates";
import { THEME_PREVIEWS } from "../../themeCircleBg";

/**
 * Compact glossy theme picker popup with 2×3 grid of theme circles.
 * Opens from app bar icon button.
 */
export default function ThemePickerPopup({ anchorEl, open, onClose }) {
  const { templateId, applyTemplate } = useTemplate();

  const handleSelect = (id) => {
    applyTemplate(id);
    onClose();
  };

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
      slotProps={{
        paper: {
          sx: {
            mt: 1,
            borderRadius: 3,
            background: "var(--qt-surface-glass, rgba(15,25,35,0.92))",
            backdropFilter: "blur(16px)",
            border: "1px solid var(--qt-border, rgba(100,200,255,0.15))",
            boxShadow: "0 12px 40px rgba(0,0,0,0.4)",
            overflow: "hidden",
            minWidth: 280,
          },
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          px: 2,
          py: 1.5,
          borderBottom: "1px solid var(--qt-border, rgba(100,200,255,0.1))",
          background: "rgba(0,0,0,0.15)",
        }}
      >
        <Box
          sx={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--qt-text, #e0f7fa)",
            letterSpacing: 0.5,
          }}
        >
          Choose Theme
        </Box>
      </Box>

      {/* 2×3 Grid */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 1.5,
          p: 2,
        }}
      >
        {THEME_TEMPLATES.map((template) => {
          const preview = THEME_PREVIEWS[template.id];
          const isSelected = template.id === templateId;

          return (
            <Box
              key={template.id}
              onClick={() => handleSelect(template.id)}
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                cursor: "pointer",
                p: 1,
                borderRadius: 2,
                transition: "all 0.2s ease",
                background: isSelected
                  ? "rgba(100,255,218,0.1)"
                  : "transparent",
                "&:hover": {
                  background: isSelected
                    ? "rgba(100,255,218,0.15)"
                    : "rgba(255,255,255,0.05)",
                  transform: "scale(1.05)",
                },
              }}
            >
              {/* Circular Preview */}
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: "50%",
                  background: preview?.background || "linear-gradient(135deg, #333, #111)",
                  border: isSelected
                    ? "3px solid var(--qt-accent, #64ffda)"
                    : "2px solid rgba(255,255,255,0.2)",
                  boxShadow: isSelected
                    ? "0 0 12px rgba(100,255,218,0.4)"
                    : "0 4px 12px rgba(0,0,0,0.3)",
                  transition: "all 0.2s ease",
                }}
              />

              {/* Name */}
              <Box
                sx={{
                  mt: 1,
                  fontSize: 10,
                  fontWeight: isSelected ? 600 : 500,
                  color: isSelected
                    ? "var(--qt-accent, #64ffda)"
                    : "var(--qt-text-dim, #9fb4c8)",
                  textAlign: "center",
                  lineHeight: 1.2,
                  maxWidth: 70,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {template.name}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Popover>
  );
}
