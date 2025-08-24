import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

function AmplitudeWaves({ amplitudes, show }) {
  const ref = useRef();
  const timersRef = useRef([]);

  useEffect(() => {
    // cleanup helper
    const cleanup = () => {
      timersRef.current.forEach((id) => clearTimeout(id));
      timersRef.current.length = 0;
      if (ref.current) {
        // interrupt transitions and remove nodes
        d3.select(ref.current).selectAll("*").each(function () {
          d3.select(this).interrupt();
        });
        d3.select(ref.current).selectAll("*").remove();
      }
    };

    if (!amplitudes || !show) {
      cleanup();
      return;
    }

    // ensure old content removed
    cleanup();

    // visual layout (matching your original)
    const width = 280;
    const height = 60;
    const spacing = 20;
    const totalHeight = height * 3 + spacing * 2;

    const svg = d3
      .select(ref.current)
      .append("svg")
      .attr("width", width)
      .attr("height", totalHeight)
      .style("background", "transparent")
      .style("border-radius", "8px");

    // Add subtle vertical grid lines (optional)
    const gridGroup = svg.append("g").attr("class", "grid");
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

    // Convert amplitudes -> array of {state, re, im, prob}
    const ampData = Object.entries(amplitudes).map(([state, { re, im, prob }]) => ({
      state,
      re,
      im,
      prob,
    }));

    // Helper that builds each basis wave block
    const makeWave = (basis, colors, offsetY, basisIndex = 0) => {
      const xScale = d3.scaleLinear().domain([0, 2 * Math.PI]).range([20, width - 20]);
      // yScale: ensure top < bottom in SVG coords
      const yScale = d3
        .scaleLinear()
        .domain([-1, 1])
        .range([offsetY - height / 2 + 10, offsetY + height / 2 - 10]);

      // choose amplitude components for visualization (safe fallback)
      const maxAmp = d3.max(ampData, (d) => Math.abs(d.re)) || 1;

      // Build path generator
      const lineGen = d3
        .line()
        .x((d) => xScale(d.x))
        .y((d) => yScale(Math.sin(d.x) * (d.amp / maxAmp)))
        .curve(d3.curveCardinal);

      // defs: gradients & filter (unique ids per basis)
      const defs = svg.select("defs").empty() ? svg.append("defs") : svg.select("defs");
      const gradId0 = `gradient-${basis}-0`;
      const gradId1 = `gradient-${basis}-1`;
      const blurId = `blur-${basis}-${basisIndex}`;

      // linear gradients
      if (defs.select(`#${gradId0}`).empty()) {
        const g0 = defs.append("linearGradient").attr("id", gradId0).attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", 0).attr("y1", offsetY - height / 2).attr("x2", 0).attr("y2", offsetY + height / 2);
        g0.append("stop").attr("offset", "0%").attr("stop-color", colors[0]).attr("stop-opacity", 0.9);
        g0.append("stop").attr("offset", "100%").attr("stop-color", colors[0]).attr("stop-opacity", 0.25);
      }
      if (defs.select(`#${gradId1}`).empty()) {
        const g1 = defs.append("linearGradient").attr("id", gradId1).attr("gradientUnits", "userSpaceOnUse")
          .attr("x1", 0).attr("y1", offsetY - height / 2).attr("x2", 0).attr("y2", offsetY + height / 2);
        g1.append("stop").attr("offset", "0%").attr("stop-color", colors[1] || colors[0]).attr("stop-opacity", 0.85);
        g1.append("stop").attr("offset", "100%").attr("stop-color", colors[1] || colors[0]).attr("stop-opacity", 0.2);
      }

      // blur filter for glow
      if (defs.select(`#${blurId}`).empty()) {
        const filter = defs.append("filter").attr("id", blurId);
        filter.append("feGaussianBlur").attr("stdDeviation", 4).attr("result", "blurOut");
        const feMerge = filter.append("feMerge");
        feMerge.append("feMergeNode").attr("in", "blurOut");
        feMerge.append("feMergeNode").attr("in", "SourceGraphic");
      }

      // Background rounded rect for the basis band (subtle)
      svg.append("rect")
        .attr("x", 20)
        .attr("y", offsetY - height / 2)
        .attr("width", width - 40)
        .attr("height", height)
        .attr("fill", "rgba(15, 23, 42, 0.28)")
        .attr("rx", 6)
        .attr("stroke", "rgba(148,163,184,0.06)")
        .attr("stroke-width", 1);

      // Build curveData sampling
      const curveData = d3.range(0, 2 * Math.PI + 0.0001, 0.02).map((x, idx) => ({
        x,
        amp: ampData[idx % ampData.length]?.re ?? 0, // cycle if fewer components
      }));

      // Create the main visual path (visible)
      const mainPath = svg.append("path")
        .datum(curveData)
        .attr("d", lineGen)
        .attr("fill", "none")
        .attr("stroke", colors[0])
        .attr("stroke-width", 2.5)
        .attr("stroke-linecap", "round")
        .attr("opacity", 0)
        .transition()
        .duration(700)
        .attr("opacity", 0.95);

      // Create glow path (wider stroke + blur filter)
      const glowPath = svg.append("path")
        .datum(curveData)
        .attr("d", lineGen)
        .attr("fill", "none")
        .attr("stroke", colors[1] || colors[0])
        .attr("stroke-width", 6)
        .attr("stroke-linecap", "round")
        .attr("opacity", 0.0)
        .attr("filter", `url(#${blurId})`)
        .transition()
        .duration(900)
        .attr("opacity", 0.28);

      // For exact particle-on-path animation we use the path DOM API:
      // Wait a tick so path node has its d computed
      timersRef.current.push(
        setTimeout(() => {
          try {
            const pathNode = mainPath.node();
            if (!pathNode) return;

            const totalLen = pathNode.getTotalLength();

            // Create particle
            const particle = svg
              .append("circle")
              .attr("r", 3)
              .attr("fill", colors[0])
              .attr("stroke", "#ffffff")
              .attr("stroke-width", 0.9)
              .attr("opacity", 0.95)
              .attr("pointer-events", "none")
              .style("filter", `drop-shadow(0 0 6px ${colors[0]})`);

            // place initial at start
            const p0 = pathNode.getPointAtLength(0);
            particle.attr("transform", `translate(${p0.x}, ${p0.y})`);

            // animate particle along path using getPointAtLength (exact)
            function animateParticleAlongPath() {
              particle
                .transition()
                .duration(3000)
                .ease(d3.easeLinear)
                .attrTween("transform", () => {
                  return (t) => {
                    const point = pathNode.getPointAtLength(t * totalLen);
                    return `translate(${point.x}, ${point.y})`;
                  };
                })
                .on("end", animateParticleAlongPath);
            }

            // start with a small randomized delay so particles are staggered across waves
            const startDelay = 100 + basisIndex * 200;
            timersRef.current.push(setTimeout(() => animateParticleAlongPath(), startDelay));
          } catch (e) {
            // safe-guard
            console.warn("Particle animation error:", e);
          }
        }, 120) // small timeout to let the path be usable
      );

      // Small styled label pill
      const pillX = 25;
      const pillY = offsetY - height / 2 + 5;
      svg.append("rect")
        .attr("x", pillX)
        .attr("y", pillY)
        .attr("width", 60)
        .attr("height", 18)
        .attr("fill", "rgba(15, 23, 42, 0.8)")
        .attr("rx", 9)
        .attr("stroke", colors[0])
        .attr("stroke-width", 1);

      svg.append("text")
        .attr("x", pillX + 30)
        .attr("y", pillY + 13)
        .text(`${basis.toUpperCase()}-Basis`)
        .attr("fill", colors[0])
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-weight", "600")
        .style("font-family", "system-ui, -apple-system, sans-serif");

      // center dashed line
      svg.append("line")
        .attr("x1", 20)
        .attr("y1", offsetY)
        .attr("x2", width - 20)
        .attr("y2", offsetY)
        .attr("stroke", "rgba(148,163,184,0.14)")
        .attr("stroke-width", 1)
        .attr("stroke-dasharray", "3,3");
    };

    // Draw waves (Z, X, Y). basisIndex used to stagger particle start delays
    makeWave("z", ["#3b82f6", "#60a5fa"], height / 2 + 10, 0);
    makeWave("x", ["#ef4444", "#f87171"], height * 1.5 + spacing + 10, 1);
    makeWave("y", ["#10b981", "#34d399"], height * 2.5 + spacing * 2 + 10, 2);

    // cleanup on unmount / deps change
    return () => cleanup();
  }, [amplitudes, show]);

  if (!show) return null;

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

        <div className="relative overflow-hidden rounded-lg bg-slate-900/50 border border-slate-600/30">
          <div ref={ref} className="w-full"></div>
        </div>

        <div className="flex justify-between mt-3 text-xs text-slate-400">
          <span>Real Components</span>
          <span>φ = 0 → 2π</span>
        </div>
      </div>
    </div>
  );
}

export default AmplitudeWaves;
