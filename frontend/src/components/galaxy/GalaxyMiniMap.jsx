export default function GalaxyMiniMap({ nodes = [], selectedNode, onSelect }) {
  if (!nodes.length) return null;
  const xs = nodes.map((node) => node.x);
  const zs = nodes.map((node) => node.z);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minZ = Math.min(...zs);
  const maxZ = Math.max(...zs);

  function pos(node, axis) {
    const min = axis === "x" ? minX : minZ;
    const max = axis === "x" ? maxX : maxZ;
    return ((axis === "x" ? node.x : node.z) - min) / Math.max(1, max - min) * 88 + 6;
  }

  return (
    <div className="pointer-events-auto rounded-3xl border border-white/10 bg-slate-950/72 p-4 backdrop-blur-xl">
      <p className="mb-3 text-sm font-semibold text-white">星图小地图</p>
      <div className="relative h-32 rounded-2xl border border-cyan-200/15 bg-cyan-400/[0.035]">
        {nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            title={node.title}
            onClick={() => onSelect?.(node)}
            className={`absolute h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full ${
              selectedNode?.id === node.id ? "bg-white shadow-[0_0_16px_rgba(255,255,255,.9)]" : node.type === "boss" ? "bg-rose-400" : "bg-cyan-300"
            }`}
            style={{ left: `${pos(node, "x")}%`, top: `${pos(node, "z")}%` }}
          />
        ))}
      </div>
    </div>
  );
}
