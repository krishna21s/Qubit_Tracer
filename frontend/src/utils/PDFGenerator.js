import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import autoTable from "jspdf-autotable";

// --- DESIGN (unchanged) ---
const DESIGN = {
  colors: {
    bgPrimary: "#0F172A",
    bgSecondary: "#1E293B",
    accent: "#3B82F6",
    textPrimary: "#F1F5F9",
    textSecondary: "#94A3B8",
    textMuted: "#64748B",
    textInverse: "#FFFFFF",
    border: "#334155",
    shadow: "#0D1424",
  },
  typography: {
    h1: 16,
    h2: 12,
    h3: 10,
    body: 9,
    small: 8,
    caption: 7,
  },
  spacing: {
    xs: 2,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
  },
  layout: {
    margin: 15,
    contentWidth: 180,
    colWidth: 85,
    colSpacing: 10,
    headerHeight: 25,
    footerHeight: 15,
  },
};

// --- Helper functions (unchanged) ---
const addPageLayout = (pdf, pageNumber = 1) => {
  pdf.setFillColor(DESIGN.colors.bgPrimary);
  pdf.rect(0, 0, 210, 297, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(DESIGN.typography.h1);
  pdf.setTextColor(DESIGN.colors.textInverse);
  pdf.text("Qubit-Tracer", DESIGN.layout.margin, 15);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(DESIGN.typography.h3);
  pdf.setTextColor(DESIGN.colors.textSecondary);
  pdf.text("Quantum Simulation Report", DESIGN.layout.margin + 40, 15);
  const dateStr = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  pdf.setFontSize(DESIGN.typography.small);
  pdf.setTextColor(DESIGN.colors.textMuted);
  pdf.text(dateStr, 210 - DESIGN.layout.margin, 15, { align: "right" });
  pdf.text(`Page ${pageNumber}`, 210 - DESIGN.layout.margin, 20, {
    align: "right",
  });
  pdf.setDrawColor(DESIGN.colors.border);
  pdf.setLineWidth(0.2);
  pdf.line(
    DESIGN.layout.margin,
    DESIGN.layout.headerHeight,
    210 - DESIGN.layout.margin,
    DESIGN.layout.headerHeight
  );
};

const addFooter = (pdf) => {
  const pageCount = pdf.internal.getNumberOfPages();
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(DESIGN.typography.small);
  pdf.setTextColor(DESIGN.colors.textMuted);
  for (let i = 1; i <= pageCount; i++) {
    pdf.setPage(i);
    pdf.setDrawColor(DESIGN.colors.border);
    pdf.setLineWidth(0.2);
    pdf.line(
      DESIGN.layout.margin,
      297 - DESIGN.layout.footerHeight,
      210 - DESIGN.layout.margin,
      297 - DESIGN.layout.footerHeight
    );
    pdf.text(
      "© Qubit-Tracer Professional Analysis",
      DESIGN.layout.margin,
      297 - DESIGN.layout.footerHeight + 8
    );
  }
};

const captureElement = async (element) => {
  if (!element || element.childElementCount === 0) return null;
  try {
    const canvas = await html2canvas(element, {
      backgroundColor: DESIGN.colors.bgPrimary,
      scale: 3,
      useCORS: true,
      logging: false,
    });
    return canvas.toDataURL("image/png", 1.0);
  } catch (error) {
    console.error("Error capturing element:", error);
    return null;
  }
};

const addSectionHeader = (
  pdf,
  icon,
  title,
  yOffset,
  xOffset = DESIGN.layout.margin
) => {
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(DESIGN.typography.h2);
  pdf.setTextColor(DESIGN.colors.accent);
  pdf.text(`${icon} ${title}`, xOffset, yOffset);
  return yOffset + DESIGN.spacing.md;
};

const add3DCard = (pdf, x, y, width, height) => {
  pdf.setFillColor(DESIGN.colors.shadow);
  pdf.roundedRect(x + 0.5, y + 0.5, width, height, 1.5, 1.5, "F");
  pdf.setFillColor(DESIGN.colors.bgSecondary);
  pdf.setDrawColor(DESIGN.colors.border);
  pdf.setLineWidth(0.2);
  pdf.roundedRect(x, y, width, height, 1.5, 1.5, "FD");
};

const smartPageBreak = (pdf, currentY, requiredHeight, currentPage) => {
  const maxY = 297 - DESIGN.layout.footerHeight - DESIGN.layout.margin;
  if (currentY + requiredHeight > maxY) {
    pdf.addPage();
    addPageLayout(pdf, currentPage + 1);
    return {
      y: DESIGN.layout.headerHeight + DESIGN.spacing.lg,
      page: currentPage + 1,
    };
  }
  return { y: currentY, page: currentPage };
};

// Keep the detailed formatRawData for any textual fallback (unchanged)
const formatRawData = (simulationResult) => {
  const formattedText = [];

  // Bloch vectors
  formattedText.push("Bloch Vectors:");
  if (
    Array.isArray(simulationResult?.bloch_vectors) &&
    simulationResult.bloch_vectors.length > 0
  ) {
    simulationResult.bloch_vectors.forEach((vec, i) => {
      if (Array.isArray(vec)) {
        formattedText.push(
          `  Q${i}: [${vec
            .map((v) => (typeof v === "number" ? v.toFixed(3) : "N/A"))
            .join(", ")}]`
        );
      } else {
        formattedText.push(`  Q${i}: Invalid vector format`);
      }
    });
  } else {
    formattedText.push("  N/A");
  }

  // Density matrices
  formattedText.push("");
  formattedText.push("Density Matrix:");
  if (
    Array.isArray(simulationResult?.density_matrices) &&
    simulationResult.density_matrices.length > 0
  ) {
    simulationResult.density_matrices.forEach((matrix, i) => {
      formattedText.push(`  Q${i}:`);
      if (Array.isArray(matrix)) {
        matrix.forEach((row) => {
          if (Array.isArray(row)) {
            const rowStr = row
              .map((c) => {
                if (typeof c === "number") return c.toFixed(3);
                if (
                  Array.isArray(c) &&
                  c.length === 2 &&
                  typeof c[0] === "number" &&
                  typeof c[1] === "number"
                ) {
                  const real = c[0].toFixed(3);
                  const imag = c[1].toFixed(3);
                  return `${real}${c[1] >= 0 ? "+" : ""}${imag}i`;
                }
                return "N/A";
              })
              .join(", ");
            formattedText.push(`    [ ${rowStr} ]`);
          } else {
            formattedText.push("Invalid row");
          }
        });
      } else {
        formattedText.push("Invalid matrix format.");
      }
    });
  } else {
    formattedText.push("N/A");
  }

  return formattedText;
};

// --- Main PDF Generation Function ---
export const generateReportPDF = async (data) => {
  const {
    simulationResult,
    analysisText,
    blochSpheresRef,
    probabilityChartRef,
    amplitudeWavesRef,
  } = data;
  const pdf = new jsPDF("p", "mm", "a4");
  let currentPage = 1,
    yOffset = DESIGN.layout.headerHeight + DESIGN.spacing.lg,
    pb;
  addPageLayout(pdf, currentPage);

  // --- helpers inside generateReportPDF ---

  // 1) normalize amplitudes so table only uses real values (or N/A)
  const normalizeAmplitudes = (amps) => {
    if (!amps) return [];
    if (Array.isArray(amps)) {
      return amps.map((a, i) => ({
        state: a.state ?? `|${i}⟩`,
        re:
          typeof a.re === "number"
            ? a.re
            : typeof a[0] === "number"
            ? a[0]
            : null,
        im:
          typeof a.im === "number"
            ? a.im
            : typeof a[1] === "number"
            ? a[1]
            : null,
        prob: typeof a.prob === "number" ? a.prob : null,
      }));
    }
    if (typeof amps === "object") {
      return Object.entries(amps).map(([state, val]) => {
        if (val == null) return { state, re: null, im: null, prob: null };
        if (typeof val === "object" && !Array.isArray(val)) {
          return {
            state,
            re: typeof val.re === "number" ? val.re : null,
            im: typeof val.im === "number" ? val.im : null,
            prob: typeof val.prob === "number" ? val.prob : null,
          };
        }
        if (Array.isArray(val)) {
          return {
            state,
            re: typeof val[0] === "number" ? val[0] : null,
            im: typeof val[1] === "number" ? val[1] : null,
            prob: typeof val.prob === "number" ? val.prob : null,
          };
        }
        return { state, re: null, im: null, prob: null };
      });
    }
    return [];
  };

  // 2) Render raw simulation data as structured tables/text (function declaration -> hoisted)
  function renderRawSimulationData(pdfArg, simRes, startX, startY) {
    const x = startX;
    let y = startY;
    const cw = DESIGN.layout.colWidth;
    const padding = 4;

    const safeStr = (v) =>
      typeof v === "string" && v.trim().length > 0 ? v : "N/A";
    const safeNum = (v, dp = 3) =>
      typeof v === "number" ? v.toFixed(dp) : "N/A";

    // 1) metadata
    const metaRows = [
      ["Circuit (openqasm)", safeStr(simRes?.openqasm)],
      ["Shots", simRes?.shots ?? simRes?.shot_count ?? "N/A"],
      ["Backend", simRes?.backend ?? "N/A"],
      ["Seed", simRes?.seed ?? "N/A"],
      ["Timestamp", simRes?.timestamp ?? "N/A"],
    ];
    autoTable(pdfArg, {
      startY: y,
      margin: { left: x },
      head: [["Field", "Value"]],
      body: metaRows,
      theme: "grid",
      styles: {
        fontSize: DESIGN.typography.small,
        cellPadding: 2,
        overflow: "linebreak",
        fillColor: DESIGN.colors.bgSecondary,
        textColor: DESIGN.colors.textPrimary,
      },
      headStyles: {
        fillColor: DESIGN.colors.accent,
        textColor: DESIGN.colors.textInverse,
      },
      columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: cw - 30 } },
    });
    y = pdfArg.lastAutoTable.finalY + DESIGN.spacing.sm;

    // 2) Bloch vectors
    const bloch = simRes?.bloch_vectors;
    const blochRows = [];
    if (Array.isArray(bloch) && bloch.length > 0) {
      bloch.forEach((vec, i) => {
        if (Array.isArray(vec) && vec.length >= 3) {
          blochRows.push([
            `Q${i}`,
            `${safeNum(vec[0])}, ${safeNum(vec[1])}, ${safeNum(vec[2])}`,
          ]);
        } else {
          blochRows.push([`Q${i}`, "Invalid vector"]);
        }
      });
    } else {
      blochRows.push(["Bloch Vectors", "N/A"]);
    }
    autoTable(pdfArg, {
      startY: y,
      margin: { left: x },
      head: [["Bloch Qubit", "Vector (x, y, z)"]],
      body: blochRows,
      theme: "grid",
      styles: {
        fontSize: DESIGN.typography.small - 0.5,
        cellPadding: 2,
        fillColor: DESIGN.colors.bgSecondary,
        textColor: DESIGN.colors.textPrimary,
      },
      headStyles: {
        fillColor: DESIGN.colors.border,
        textColor: DESIGN.colors.textInverse,
      },
      columnStyles: { 0: { cellWidth: 20 }, 1: { cellWidth: cw - 20 } },
    });
    y = pdfArg.lastAutoTable.finalY + DESIGN.spacing.sm;

    // 3) Measurement counts
    const counts = simRes?.measurement_counts ?? simRes?.counts;
    if (counts && typeof counts === "object") {
      const countRows = Object.entries(counts).map(([state, ct]) => [
        state,
        ct,
      ]);
      autoTable(pdfArg, {
        startY: y,
        margin: { left: x },
        head: [["State", "Counts"]],
        body: countRows,
        theme: "grid",
        styles: {
          fontSize: DESIGN.typography.small - 0.5,
          cellPadding: 2,
          fillColor: DESIGN.colors.bgSecondary,
          textColor: DESIGN.colors.textPrimary,
        },
        headStyles: {
          fillColor: DESIGN.colors.accent,
          textColor: DESIGN.colors.textInverse,
        },
        columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: cw - 30 } },
        showHead: true,
      });
      y = pdfArg.lastAutoTable.finalY + DESIGN.spacing.sm;
    }

    // 4) Density matrices
    const dm = simRes?.density_matrices;
    if (Array.isArray(dm) && dm.length > 0) {
      pdfArg.setFont("helvetica", "bold");
      pdfArg.setFontSize(DESIGN.typography.small);
      pdfArg.setTextColor(DESIGN.colors.textPrimary);
      pdfArg.text("Density Matrices:", x, y);
      y += DESIGN.spacing.sm;

      dm.forEach((matrix, qi) => {
        if (!Array.isArray(matrix)) {
          pdfArg.setFont("helvetica", "normal");
          pdfArg.setFontSize(DESIGN.typography.small - 0.5);
          pdfArg.text(`Q${qi}: Invalid matrix format`, x + padding, y);
          y += DESIGN.typography.small;
          return;
        }

        const rows = matrix.map((row) => {
          if (!Array.isArray(row)) return "Invalid row";
          return (
            "[ " +
            row
              .map((cell) => {
                if (typeof cell === "number") return cell.toFixed(3);
                if (Array.isArray(cell) && cell.length === 2) {
                  const r =
                    typeof cell[0] === "number" ? cell[0].toFixed(3) : "N/A";
                  const im =
                    typeof cell[1] === "number" ? cell[1].toFixed(3) : "N/A";
                  return `${r}${cell[1] >= 0 ? "+" : ""}${im}i`;
                }
                return "N/A";
              })
              .join(", ") +
            " ]"
          );
        });

        const matrixText = [`Q${qi}:`].concat(rows);
        const wrapped = pdfArg.splitTextToSize(
          matrixText.join("\n"),
          cw - padding * 2
        );

        pdfArg.setFont("courier", "normal");
        pdfArg.setFontSize(DESIGN.typography.small - 0.5);
        pdfArg.setTextColor(DESIGN.colors.textSecondary);
        pdfArg.text(wrapped, x + padding, y, { lineHeightFactor: 1.1 });
        y +=
          wrapped.length * (DESIGN.typography.small - 0.5) * 0.45 +
          DESIGN.spacing.sm;
      });
    } else {
      pdfArg.setFont("helvetica", "normal");
      pdfArg.setFontSize(DESIGN.typography.small - 0.5);
      pdfArg.setTextColor(DESIGN.colors.textSecondary);
      pdfArg.text("Density Matrices: N/A", x + padding, y);
      y += DESIGN.typography.small;
    }

    return y;
  }

  // --- EXECUTIVE SUMMARY (unchanged, uses summaryText) ---
  const cardPadding = DESIGN.spacing.md;
  let summaryText = `This report analyzes quantum state simulation results from a ${
    simulationResult.bloch_vectors?.length || 0
  }-qubit system, encompassing ${
    Object.keys(simulationResult.amplitudes || {}).length
  } distinct quantum states. It provides insights into quantum behavior, state evolution, and probability distributions, demonstrating superposition, entanglement, and measurement outcomes.`;

  let summaryLines = pdf.splitTextToSize(
    summaryText,
    DESIGN.layout.contentWidth - cardPadding * 2
  );

  let summaryHeight =
    summaryLines.length * (DESIGN.typography.body * 0.45) + cardPadding * 3;

  pb = smartPageBreak(pdf, yOffset, summaryHeight, currentPage);
  yOffset = pb.y;
  currentPage = pb.page;

  add3DCard(
    pdf,
    DESIGN.layout.margin,
    yOffset,
    DESIGN.layout.contentWidth,
    summaryHeight
  );

  pdf
    .setFont("helvetica", "bold")
    .setFontSize(DESIGN.typography.h3)
    .setTextColor(DESIGN.colors.accent);
  pdf.text(
    "Executive Summary",
    DESIGN.layout.margin + DESIGN.layout.contentWidth / 2,
    yOffset + cardPadding,
    { align: "center" }
  );

  pdf
    .setFont("helvetica", "normal")
    .setFontSize(DESIGN.typography.body)
    .setTextColor(DESIGN.colors.textPrimary);
  pdf.text(
    summaryLines,
    DESIGN.layout.margin + cardPadding,
    yOffset + cardPadding * 2,
    {
      align: "left",
      maxWidth: DESIGN.layout.contentWidth - cardPadding * 2,
      lineHeightFactor: 1.4,
    }
  );

  yOffset += summaryHeight + DESIGN.spacing.lg;

  // --- QUANTUM STATE VISUALIZATIONS (unchanged) ---
  const spheresImg = await captureElement(blochSpheresRef.current);
  if (spheresImg) {
    const imgProps = pdf.getImageProperties(spheresImg);
    const imgHeight =
      (imgProps.height * DESIGN.layout.contentWidth) / imgProps.width;
    const cardHeight = imgHeight + DESIGN.spacing.md;
    pb = smartPageBreak(
      pdf,
      yOffset,
      cardHeight + DESIGN.spacing.lg,
      currentPage
    );
    yOffset = pb.y;
    currentPage = pb.page;
    yOffset = addSectionHeader(
      pdf,
      "🌐",
      "Quantum State Visualizations",
      yOffset
    );
    add3DCard(
      pdf,
      DESIGN.layout.margin,
      yOffset,
      DESIGN.layout.contentWidth,
      cardHeight
    );
    pdf.addImage(
      spheresImg,
      "PNG",
      DESIGN.layout.margin + DESIGN.spacing.xs,
      yOffset + DESIGN.spacing.xs,
      DESIGN.layout.contentWidth - DESIGN.spacing.xs * 2,
      imgHeight - DESIGN.spacing.xs * 2,
      undefined,
      "NONE"
    );
    pdf
      .setFont("helvetica", "italic")
      .setFontSize(DESIGN.typography.caption)
      .setTextColor(DESIGN.colors.textMuted);
    pdf.text(
      "Bloch Sphere Representation of Qubit States",
      DESIGN.layout.margin + DESIGN.layout.contentWidth / 2,
      yOffset + imgHeight,
      { align: "center" }
    );
    yOffset += cardHeight + DESIGN.spacing.lg;
  }

  // --- TWO-COLUMN LAYOUT ---
  const col1X = DESIGN.layout.margin;
  const col2X =
    DESIGN.layout.margin + DESIGN.layout.colWidth + DESIGN.layout.colSpacing;
  pb = smartPageBreak(pdf, yOffset, 120, currentPage);
  yOffset = pb.y;
  currentPage = pb.page;
  let col1Y = yOffset,
    col2Y = yOffset;

  // --- COLUMN 1: Execution Data ---
  col1Y = addSectionHeader(pdf, "⚙️", "Execution Data", col1Y, col1X);

  // --- Input Circuit (strict: no sample fallback) ---
  const qasmText =
    simulationResult &&
    typeof simulationResult.openqasm === "string" &&
    simulationResult.openqasm.trim().length > 0
      ? simulationResult.openqasm
      : "N/A";

  const qasmLines = pdf.splitTextToSize(
    qasmText,
    DESIGN.layout.colWidth - DESIGN.spacing.md * 2
  );
  const qasmCardHeight =
    ((qasmLines.length * DESIGN.typography.small) / 2.5) * 1.2 +
    DESIGN.spacing.lg;
  add3DCard(pdf, col1X, col1Y, DESIGN.layout.colWidth, qasmCardHeight);
  pdf
    .setFont("helvetica", "bold")
    .setFontSize(DESIGN.typography.h3)
    .setTextColor(DESIGN.colors.textPrimary);
  pdf.text(
    "Input Circuit",
    col1X + DESIGN.spacing.sm,
    col1Y + DESIGN.spacing.sm
  );
  pdf
    .setFont("courier", "normal")
    .setFontSize(DESIGN.typography.small)
    .setTextColor(DESIGN.colors.textSecondary);
  pdf.text(qasmLines, col1X + DESIGN.spacing.sm, col1Y + DESIGN.spacing.md, {
    lineHeightFactor: 1.2,
  });
  col1Y += qasmCardHeight + DESIGN.spacing.md;

  // --- Render structured Raw Simulation Data (tables/text)
  col1Y = renderRawSimulationData(pdf, simulationResult, col1X, col1Y);
  col1Y += DESIGN.spacing.md;

  // --- COLUMN 2: Measurement Outcomes ---
  col2Y = addSectionHeader(pdf, "📈", "Measurement Outcomes", col2Y, col2X);
  const chartImg = await captureElement(probabilityChartRef.current);
  if (chartImg) {
    const imgProps = pdf.getImageProperties(chartImg);
    const imgHeight =
      (imgProps.height * DESIGN.layout.colWidth) / imgProps.width;
    const chartCardHeight = imgHeight + DESIGN.spacing.md;
    add3DCard(pdf, col2X, col2Y, DESIGN.layout.colWidth, chartCardHeight);
    pdf.addImage(
      chartImg,
      "PNG",
      col2X + DESIGN.spacing.xs,
      col2Y + DESIGN.spacing.xs,
      DESIGN.layout.colWidth - DESIGN.spacing.xs * 2,
      imgHeight - DESIGN.spacing.xs * 2,
      undefined,
      "NONE"
    );
    col2Y += chartCardHeight + DESIGN.spacing.md;
  }

  // --- STATE AMPLITUDES: normalized robust table ---
  const normalizedAmps = normalizeAmplitudes(simulationResult?.amplitudes);
  if (normalizedAmps && normalizedAmps.length > 0) {
    const tableData = normalizedAmps.map((a) => [
      a.state ?? "N/A",
      a.re != null ? a.re.toFixed(3) : "N/A",
      a.im != null ? a.im.toFixed(3) : "N/A",
      a.prob != null ? `${(a.prob * 100).toFixed(1)}%` : "N/A",
    ]);

    pdf
      .setFont("helvetica", "bold")
      .setFontSize(DESIGN.typography.h3)
      .setTextColor(DESIGN.colors.textPrimary);
    pdf.text("State Amplitudes", col2X, col2Y);
    col2Y += DESIGN.spacing.sm;

    autoTable(pdf, {
      startY: col2Y,
      head: [["State", "Re", "Im", "Prob"]],
      body: tableData.slice(0, 8),
      theme: "grid",
      headStyles: {
        fillColor: DESIGN.colors.accent,
        textColor: DESIGN.colors.textInverse,
        fontStyle: "bold",
        fontSize: DESIGN.typography.small,
      },
      styles: {
        fontSize: DESIGN.typography.small - 1,
        textColor: DESIGN.colors.textPrimary,
        fillColor: DESIGN.colors.bgSecondary,
        lineColor: DESIGN.colors.border,
        lineWidth: 0.1,
        cellPadding: 1.5,
      },
      alternateRowStyles: { fillColor: DESIGN.colors.bgPrimary },
      margin: { left: col2X },
      tableWidth: DESIGN.layout.colWidth,
      columnStyles: {
        0: { cellWidth: 22 },
        1: { cellWidth: 18 },
        2: { cellWidth: 18 },
        3: { cellWidth: 22 },
      },
    });
    col2Y = pdf.lastAutoTable.finalY + DESIGN.spacing.md;
  }

  // --- Final Full-Width Sections: waves image / AI insights (unchanged) ---
  yOffset = Math.max(col1Y, col2Y);

  const wavesImg = await captureElement(amplitudeWavesRef.current);
  if (wavesImg) {
    const imgProps = pdf.getImageProperties(wavesImg);
    const imgHeight =
      (imgProps.height * DESIGN.layout.contentWidth) / imgProps.width;
    const cardHeight = imgHeight + DESIGN.spacing.md;
    pb = smartPageBreak(
      pdf,
      yOffset,
      cardHeight + DESIGN.spacing.lg,
      currentPage
    );
    yOffset = pb.y;
    currentPage = pb.page;
    yOffset = addSectionHeader(pdf, "🌊", "Probability Amplitudes", yOffset);
    add3DCard(
      pdf,
      DESIGN.layout.margin,
      yOffset,
      DESIGN.layout.contentWidth,
      cardHeight
    );
    pdf.addImage(
      wavesImg,
      "PNG",
      DESIGN.layout.margin + DESIGN.spacing.xs,
      yOffset + DESIGN.spacing.xs,
      DESIGN.layout.contentWidth - DESIGN.spacing.xs * 2,
      imgHeight - DESIGN.spacing.xs * 2,
      undefined,
      "NONE"
    );
    pdf
      .setFont("helvetica", "italic")
      .setFontSize(DESIGN.typography.caption)
      .setTextColor(DESIGN.colors.textMuted);
    pdf.text(
      "Amplitude Wave Analysis",
      DESIGN.layout.margin + DESIGN.layout.contentWidth / 2,
      yOffset + imgHeight,
      { align: "center" }
    );
    yOffset += cardHeight + DESIGN.spacing.lg;
  }

  // AI-Powered Insights block (keep your robust paginated implementation from earlier)
  if (analysisText) {
    const cardPadding = DESIGN.spacing.md;
    const maxWidth = DESIGN.layout.contentWidth - cardPadding * 2;
    const fontSize = DESIGN.typography.body;
    const lineHeightFactor = 1.4;

    const cleanText = analysisText
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1");

    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(fontSize);

    const allLines = pdf.splitTextToSize(cleanText, maxWidth);
    const sampleDim = pdf.getTextDimensions("Mg");
    const sampleH = sampleDim && sampleDim.h ? sampleDim.h : fontSize * 0.35;
    const lineHeight = sampleH * lineHeightFactor;
    const pageHeight = pdf.internal.pageSize.getHeight();
    const pageBottomLimit =
      pageHeight - DESIGN.layout.footerHeight - DESIGN.layout.margin;
    const pageTopStart = DESIGN.layout.headerHeight + DESIGN.spacing.lg;
    const safetyMargin = lineHeight;

    yOffset = addSectionHeader(pdf, "🔬", "AI-Powered Insights", yOffset);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(fontSize);
    pdf.setTextColor(DESIGN.colors.textPrimary);

    let idx = 0;
    while (idx < allLines.length) {
      if (yOffset + cardPadding + lineHeight + safetyMargin > pageBottomLimit) {
        pdf.addPage();
        currentPage++;
        addPageLayout(pdf, currentPage);
        yOffset = pageTopStart;
      }

      const availableHeight =
        pageBottomLimit - (yOffset + cardPadding) - safetyMargin;
      let linesFit = Math.floor(availableHeight / lineHeight);

      if (linesFit <= 0) {
        pdf.addPage();
        currentPage++;
        addPageLayout(pdf, currentPage);
        yOffset = pageTopStart;
        continue;
      }

      const chunk = allLines.slice(idx, idx + linesFit);
      const chunkHeight = chunk.length * lineHeight;
      const visualHeight = chunkHeight + cardPadding * 2;

      pdf.setDrawColor(DESIGN.colors.border);
      pdf.setLineWidth(0.35);
      pdf.roundedRect(
        DESIGN.layout.margin,
        yOffset,
        DESIGN.layout.contentWidth,
        visualHeight,
        3,
        3,
        "S"
      );

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(fontSize);
      pdf.setTextColor(DESIGN.colors.textPrimary);

      let textY = yOffset + cardPadding + sampleH * 0.25;
      for (let j = 0; j < chunk.length; j++) {
        pdf.text(chunk[j], DESIGN.layout.margin + cardPadding, textY, {
          maxWidth,
          align: "left",
        });
        textY += lineHeight;
      }

      idx += chunk.length;
      yOffset += visualHeight + DESIGN.spacing.lg;
    }
  }

  addFooter(pdf);
  const timestamp = new Date().toISOString().slice(0, 10);
  pdf.save(`Quantum-Analysis-Professional-Report-${timestamp}.pdf`);
};
