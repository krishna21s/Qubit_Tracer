import React from "react";
import { Box, Container, Paper } from "@mui/material";
import AlgoHubContent from "../Components/algohub/AlgoHubContent";

export default function AlgoHubPage() {
  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: (theme) =>
          theme.palette.mode === "dark"
            ? "radial-gradient(circle at 25% 20%, #0b2734, #03141d)"
            : "linear-gradient(180deg, #f0f6fa, #dfe9f1)",
        py: 4,
      }}
    >
      <Container maxWidth="xl">
        <Paper
          elevation={0}
          sx={{
            background: "var(--qt-surface-glass, var(--qt-surface))",
            border: "1px solid var(--qt-border)",
            borderRadius: 3,
            p: { xs: 2, sm: 3, md: 4 },
            backdropFilter: "blur(10px)",
          }}
        >
          <AlgoHubContent />
        </Paper>
      </Container>
    </Box>
  );
}
