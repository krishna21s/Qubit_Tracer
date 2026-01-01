import React, { useMemo } from "react";
import { Tooltip } from "@mui/material";
import { ELEMENTS, CATEGORY_STYLES } from "./elements";
import "../../../styles/materialsDiscovery.css";

const categoryColor = (category) => {
  const map = {
    alkali: "linear-gradient(145deg, #ff9a9e, #fad0c4)",
    alkaline: "linear-gradient(145deg, #ffecd2, #fcb69f)",
    transition: "linear-gradient(145deg, #d4fc79, #96e6a1)",
    "post-transition": "linear-gradient(145deg, #cfd9df, #e2ebf0)",
    post: "linear-gradient(145deg, #cfd9df, #e2ebf0)",
    metalloid: "linear-gradient(145deg, #a1c4fd, #c2e9fb)",
    nonmetal: "linear-gradient(145deg, #84fab0, #8fd3f4)",
    halogen: "linear-gradient(145deg, #f093fb, #f5576c)",
    noble: "linear-gradient(145deg, #f6d365, #fda085)",
    lanthanide: "linear-gradient(145deg, #d4a1f9, #a18cd1)",
    actinide: "linear-gradient(145deg, #fbc2eb, #a6c1ee)",
  };
  return map[category] || "var(--qt-surface)";
};

export default function PeriodicTable({
  selectedSymbols,
  onToggle,
  maxSelectable = 5,
}) {
  const selectedSet = useMemo(
    () => new Set(selectedSymbols),
    [selectedSymbols]
  );

  return (
    <div className="mdc-periodic">
      {ELEMENTS.map((el) => {
        const isSelected = selectedSet.has(el.symbol);
        const disabled = !isSelected && selectedSet.size >= maxSelectable;
        const style = {
          gridRow: el.row,
          gridColumn: el.col,
          background: categoryColor(el.category),
          color: "#0d1a26",
        };

        return (
          <Tooltip
            key={el.symbol}
            title={`${el.name} (Z=${el.atomicNumber})`}
            arrow
          >
            <div
              className={`mdc-element ${isSelected ? "selected" : ""} ${
                disabled ? "disabled" : ""
              }`}
              style={style}
              onClick={() => !disabled && onToggle(el)}
            >
              <div className="mdc-atomic-number">{el.atomicNumber}</div>
              <div className="mdc-symbol">{el.symbol}</div>
            </div>
          </Tooltip>
        );
      })}
    </div>
  );
}

export function PeriodicLegend() {
  return (
    <div className="mdc-legend">
      {Object.entries(CATEGORY_STYLES).map(([key, meta]) => (
        <span key={key} className="mdc-legend-item">
          <span
            className="mdc-legend-swatch"
            style={{ background: categoryColor(key) }}
          />
          {meta.label}
        </span>
      ))}
    </div>
  );
}
