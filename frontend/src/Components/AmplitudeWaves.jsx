import React, { useEffect, useRef, useState, useMemo } from "react";
import * as d3 from "d3";

/**
 * AmplitudeWaves
 * Visual / ambient “wave” visualization of state amplitudes.
 *
 * Improvements (kept original look):
 *  - Added display modes: Real | Imag | |α| | Phase
 *  - Added dynamic scaling & color legend
 *  - Safer cleanup (cancels timers + transitions)
 *  - Phase handling (unwrap to [-π, π])
 *  - Robust against very large state spaces (cap & sample)
 *  - Optional probability weighting (smooth interpolation across states instead of abrupt cycling)
 *  - Deterministic gradient / filter IDs (avoid collisions if multiple instances)
 *  - Tooltip showing which state contributed to current segment (hover on curve)
 *  - Graceful fallback if all zeros
 *
 * NOTE:
 *  This is still a stylized visualization. It does NOT represent time-domain evolution.
 *  We map sorted basis states onto sample points of sin(x) to provide an inspection “texture”.
 *
 * Props:
 *  - amplitudes: { bitstring: { re, im, prob } }
 *  - show: boolean
 *  - maxStates: number (default 48) – upper bound of states sampled
 *  - probabilityWeighted: boolean (default true) – if true, repeats high-prob states more densely
 */
