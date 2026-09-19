import React from "react";
import { Box } from "@mui/material";
import QuantumQuestRoadmap from "../Components/gamify/QuantumQuestRoadmap";

export default function QuantumRoadPage() {
  return (
    <Box
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <QuantumQuestRoadmap />
    </Box>
  );
}
