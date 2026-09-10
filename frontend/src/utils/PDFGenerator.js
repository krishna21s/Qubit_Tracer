import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { convertCircuitCode } from "./api";

// --- DESIGN (Professional White Theme) ---
const DESIGN = {
  colors: {
    bgPrimary: "#FFFFFF",
    bgSecondary: "#F8FAFC",
    accent: "#0284C7", // Professional deep blue
    textPrimary: "#0F172A",
    textSecondary: "#334155",
    textMuted: "#64748B",
    textInverse: "#FFFFFF",
    border: "#E2E8F0",
    shadow: "#F1F5F9",
  },
  typography: {
    h1: 18,
    h2: 14,
    h3: 11,
    body: 10,
    small: 9,
    caption: 8,
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
    headerHeight: 25,
    footerHeight: 15,
  },
};

// --- Helper functions ---
const addPageLayout = (pdf, pageNumber = 1) => {
  pdf.setFillColor(DESIGN.colors.bgPrimary);
  pdf.rect(0, 0, 210, 297, "F");
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(DESIGN.typography.h1);
  pdf.setTextColor(DESIGN.colors.textPrimary);
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
  pdf.text(`${title}`, xOffset, yOffset, { charSpace: 0 });
  return yOffset + DESIGN.spacing.md;
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

const normalizeAmplitudes = (amps) => {
  if (!amps) return [];
  if (Array.isArray(amps)) {
    return amps.map((a, i) => ({
      state: a.state ?? `|${i}⟩`,
      re: typeof a.re === "number" ? a.re : typeof a[0] === "number" ? a[0] : null,
      im: typeof a.im === "number" ? a.im : typeof a[1] === "number" ? a[1] : null,
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

const safeNum = (v, dp = 3) => (typeof v === "number" ? v.toFixed(dp) : "N/A");

// --- Main PDF Generation Function ---
export const generateReportPDF = async (data) => {
  const { simulationResult, analysisText } = data;
  const pdf = new jsPDF("p", "mm", "a4");
  let currentPage = 1,
    yOffset = DESIGN.layout.headerHeight + DESIGN.spacing.lg,
    pb;
  addPageLayout(pdf, currentPage);

  const maxY = () => 297 - DESIGN.layout.footerHeight - DESIGN.layout.margin;
  const ensureRoom = (heightNeeded) => {
    if (yOffset + heightNeeded > maxY()) {
      pdf.addPage();
      currentPage++;
      addPageLayout(pdf, currentPage);
      yOffset = DESIGN.layout.headerHeight + DESIGN.spacing.lg;
    }
  };

  const x = DESIGN.layout.margin;
  const cw = DESIGN.layout.contentWidth;

  // 1. EXECUTIVE SUMMARY
  yOffset = addSectionHeader(pdf, "📝", "Executive Summary", yOffset);
  const numStates = Object.keys(simulationResult?.amplitudes || {}).length;
  const summaryText = `This report analyzes quantum state simulation results from a ${
    simulationResult?.num_qubits || simulationResult?.bloch_vectors?.length || 2
  }-qubit system, encompassing ${numStates} distinct quantum states. It provides insights into quantum behavior, state evolution, and probability distributions.`;
  
  const summaryLines = pdf.splitTextToSize(summaryText, cw);
  ensureRoom(summaryLines.length * 5 + 10);
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(DESIGN.typography.body);
  pdf.setTextColor(DESIGN.colors.textPrimary);
  pdf.text(summaryLines, x, yOffset, { charSpace: 0, lineHeightFactor: 1.5 });
  yOffset += summaryLines.length * 5 + DESIGN.spacing.lg;

  // 2. METADATA
  yOffset = addSectionHeader(pdf, "⚙️", "Execution Metadata", yOffset);
  const metaRows = [
    ["Shots", simulationResult?.shots ?? simulationResult?.shot_count ?? "N/A"],
    ["Backend", simulationResult?.backend ?? "N/A"],
    ["Seed", simulationResult?.seed ?? "N/A"],
    ["Timestamp", simulationResult?.timestamp ?? new Date().toISOString()],
  ];
  autoTable(pdf, {
    startY: yOffset,
    margin: { left: x },
    head: [["Property", "Value"]],
    body: metaRows,
    theme: "grid",
    styles: { fontSize: DESIGN.typography.small, cellPadding: 2, textColor: DESIGN.colors.textPrimary },
    headStyles: { fillColor: DESIGN.colors.accent, textColor: DESIGN.colors.textInverse },
    columnStyles: { 0: { cellWidth: 40 }, 1: { cellWidth: cw - 40 } },
  });
  yOffset = pdf.lastAutoTable.finalY + DESIGN.spacing.xl;

  // 3. BLOCH VECTORS
  yOffset = addSectionHeader(pdf, "🌐", "Bloch Vectors", yOffset);
  const bloch = simulationResult?.bloch_vectors;
  const blochRows = [];
  if (Array.isArray(bloch) && bloch.length > 0) {
    bloch.forEach((vec, i) => {
      if (Array.isArray(vec) && vec.length >= 3) {
        blochRows.push([`Q${i}`, safeNum(vec[0]), safeNum(vec[1]), safeNum(vec[2])]);
      } else {
        blochRows.push([`Q${i}`, "N/A", "N/A", "N/A"]);
      }
    });
  } else {
    blochRows.push(["N/A", "N/A", "N/A", "N/A"]);
  }
  autoTable(pdf, {
    startY: yOffset,
    margin: { left: x },
    head: [["Qubit", "X", "Y", "Z"]],
    body: blochRows,
    theme: "grid",
    styles: { fontSize: DESIGN.typography.small, cellPadding: 2, textColor: DESIGN.colors.textPrimary },
    headStyles: { fillColor: DESIGN.colors.bgSecondary, textColor: DESIGN.colors.textPrimary, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 30 }, 1: { cellWidth: 50 }, 2: { cellWidth: 50 }, 3: { cellWidth: 50 } },
  });
  yOffset = pdf.lastAutoTable.finalY + DESIGN.spacing.xl;

  // 4. MEASUREMENTS & PROBABILITIES
  yOffset = addSectionHeader(pdf, "📈", "Measurement Outcomes & Probabilities", yOffset);
  const counts = simulationResult?.measurement_counts ?? simulationResult?.counts;
  const probs = simulationResult?.probabilities;
  const probRows = [];
  
  if (counts || probs) {
    const allStates = new Set([...Object.keys(counts || {}), ...Object.keys(probs || {})]);
    allStates.forEach(st => {
      const ct = counts?.[st] ?? "0";
      const pr = probs?.[st] != null ? `${(probs[st] * 100).toFixed(1)}%` : "N/A";
      probRows.push([st, ct, pr]);
    });
  } else {
    probRows.push(["N/A", "N/A", "N/A"]);
  }

  autoTable(pdf, {
    startY: yOffset,
    margin: { left: x },
    head: [["State", "Counts", "Probability"]],
    body: probRows,
    theme: "grid",
    styles: { fontSize: DESIGN.typography.small, cellPadding: 2, textColor: DESIGN.colors.textPrimary },
    headStyles: { fillColor: DESIGN.colors.bgSecondary, textColor: DESIGN.colors.textPrimary, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 60 }, 2: { cellWidth: 60 } },
  });
  yOffset = pdf.lastAutoTable.finalY + DESIGN.spacing.xl;

  // 5. STATE AMPLITUDES
  yOffset = addSectionHeader(pdf, "🌊", "State Amplitudes", yOffset);
  const normalizedAmps = normalizeAmplitudes(simulationResult?.amplitudes);
  const ampRows = normalizedAmps.map((a) => [
    a.state ?? "N/A",
    a.re != null ? a.re.toFixed(4) : "N/A",
    a.im != null ? a.im.toFixed(4) : "N/A",
    a.prob != null ? `${(a.prob * 100).toFixed(2)}%` : "N/A",
  ]);

  if (ampRows.length === 0) ampRows.push(["N/A", "N/A", "N/A", "N/A"]);

  autoTable(pdf, {
    startY: yOffset,
    margin: { left: x },
    head: [["State", "Real (Re)", "Imaginary (Im)", "Probability"]],
    body: ampRows.slice(0, 32), // Limit to avoid massive tables for large qubits
    theme: "grid",
    styles: { fontSize: DESIGN.typography.small, cellPadding: 2, textColor: DESIGN.colors.textPrimary },
    headStyles: { fillColor: DESIGN.colors.bgSecondary, textColor: DESIGN.colors.textPrimary, fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 45 }, 1: { cellWidth: 45 }, 2: { cellWidth: 45 }, 3: { cellWidth: 45 } },
  });
  yOffset = pdf.lastAutoTable.finalY + DESIGN.spacing.xl;

  // 6. DENSITY MATRICES
  yOffset = addSectionHeader(pdf, "🧮", "Density Matrices", yOffset);
  const dm = simulationResult?.density_matrices;
  if (Array.isArray(dm) && dm.length > 0) {
    dm.forEach((matrix, i) => {
      ensureRoom(30);
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(DESIGN.typography.body);
      pdf.setTextColor(DESIGN.colors.textPrimary);
      pdf.text(`Qubit ${i}:`, x, yOffset);
      yOffset += DESIGN.spacing.sm;

      const matrixRows = [];
      if (Array.isArray(matrix)) {
        matrix.forEach((row) => {
          if (Array.isArray(row)) {
            const rowStr = row.map((c) => {
              if (typeof c === "number") return c.toFixed(3);
              if (Array.isArray(c) && c.length === 2) {
                const real = typeof c[0] === "number" ? c[0].toFixed(3) : "N/A";
                const imag = typeof c[1] === "number" ? c[1].toFixed(3) : "N/A";
                return `${real}${c[1] >= 0 ? "+" : ""}${imag}i`;
              }
              return "N/A";
            });
            matrixRows.push(rowStr);
          }
        });
      }

      autoTable(pdf, {
        startY: yOffset,
        margin: { left: x },
        body: matrixRows,
        theme: "plain",
        styles: { fontSize: DESIGN.typography.small - 1, cellPadding: 2, textColor: DESIGN.colors.textSecondary, halign: "center" },
        tableLineWidth: 0.1,
        tableLineColor: DESIGN.colors.border,
      });
      yOffset = pdf.lastAutoTable.finalY + DESIGN.spacing.md;
    });
  } else {
    ensureRoom(10);
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(DESIGN.typography.small);
    pdf.text("N/A", x, yOffset);
    yOffset += DESIGN.spacing.lg;
  }
  yOffset += DESIGN.spacing.md;

  // 7. FRAMEWORK TRANSLATIONS
  yOffset = addSectionHeader(pdf, "💻", "Framework Translations", yOffset);
  const qasm = simulationResult?.openqasm || "";
  let translated = { cirq: "N/A", pennylane: "N/A" };
  if (qasm) {
    try {
      translated = await convertCircuitCode(qasm);
    } catch (err) {
      console.error("Conversion failed", err);
    }
  }

  const qiskitCode = `from qiskit import QuantumCircuit\n\n# Automatically load QASM\nqc = QuantumCircuit.from_qasm_str("""${qasm}""")\nprint(qc.draw())`;

  const codeBlocks = [
    { name: "OpenQASM", code: qasm },
    { name: "Qiskit", code: qiskitCode },
    { name: "PennyLane", code: translated.pennylane || "N/A" },
    { name: "Cirq", code: translated.cirq || "N/A" },
  ];

  codeBlocks.forEach(block => {
    ensureRoom(40);
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(DESIGN.typography.body);
    pdf.setTextColor(DESIGN.colors.accent);
    pdf.text(`${block.name}:`, x, yOffset);
    yOffset += DESIGN.spacing.sm;

    const codeLines = pdf.splitTextToSize(block.code, cw - 10);
    const boxHeight = codeLines.length * 4 + 10;
    ensureRoom(boxHeight + 10);

    pdf.setFillColor(DESIGN.colors.bgSecondary);
    pdf.setDrawColor(DESIGN.colors.border);
    pdf.setLineWidth(0.2);
    pdf.roundedRect(x, yOffset, cw, boxHeight, 2, 2, "FD");

    pdf.setFont("courier", "normal");
    pdf.setFontSize(DESIGN.typography.small - 1);
    pdf.setTextColor(DESIGN.colors.textSecondary);
    pdf.text(codeLines, x + 5, yOffset + 6, { lineHeightFactor: 1.2 });
    
    yOffset += boxHeight + DESIGN.spacing.xl;
  });

  // 8. AI-Powered Insights
  if (analysisText) {
    yOffset = addSectionHeader(pdf, "🧠", "AI-Powered Insights", yOffset);
    const cleanText = analysisText.replace(/\*\*(.*?)\*\*/g, "$1").replace(/\*(.*?)\*/g, "$1");
    const insightLines = pdf.splitTextToSize(cleanText, cw);
    
    let lineIdx = 0;
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(DESIGN.typography.body);
    pdf.setTextColor(DESIGN.colors.textPrimary);
    
    while (lineIdx < insightLines.length) {
      ensureRoom(10);
      const spaceLeft = maxY() - yOffset;
      const linesFit = Math.floor(spaceLeft / 5);
      const chunk = insightLines.slice(lineIdx, lineIdx + linesFit);
      
      pdf.text(chunk, x, yOffset, { charSpace: 0, lineHeightFactor: 1.4 });
      yOffset += chunk.length * 5;
      lineIdx += linesFit;
    }
  }

  addFooter(pdf);
  const timestamp = new Date().toISOString().slice(0, 10);
  pdf.save(`Quantum-Analysis-Professional-Report-${timestamp}.pdf`);
};
