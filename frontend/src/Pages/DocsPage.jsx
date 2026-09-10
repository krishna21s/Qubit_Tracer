import React from "react";
import { useParams } from "react-router-dom";
import DocsHome from "../Components/docs/DocsHome";
import DocsViewer from "../Components/docs/DocsViewer";

import "../Components/docs/docs.css";

export default function DocsPage() {
  const { slug } = useParams();

  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {!slug && <DocsHome />}
      {slug && <DocsViewer />}
    </div>
  );
}
