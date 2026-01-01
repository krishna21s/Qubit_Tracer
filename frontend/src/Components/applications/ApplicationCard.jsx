import React from "react";
import { Paper, Typography, Chip, Stack, Button, Box, Avatar } from "@mui/material";

export default function ApplicationCard({
  title,
  subtitle,
  description,
  tags = [],
  status = "available",
  onClick,
  actionLabel = "Open",
  icon,
}) {
  const statusCopy = {
    available: { label: "Available", color: "var(--qt-accent)" },
    preview: { label: "Preview", color: "#ff9800" },
    upcoming: { label: "Coming Soon", color: "#9ca3af" },
  }[status] || { label: status, color: "var(--qt-text-dim)" };

  return (
    <Paper
      variant="outlined"
      className="qt-app-card"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2.5,
        borderRadius: 3,
        borderColor: "var(--qt-border)",
        background: "var(--qt-surface)",
        color: "var(--qt-text)",
        minHeight: 320,
        justifyContent: "space-between",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1.5 }}>
        <Avatar
          variant="rounded"
          sx={{
            bgcolor: "var(--qt-surface-alt)",
            border: "1px solid var(--qt-border)",
            color: "var(--qt-accent)",
            width: 44,
            height: 44,
            fontSize: 24,
          }}
        >
          {icon || title?.[0] || ""}
        </Avatar>
        <Box sx={{ flexGrow: 1 }}>
          <Typography variant="overline" sx={{ color: "var(--qt-text-dim)", letterSpacing: 0.5 }}>
            {subtitle}
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: "var(--qt-text)", lineHeight: 1.1 }}>
            {title}
          </Typography>
        </Box>
        <Chip
          size="small"
          label={statusCopy.label}
          sx={{
            bgcolor: `${statusCopy.color}22`,
            color: statusCopy.color,
            border: `1px solid ${statusCopy.color}55`,
            fontWeight: 600,
          }}
        />
      </Box>
      <Typography variant="body2" sx={{ color: "var(--qt-text-dim)", lineHeight: 1.6 }}>
        {description}
      </Typography>

      {tags?.length > 0 && (
        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
          {tags.map((tag) => (
            <Chip
              key={tag}
              label={tag}
              size="small"
              sx={{
                bgcolor: "var(--qt-surface-alt)",
                color: "var(--qt-text)",
                border: "1px solid var(--qt-border)",
                fontWeight: 600,
              }}
            />
          ))}
        </Stack>
      )}

      <Box sx={{ display: "flex", justifyContent: "flex-start" }}>
        <Button
          variant="contained"
          color="primary"
          onClick={onClick}
          sx={{
            px: 2.5,
            borderRadius: 2,
            background: "var(--qt-button-primary)",
            color: "#fff",
            textTransform: "none",
            fontWeight: 700,
            '&:hover': { background: "var(--qt-button-primary-hover)" },
          }}
        >
          {actionLabel}
        </Button>
      </Box>
    </Paper>
  );
}
