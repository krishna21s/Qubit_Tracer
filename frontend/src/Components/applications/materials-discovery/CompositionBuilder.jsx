import React, { useMemo } from "react";
import { Box, Typography, Chip, Slider, Stack, IconButton } from "@mui/material";
import RemoveCircleOutlineIcon from "@mui/icons-material/RemoveCircleOutline";
import "../../../styles/materialsDiscovery.css";

function normalizeRatios(ratios) {
  const values = Object.values(ratios).filter((v) => v > 0);
  if (!values.length) return {};
  const min = Math.min(...values);
  const scaled = Object.fromEntries(Object.entries(ratios).map(([k, v]) => [k, v / min]));
  // Round to nearest tenth then to int if close
  return Object.fromEntries(
    Object.entries(scaled).map(([k, v]) => {
      const rounded = Math.round(v * 10) / 10;
      const maybeInt = Math.round(rounded);
      return [k, Math.abs(maybeInt - rounded) < 0.05 ? maybeInt : rounded];
    })
  );
}

export default function CompositionBuilder({ selected, ratios, onRatioChange, onRemove }) {
  const normalized = useMemo(() => normalizeRatios(ratios), [ratios]);

  const formula = useMemo(() => {
    if (!selected.length) return "";
    return selected
      .map((el) => {
        const part = normalized[el.symbol] ?? 0;
        if (part === 0) return null;
        return `${el.symbol}${part === 1 ? "" : part}`;
      })
      .filter(Boolean)
      .join("");
  }, [normalized, selected]);

  return (
    <Box className="mdc-builder">
      <Typography variant="body2" sx={{ color: "var(--qt-text-dim)" }}>
        Adjust element ratios to refine the compound composition. Max 5 elements.
      </Typography>

      <div className="mdc-chip-row">
        {selected.map((el) => (
          <Chip
            key={el.symbol}
            label={`${el.symbol} — ${el.name}`}
            color="primary"
            variant="filled"
            sx={{
              background: "var(--qt-surface-alt)",
              color: "var(--qt-text)",
              border: "1px solid var(--qt-border)",
              '& .MuiChip-deleteIcon': { color: "var(--qt-text-dim)" },
            }}
            onDelete={() => onRemove(el.symbol)}
            deleteIcon={<RemoveCircleOutlineIcon />}
          />
        ))}
        {!selected.length && <Typography variant="body2" sx={{ color: "var(--qt-text-dim)" }}>Select elements on the table.</Typography>}
      </div>

      <Stack spacing={1.5}>
        {selected.map((el) => (
          <Box key={el.symbol} className="mdc-slider-row">
            <Typography variant="body2" sx={{ minWidth: 42, color: "var(--qt-text)" }}>
              {el.symbol}
            </Typography>
            <Slider
              size="small"
              min={0.1}
              max={1.5}
              step={0.05}
              value={ratios[el.symbol] ?? 0.5}
              onChange={(_, v) => onRatioChange(el.symbol, Number(v))}
              sx={{ flexGrow: 1, color: "var(--qt-accent)" }}
            />
            <Typography variant="body2" sx={{ width: 52, textAlign: "right", color: "var(--qt-text)" }}>
              {ratios[el.symbol]?.toFixed(2)}
            </Typography>
            <IconButton size="small" onClick={() => onRemove(el.symbol)}>
              <RemoveCircleOutlineIcon fontSize="small" />
            </IconButton>
          </Box>
        ))}
      </Stack>

      <Box className="mdc-formula">
        <Typography variant="overline" sx={{ color: "var(--qt-text-dim)", letterSpacing: 1 }}>Compound Formula</Typography>
        <Typography variant="h6" sx={{ fontWeight: 800, color: "var(--qt-text)" }}>
          {formula || "Select elements"}
        </Typography>
      </Box>
    </Box>
  );
}
