import React from "react";
import { THEME_PREVIEWS } from "../../themeCircleBg";

export default function TemplateCard({ template, selected, onSelect }) {
  const preview = THEME_PREVIEWS[template.id];

  return (
    <div
      onClick={() => onSelect(template.id)}
      style={{
        borderRadius: 18,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        cursor: "pointer",
      }}
    >
      {/* Circular Preview */}
      <div
        style={{
          width: 120,
          height: 120,
          borderRadius: "50%",
          background: preview?.background,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 20,
          fontWeight: 600,

          /* 👇 THIS IS THE KEY PART */
          border: selected
            ? "4px solid #ffffff"
            : "1px solid #ffffff",

          boxShadow: "0 0px 30px rgba(0,0,0,0.35)",
        }}
      >
      </div>

      {/* Name */}
      <div
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--qt-text)",
          textAlign: "center",
          marginTop: 12,
        }}
      >
        {template.name}
      </div>

      {/* Tagline */}
   
    </div>
  );
}
