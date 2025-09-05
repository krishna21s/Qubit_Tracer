import React, { useState, useMemo, forwardRef, useCallback } from "react";
import AmplitudeWaves from "./AmplitudeWaves";

/**
 * AmplitudesTable
 * (Enhanced for large state spaces; existing UI preserved and only improved)
 *
 * Improvements:
 *  - Scrollable table body with sticky header (no layout explosion on 2^n states)
 *  - Optional sorting (by probability desc / original order) toggle
 *  - Quick filter (regex / substring) for large lists
 *  - Monospaced bitstrings with soft wrap avoidance and copy-on-click tooltip
 *  - Smarter numeric formatting for very small magnitudes (shows e-notation below 1e-4)
 *  - Performance: memoized row building + light row virtualization (windowing) for > 400 rows
 *  - Keeps amplitude waves toggle & ref (used for PDF export) exactly intact
 *
 * NOTE: Forward ref still points to the wave container (unchanged) so your PDF generator works.
 */

const VIRTUALIZATION_THRESHOLD = 400;      // enable windowing after this many rows
const VIRTUAL_ROW_HEIGHT = 32;             // px — must match rowStyle height/padding
const VIRTUAL_OVERSCAN = 14;               // extra rows above/below viewport

const AmplitudesTable = forwardRef(({ amplitudes }, amplitudeWavesRef) => {
  const [showWaves, setShowWaves] = useState(false);
  const [sortMode, setSortMode] = useState("prob"); // 'prob' | 'original'
  const [filter, setFilter] = useState("");

  if (!amplitudes) return <div>No amplitude data</div>;

  // Preserve original order list so user can revert
  const originalEntries = useMemo(
    () => Object.entries(amplitudes),
    [amplitudes]
  );

  const filteredAndSorted = useMemo(() => {
    let arr = originalEntries;

    // Filtering (case-sensitive regex if starts & ends with /.../)
    if (filter.trim()) {
      try {
        let tester;
        if (filter.startsWith("/") && filter.lastIndexOf("/") > 0) {
          const last = filter.lastIndexOf("/");
          const pattern = filter.slice(1, last);
          const flags = filter.slice(last + 1) || "i";
          tester = new RegExp(pattern, flags);
        } else {
          tester = new RegExp(filter, "i");
        }
        arr = arr.filter(([state]) => tester.test(state));
      } catch {
        // invalid regex — fallback to simple includes
        arr = arr.filter(([state]) =>
          state.toLowerCase().includes(filter.toLowerCase())
        );
      }
    }

    if (sortMode === "prob") {
      arr = [...arr].sort((a, b) => b[1].prob - a[1].prob);
    } else {
      arr = [...arr]; // original order (stable)
    }
    return arr;
  }, [originalEntries, sortMode, filter]);

  const totalStates = filteredAndSorted.length;

  // Formatter for numbers (keeps existing style but improves very small values)
  const fmt = (n, dp = 3) => {
    if (Math.abs(n) > 0 && Math.abs(n) < 1e-4) return n.toExponential(2);
    return n.toFixed(dp);
  };

  // Virtualization logic
  const [scrollTop, setScrollTop] = useState(0);
  const useVirtual = totalStates > VIRTUALIZATION_THRESHOLD;
  const visibleHeight = 360; // px for scroll container
  const totalHeightVirtual = totalStates * VIRTUAL_ROW_HEIGHT;

  const startIndex = useVirtual
    ? Math.max(
      0,
      Math.floor(scrollTop / VIRTUAL_ROW_HEIGHT) - VIRTUAL_OVERSCAN
    )
    : 0;
  const endIndex = useVirtual
    ? Math.min(
      totalStates,
      Math.ceil((scrollTop + visibleHeight) / VIRTUAL_ROW_HEIGHT) +
      VIRTUAL_OVERSCAN
    )
    : totalStates;

  const sliceToRender = useVirtual
    ? filteredAndSorted.slice(startIndex, endIndex)
    : filteredAndSorted;

  const onScroll = useCallback(
    (e) => {
      if (!useVirtual) return;
      setScrollTop(e.currentTarget.scrollTop);
    },
    [useVirtual]
  );

  // Copy state label
  const [copiedState, setCopiedState] = useState(null);
  const copyState = (bits) => {
    navigator.clipboard.writeText(bits).then(() => {
      setCopiedState(bits);
      setTimeout(() => {
        setCopiedState(null);
      }, 900);
    });
  };

  return (
    <div className="card" style={{ marginTop: 16, overflow: "hidden" }}>
      {/* Header Row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 10,
          flexWrap: "wrap",
        }}
      >
        <h3 style={{ color: "#e0f7fa", margin: 0 }}>State Amplitudes</h3>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="Filter (e.g. 00 /1$ /10)"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              background: "#141d2c",
              border: "1px solid #2a4356",
              color: "#d7ecf8",
              borderRadius: 6,
              fontSize: 11,
              padding: "4px 8px",
              fontFamily: '"Courier New", monospace',
              width: 140,
            }}
            title="Supports regex /pattern/flags or substring match"
          />
          <button
            onClick={() =>
              setSortMode((m) => (m === "prob" ? "original" : "prob"))
            }
            style={smallBtn(sortMode === "prob")}
            title={
              sortMode === "prob"
                ? "Currently sorting by probability ↓ (click to keep original order)"
                : "Currently keeping original order (click to sort by probability)"
            }
          >
            {sortMode === "prob" ? "Prob ↓" : "Original"}
          </button>
          <button
            onClick={() => setShowWaves((s) => !s)}
            style={{
              ...smallBtn(showWaves),
              fontSize: 14,
              width: 42,
            }}
            title={
              showWaves
                ? "Hide amplitude wave visualization"
                : "Show amplitude wave visualization"
            }
          >
            {showWaves ? "🙈" : "👁️"}
          </button>
        </div>
      </div>

      {/* Meta line */}
      <div
        style={{
          marginTop: 6,
          fontSize: 11,
          color: "#7fb5d9",
          display: "flex",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 6,
        }}
      >
        <span>
          Showing {totalStates} state{totalStates !== 1 && "s"}
          {filter && (
            <span style={{ color: "#4cc3fa" }}> (filtered)</span>
          )}
        </span>
        {useVirtual && (
          <span style={{ color: "#4cc3fa" }}>
            Virtualized (rows {startIndex + 1}–{endIndex})
          </span>
        )}
      </div>

      {/* Table Wrapper */}
      <div
        style={{
          marginTop: 8,
          border: "1px solid rgba(80,115,138,0.35)",
          borderRadius: 10,
          overflow: "hidden",
          background: "#111b27",
        }}
      >
        {/* Sticky header */}
        <div
          style={{
            background: "#223",
            display: "grid",
            gridTemplateColumns: "1fr 0.75fr 0.75fr 0.9fr",
            fontSize: 11,
            color: "#9fb4c8",
            fontWeight: 600,
            letterSpacing: 0.5,
            position: "sticky",
            top: 0,
            zIndex: 2,
            padding: "6px 8px",
          }}
        >
          <div style={{ textAlign: "center" }}>Basis State</div>
          <div style={{ textAlign: "center" }}>Re(α)</div>
          <div style={{ textAlign: "center" }}>Im(α)</div>
          <div style={{ textAlign: "center" }}>|α|² (%)</div>
        </div>

        {/* Scrollable body */}
        <div
          style={{
            maxHeight: 360,
            overflowY: "auto",
            position: "relative",
            fontSize: 13,
          }}
          onScroll={onScroll}
        >
          {/* Virtual spacer */}
          {useVirtual && (
            <div
              style={{
                height: totalHeightVirtual,
                position: "relative",
              }}
            >
              {/* Render only visible slice */}
              <div
                style={{
                  position: "absolute",
                  top: startIndex * VIRTUAL_ROW_HEIGHT,
                  left: 0,
                  right: 0,
                }}
              >
                {sliceToRender.map(([state, { re, im, prob }], idx) => {
                  const even =
                    (startIndex + idx) % 2 === 0; /* preserve zebra pattern */
                  return (
                    <Row
                      key={`${state}-${startIndex + idx}`}
                      state={state}
                      re={re}
                      im={im}
                      prob={prob}
                      even={even}
                      fmt={fmt}
                      copyState={copyState}
                      copiedState={copiedState}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {!useVirtual &&
            filteredAndSorted.map(([state, { re, im, prob }], idx) => (
              <Row
                key={state}
                state={state}
                re={re}
                im={im}
                prob={prob}
                even={idx % 2 === 0}
                fmt={fmt}
                copyState={copyState}
                copiedState={copiedState}
              />
            ))}

          {!filteredAndSorted.length && (
            <div
              style={{
                padding: 14,
                fontSize: 12,
                color: "#6fa8c6",
                textAlign: "center",
              }}
            >
              No states match the filter.
            </div>
          )}
        </div>
      </div>

      {/* Wave visualization toggled by eye button */}
      <div
        ref={amplitudeWavesRef}
        style={{
          marginTop: showWaves ? 14 : 0,
          transition: "margin-top .25s",
        }}
      >
        <AmplitudeWaves amplitudes={amplitudes} show={showWaves} />
      </div>
    </div>
  );
});

function Row({ state, re, im, prob, even, fmt, copyState, copiedState }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 0.75fr 0.75fr 0.9fr",
        alignItems: "center",
        textAlign: "center",
        height: VIRTUAL_ROW_HEIGHT - 2,
        background: even ? "#1c2230" : "#222b3a",
        fontSize: 12.5,
        color: "#dff6ff",
        borderBottom: "1px solid rgba(60,92,115,0.25)",
        fontFamily: '"Inter", system-ui, sans-serif',
        position: "relative",
      }}
    >
      <div
        style={{
          fontWeight: 600,
          color: "#80e0ff",
          fontFamily: '"Courier New", monospace',
          cursor: "pointer",
          padding: "0 4px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 6,
          position: "relative",
        }}
        onClick={() => copyState(state)}
        title="Click to copy state bitstring"
      >
        {state}
        {copiedState === state && (
          <span
            style={{
              fontSize: 9,
              background: "#12649f",
              color: "#e6f6ff",
              padding: "2px 4px",
              borderRadius: 4,
              fontWeight: 700,
              letterSpacing: 0.5,
              position: "absolute",
              top: 4,
              right: 4,
            }}
          >
            COPIED
          </span>
        )}
      </div>
      <div>{fmt(re)}</div>
      <div>{fmt(im)}</div>
      <div style={{ fontWeight: 500 }}>{(prob * 100).toFixed(2)}%</div>
    </div>
  );
}

const smallBtn = (active) => ({
  background: active
    ? "linear-gradient(135deg,#1781cc,#12649f)"
    : "linear-gradient(135deg,#1d2f40,#162432)",
  border: "1px solid #2a4356",
  color: "#d7ecf8",
  fontSize: 11,
  fontWeight: 600,
  padding: "5px 10px",
  borderRadius: 6,
  cursor: "pointer",
  letterSpacing: 0.4,
  minWidth: 62,
  transition: "background .25s",
});

export default AmplitudesTable;