import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

import GalaxyScene from "./GalaxyScene.jsx";

export default function KnowledgeGalaxyCanvas({ nodes, links, selectedNode, flyTarget, filter, onSelectNode, onError }) {
  return (
    <div className="absolute inset-0">
      <Canvas
        camera={{ position: [8, 8, 16], fov: 54 }}
        dpr={[1, 1.6]}
        gl={{ antialias: true, alpha: false, powerPreference: "high-performance", preserveDrawingBuffer: true }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", () => onError?.("WebGL context lost"));
        }}
        onError={(error) => onError?.(error?.message || "Canvas render error")}
      >
        <Suspense fallback={null}>
          <GalaxyScene nodes={nodes} links={links} selectedNode={selectedNode} flyTarget={flyTarget} filter={filter} onSelectNode={onSelectNode} />
        </Suspense>
      </Canvas>
    </div>
  );
}
