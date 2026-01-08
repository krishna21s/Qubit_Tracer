import React from "react";
import { useTemplate } from "../../context/TemplateContext";
import { THEME_TEMPLATES } from "../../themeTemplates";
import TemplateCard from "./TemplateCard";

export default function TemplateGallery() {
  const { templateId, applyTemplate } = useTemplate();

  return (
    <section >
      <h2 style={{ fontSize: 24, fontWeight: 700 }}>
        Choose a Theme
      </h2>

      <p
        style={{
          fontSize: 14,
          color: "var(--qt-text-dim)",
          marginBottom: 26,
        }}
      >
        Select a visual experience. Cards remain static for comparison.
      </p>

      <div
        style={{
          display:"flex",
          justifyContent:"space-between",
          flexWrap: "wrap",


         
        }}
      >
        {THEME_TEMPLATES.map((t) => (
          <TemplateCard
            key={t.id}
            template={t}
            selected={t.id === templateId}
            onSelect={applyTemplate}
          />
        ))}
      </div>
    </section>
  );
}