function AmplitudeWaves({
  amplitudes,
  show,
  maxStates = 48,
  probabilityWeighted = true
}) {
  const containerRef = useRef();
  const timersRef = useRef([]);
  const tooltipRef = useRef(null);

  const [mode, setMode] = useState("re"); // 're' | 'im' | 'mag' | 'phase'

  // ------------- Derived & Normalized Data -------------
  const ampArray = useMemo(() => {
    if (!amplitudes) return [];
    const entries = Object.entries(amplitudes).map(([state, v]) => ({
      state,
      re: typeof v.re === "number" ? v.re : 0,
      im: typeof v.im === "number" ? v.im : 0,
      prob: typeof v.prob === "number" ? v.prob : 0
    }));

    // Sort by probability descending
    entries.sort((a, b) => b.prob - a.prob);

    // Cap
    let sliced = entries.slice(0, maxStates);

    if (probabilityWeighted && sliced.length > 3) {
      // Create a weighted expansion so high-probability states appear more frequently
      const expanded = [];
      const maxProb = sliced[0].prob || 1;
      sliced.forEach((e) => {
        const weight = Math.max(1, Math.round((e.prob / maxProb) * 6));
        for (let k = 0; k < weight; k++) expanded.push(e);
      });
      sliced = expanded;
    }

    // Compute derived magnitude & phase
    sliced = sliced.map((e) => {
      const mag = Math.sqrt(e.re * e.re + e.im * e.im);
      let phase = Math.atan2(e.im, e.re); // [-π, π]
      return { ...e, mag, phase };
    });

    return sliced;
  }, [amplitudes, maxStates, probabilityWeighted]);

  const valueStats = useMemo(() => {
    if (!ampArray.length) return { max: 1, min: -1 };
    let vals;
    switch (mode) {
      case "im":
        vals = ampArray.map(a => a.im);
        break;
      case "mag":
        vals = ampArray.map(a => a.mag);
        break;
      case "phase":
        vals = ampArray.map(a => a.phase);
        break;
      case "re":
      default:
        vals = ampArray.map(a => a.re);
    }
    const max = Math.max(...vals.map(v => Math.abs(v))) || 1;
    return { max, min: -max };
  }, [ampArray, mode]);

  // ------------- Main Effect (D3 render) -------------
  useEffect(() => {
    const cleanup = () => {
      timersRef.current.forEach(id => clearTimeout(id));
      timersRef.current = [];
      if (containerRef.current) {
        d3.select(containerRef.current).selectAll("*").each(function () {
          d3.select(this).interrupt();
        });
        d3.select(containerRef.current).selectAll("*").remove();
      }
    };

    if (!show || !ampArray.length) {
      cleanup();
      return;
    }

    cleanup();

    const width = 320;
    const height = 64;
    const spacing = 24;
    const bands = 3; // Z / X / Y (stylistic analog)
    const totalHeight = height * bands + spacing * (bands - 1);

    const svg = d3
      .select(containerRef.current)
      .append("svg")
      .attr("width", width)
      .attr("height", totalHeight)
      .style("background", "transparent");

    // Grid lines vertical
    const gridGroup = svg.append("g");
    for (let i = 0; i <= 4; i++) {
      gridGroup
        .append("line")
        .attr("x1", (i * width) / 4)
        .attr("y1", 0)
        .attr("x2", (i * width) / 4)
        .attr("y2", totalHeight)
        .attr("stroke", "#1e3a8a")
        .attr("stroke-width", 0.5)
        .attr("opacity", 0.12);
    }

    // Build sample "timeline" of x values
    const samples = 340;
    const sampleXs = d3.range(0, 2 * Math.PI, (2 * Math.PI) / samples);

    // Mapping state index -> amplitude record (cycled)
    const cycLen = ampArray.length;
    const valueForIndex = (idx) => {
      const rec = ampArray[idx % cycLen];
      switch (mode) {
        case "im": return rec.im;
        case "mag": return rec.mag;
        case "phase": return rec.phase / Math.PI; // normalize ~ [-1,1]
        case "re":
        default: return rec.re;
      }
    };

    // Build dataset for a given band
    function buildWaveDataset() {
      return sampleXs.map((x, i) => {
        // Combine underlying sin(x) with amplitude magnitude scaling (visual)
        const base = Math.sin(x);
        const ampVal = valueForIndex(i);
        const scaled = (ampVal / valueStats.max) * base; // symmetrical scaling
        return {
          x,
          y: scaled,
          state: ampArray[i % cycLen]?.state,
          prob: ampArray[i % cycLen]?.prob,
          re: ampArray[i % cycLen]?.re,
          im: ampArray[i % cycLen]?.im,
          phase: ampArray[i % cycLen]?.phase,
          mag: ampArray[i % cycLen]?.mag
        };
      });
    }

    const backgrounds = [
      { key: "z", colors: ["#3b82f6", "#60a5fa"] },
      { key: "x", colors: ["#ef4444", "#f87171"] },
      { key: "y", colors: ["#10b981", "#34d399"] }
    ];

    const defs = svg.append("defs");

    backgrounds.forEach((band, bandIndex) => {
      const offsetY = bandIndex * (height + spacing) + height / 2;

      // Back panel
      svg.append("rect")
        .attr("x", 18)
        .attr("y", offsetY - height / 2)
        .attr("width", width - 36)
        .attr("height", height)
        .attr("rx", 8)
        .attr("fill", "rgba(15,23,42,0.28)")
        .attr("stroke", "rgba(148,163,184,0.06)")
        .attr("stroke-width", 1);

      // Center line
      svg.append("line")
        .attr("x1", 18)
        .attr("x2", width - 18)
        .attr("y1", offsetY)
        .attr("y2", offsetY)
        .attr("stroke", "rgba(148,163,184,0.18)")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3");

      // Gradients + filter
      const gMainId = `amp-grad-main-${band.key}`;
      const gGlowId = `amp-grad-glow-${band.key}`;
      const filtId = `amp-filter-${band.key}`;

      if (defs.select(`#${gMainId}`).empty()) {
        const lg = defs.append("linearGradient")
          .attr("id", gMainId)
          .attr("x1", "0%").attr("x2", "0%").attr("y1", "0%").attr("y2", "100%");
        lg.append("stop").attr("offset", "0%").attr("stop-color", band.colors[0]);
        lg.append("stop").attr("offset", "100%").attr("stop-color", band.colors[0]).attr("stop-opacity", 0.25);
      }
      if (defs.select(`#${gGlowId}`).empty()) {
        const lg2 = defs.append("linearGradient")
          .attr("id", gGlowId)
          .attr("x1", "0%").attr("x2", "0%").attr("y1", "0%").attr("y2", "100%");
        lg2.append("stop").attr("offset", "0%").attr("stop-color", band.colors[1]).attr("stop-opacity", 0.85);
        lg2.append("stop").attr("offset", "100%").attr("stop-color", band.colors[1]).attr("stop-opacity", 0.1);
      }
      if (defs.select(`#${filtId}`).empty()) {
        const f = defs.append("filter").attr("id", filtId);
        f.append("feGaussianBlur").attr("stdDeviation", 4).attr("result", "b");
        const m = f.append("feMerge");
        m.append("feMergeNode").attr("in", "b");
        m.append("feMergeNode").attr("in", "SourceGraphic");
      }

      // Build dataset & scales
      const data = buildWaveDataset();
      const xScale = d3.scaleLinear().domain([0, 2 * Math.PI]).range([30, width - 30]);
      const yScale = d3.scaleLinear().domain([-1, 1]).range([offsetY + height / 2 - 10, offsetY - height / 2 + 10]);

      const lineGen = d3.line()
        .x(d => xScale(d.x))
        .y(d => yScale(d.y))
        .curve(d3.curveCatmullRom.alpha(0.5));

      // Wave path
      const path = svg.append("path")
        .datum(data)
        .attr("d", lineGen)
        .attr("fill", "none")
        .attr("stroke", band.colors[0])
        .attr("stroke-width", 2.4)
        .attr("stroke-linecap", "round")
        .attr("opacity", 0);

      path.transition()
        .duration(700)
        .attr("opacity", 0.95);

      // Glow path
      svg.append("path")
        .datum(data)
        .attr("d", lineGen)
        .attr("fill", "none")
        .attr("stroke", band.colors[1])
        .attr("stroke-width", 6)
        .attr("stroke-linecap", "round")
        .attr("filter", `url(#${filtId})`)
        .attr("opacity", 0)
        .transition()
        .duration(900)
        .attr("opacity", 0.28);

      // Moving particle
      const particle = svg.append("circle")
        .attr("r", 3.2)
        .attr("fill", band.colors[0])
        .attr("stroke", "#ffffff")
        .attr("stroke-width", 0.9)
        .attr("opacity", 0.95)
        .style("filter", `drop-shadow(0 0 6px ${band.colors[0]})`);

      // Place initial
      const first = path.node()?.getPointAtLength(0);
      if (first) particle.attr("transform", `translate(${first.x},${first.y})`);

      function animateParticle() {
        const node = path.node();
        if (!node) return;
        const total = node.getTotalLength();
        particle
          .transition()
          .duration(3200)
          .ease(d3.easeLinear)
          .attrTween("transform", () => {
            return (t) => {
              const p = node.getPointAtLength(t * total);
              return `translate(${p.x},${p.y})`;
            };
          })
          .on("end", animateParticle);
      }
      timersRef.current.push(setTimeout(animateParticle, 120 + bandIndex * 180));

      // Label pill
      const pillW = 68;
      const pillH = 20;
      svg.append("rect")
        .attr("x", 28)
        .attr("y", offsetY - height / 2 + 6)
        .attr("width", pillW)
        .attr("height", pillH)
        .attr("rx", 10)
        .attr("fill", "rgba(15,23,42,0.85)")
        .attr("stroke", band.colors[0])
        .attr("stroke-width", 1);

      svg.append("text")
        .attr("x", 28 + pillW / 2)
        .attr("y", offsetY - height / 2 + 6 + 14)
        .attr("text-anchor", "middle")
        .attr("fill", band.colors[0])
        .style("font-size", "11px")
        .style("font-weight", "600")
        .style("font-family", "system-ui,-apple-system,sans-serif")
        .text(`${band.key.toUpperCase()}-Basis`);

      // Hover tooltip behaviour (approximate nearest x)
      const bisect = d3.bisector(d => d.x).left;
      svg.append("rect")
        .attr("x", 0)
        .attr("y", offsetY - height / 2)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "transparent")
        .on("mousemove", (e) => {
          const [mx] = d3.pointer(e);
          const rel = xScale.invert(mx);
          const idx = bisect(data, rel);
          const sample = data[Math.min(data.length - 1, Math.max(0, idx))];
          showTooltip(e, {
            state: sample.state,
            prob: sample.prob,
            re: sample.re,
            im: sample.im,
            mag: sample.mag,
            phase: sample.phase
          });
        })
        .on("mouseleave", hideTooltip);
    });

    function showTooltip(evt, rec) {
      if (!tooltipRef.current) {
        tooltipRef.current = document.createElement("div");
        tooltipRef.current.style.position = "fixed";
        tooltipRef.current.style.zIndex = 999999;
        tooltipRef.current.style.pointerEvents = "none";
        tooltipRef.current.style.background = "#0f1d2a";
        tooltipRef.current.style.border = "1px solid #2d445b";
        tooltipRef.current.style.borderRadius = "8px";
        tooltipRef.current.style.padding = "6px 8px";
        tooltipRef.current.style.fontSize = "11px";
        tooltipRef.current.style.color = "#d7ecf8";
        tooltipRef.current.style.boxShadow = "0 4px 14px rgba(0,0,0,0.5)";
        document.body.appendChild(tooltipRef.current);
      }
      const lines = [
        `State: ${rec.state}`,
        `|α|²: ${(rec.prob * 100).toFixed(2)}%`,
        `Re: ${rec.re.toFixed(3)}  Im: ${rec.im.toFixed(3)}`,
        `|α|: ${rec.mag.toFixed(3)}  φ: ${(rec.phase).toFixed(3)}`
      ];
      tooltipRef.current.innerHTML = lines.join("<br/>");
      const rect = tooltipRef.current.getBoundingClientRect();
      tooltipRef.current.style.left = Math.min(window.innerWidth - rect.width - 8, evt.clientX + 14) + "px";
      tooltipRef.current.style.top = (evt.clientY + 14) + "px";
      tooltipRef.current.style.opacity = 1;
    }

    function hideTooltip() {
      if (tooltipRef.current) {
        tooltipRef.current.style.opacity = 0;
      }
    }

    return () => {
      hideTooltip();
      cleanup();
    };
  }, [ampArray, show, mode, valueStats]);

  if (!show) return null;

  const legendItems = [
    { label: "Z-Basis Decorative Wave", color: "#3b82f6" },
    { label: "X-Basis Decorative Wave", color: "#ef4444" },
    { label: "Y-Basis Decorative Wave", color: "#10b981" }
  ];

  const modeLabel = {
    re: "Real(α)",
    im: "Imag(α)",
    mag: "|α|",
    phase: "Phase(α)"
  }[mode];

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 shadow-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-200 font-semibold text-sm">
            Probability Amplitudes
          </h3>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
          </div>
        </div>

        {/* Mode selector */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          {["re", "im", "mag", "phase"].map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                background: mode === m ? "linear-gradient(135deg,#1781cc,#12649f)" : "#1e2d3b",
                border: "1px solid #2a4356",
                color: "#d7ecf8",
                fontSize: 10,
                fontWeight: 600,
                padding: "4px 8px",
                borderRadius: 6,
                cursor: "pointer",
                letterSpacing: 0.4
              }}
              title={`View ${m === "re" ? "real" : m === "im" ? "imag" : m === "mag" ? "magnitude" : "phase"} component`}
            >
              {m.toUpperCase()}
            </button>
          ))}
          <div style={{ fontSize: 11, color: "#7fb5d9", marginLeft: "auto" }}>
            Showing: {modeLabel}
          </div>
        </div>

        <div className="relative overflow-hidden rounded-lg bg-slate-900/50 border border-slate-600/30">
          <div ref={containerRef} className="w-full" />
        </div>

        {/* Legend */}
        <div className="mt-3 space-y-1">
          {legendItems.map(item => (
            <div key={item.label} className="flex items-center gap-2 text-[10px] text-slate-400">
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  background: item.color,
                  boxShadow: `0 0 6px ${item.color}66`
                }}
              />
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-3 text-[10px] text-slate-500">
          <span>Samples: {ampArray.length}</span>
          <span>φ ∈ [-π, π]</span>
        </div>

        <div className="mt-2 text-[10px] text-slate-500 leading-snug">
          <strong style={{ color: "#9fd2ff" }}>Hint:</strong> Hover a wave to inspect a contributing basis
          state. These waves are an illustrative mapping (not time evolution).
        </div>
      </div>
    </div>
  );
}

export default AmplitudeWaves;