import type { CompanyReport } from "@lib/types";

/**
 * Simple node-link view of the target's neighborhood (#17) — deliberately light.
 * The lit node is the searched company; ring nodes are ranked competitors, with
 * link weight and node size scaled by shared-edge count. Deterministic layout
 * (no physics sim, no randomness) so it renders identically every time.
 */
const CX = 240;
const CY = 190;
const R = 132;

export function GraphViz({ report }: { report: CompanyReport }) {
  const { enrichment, competitors } = report;
  const n = Math.max(competitors.length, 1);
  const max = Math.max(...competitors.map((c) => c.sharedEdges), 1);

  const nodes = competitors.map((c, i) => {
    const angle = ((-90 + (360 / n) * i) * Math.PI) / 180;
    const x = CX + R * Math.cos(angle);
    const y = CY + R * Math.sin(angle);
    const cos = Math.cos(angle);
    const anchor: "start" | "end" | "middle" =
      cos > 0.3 ? "start" : cos < -0.3 ? "end" : "middle";
    const lx = CX + (R + 12) * Math.cos(angle);
    const ly = CY + (R + 12) * Math.sin(angle) + (Math.sin(angle) > 0.3 ? 8 : 0);
    return { c, x, y, anchor, lx, ly, top: i === 0 };
  });

  return (
    <div className="w-full overflow-x-auto">
      <svg
        viewBox="0 0 480 400"
        className="h-auto w-full max-w-[480px]"
        role="img"
        aria-label={`Graph neighborhood of ${enrichment.name} with ${competitors.length} competitors`}
      >
        {/* Links first (drawn under nodes). */}
        {nodes.map(({ c, x, y, top }) => (
          <line
            key={`edge-${c.name}`}
            x1={CX}
            y1={CY}
            x2={x}
            y2={y}
            stroke={top ? "rgb(var(--accent))" : "rgb(var(--ink))"}
            strokeOpacity={top ? 0.5 : 0.12 + (c.sharedEdges / max) * 0.2}
            strokeWidth={1 + (c.sharedEdges / max) * 1.5}
          />
        ))}

        {/* Competitor nodes. */}
        {nodes.map(({ c, x, y, anchor, lx, ly, top }) => (
          <g key={`node-${c.name}`}>
            <circle
              cx={x}
              cy={y}
              r={4 + (c.sharedEdges / max) * 2}
              className={top ? "fill-accent" : "fill-muted"}
            />
            <text
              x={lx}
              y={ly}
              textAnchor={anchor}
              className="fill-muted font-mono"
              style={{ fontSize: "10px" }}
            >
              {c.name}
            </text>
          </g>
        ))}

        {/* Target node — the one lit node. */}
        <circle cx={CX} cy={CY} r={7} className="fill-accent" />
        <circle cx={CX} cy={CY} r={13} fill="none" stroke="rgb(var(--accent))" strokeOpacity={0.35} />
        <text
          x={CX}
          y={CY + 30}
          textAnchor="middle"
          className="fill-ink font-mono"
          style={{ fontSize: "12px", fontWeight: 500 }}
        >
          {enrichment.name}
        </text>
      </svg>

      <p className="mt-3 font-mono text-[11px] leading-relaxed text-muted">
        Link weight and node size scale with shared edges. The lit node is the
        searched company.
      </p>
    </div>
  );
}
