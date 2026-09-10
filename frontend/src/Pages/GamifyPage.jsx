import React from "react";
import { Box } from "@mui/material";
import GameAssistant from "../Components/gamify/GameAssistant";

import "../Components/gamify/gamify.css";

export default function GamifyPage() {
  return (
    <Box
      className="gamify-root"
      sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        height: "100%",
      }}
    >
      <GameAssistant />
    </Box>
  );
}
