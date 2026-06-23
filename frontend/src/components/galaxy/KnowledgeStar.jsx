import { Html } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

import StarOrbitResources from "./StarOrbitResources.jsx";

export default function KnowledgeStar({ node, selected, dimmed, onSelect }) {
  const meshRef = useRef();
  const pulseRef = useRef();
  const [hovered, setHovered] = useState(false);
  const color = useMemo(() => new THREE.Color(node.color), [node.color]);

  useFrame((state) => {
    if (!meshRef.current) return;
    const pulse = 1 + Math.sin(state.clock.elapsedTime * (node.type === "boss" ? 3.6 : 2.1) + node.id) * (node.type === "boss" ? 0.1 : 0.045);
    meshRef.current.scale.setScalar(pulse * (selected ? 1.16 : 1));
    if (pulseRef.current) {
      pulseRef.current.scale.setScalar(1.55 + Math.sin(state.clock.elapsedTime * 2.3 + node.id) * 0.16);
      pulseRef.current.material.opacity = node.risk >= 70 || node.type === "boss" ? 0.25 + Math.sin(state.clock.elapsedTime * 3) * 0.08 : 0.08;
    }
  });

  return (
    <group position={[node.x, node.y, node.z]}>
      <mesh
        ref={meshRef}
        onClick={(event) => {
          event.stopPropagation();
          onSelect?.(node);
        }}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "default";
        }}
      >
        <sphereGeometry args={[node.size, 32, 32]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={(dimmed ? 0.18 : node.brightness) + (hovered || selected ? 0.45 : 0)}
          roughness={0.42}
          metalness={0.12}
          transparent
          opacity={dimmed ? 0.28 : node.unlocked ? 0.96 : 0.42}
        />
      </mesh>

      {(node.risk >= 70 || node.type === "boss" || selected) && (
        <mesh ref={pulseRef}>
          <sphereGeometry args={[node.size * 1.45, 32, 32]} />
          <meshBasicMaterial color={node.type === "boss" || node.risk >= 70 ? "#fb7185" : "#a78bfa"} transparent opacity={0.16} depthWrite={false} />
        </mesh>
      )}

      <StarOrbitResources count={node.resource_count} radius={node.size + 0.72} />

      {Array.from({ length: Math.min(node.quiz_count, 4) }).map((_, index) => (
        <mesh key={index} position={[node.size * (1.7 + index * 0.18), node.size * 0.42, -node.size * (0.9 + index * 0.24)]} rotation={[0.2, 0.4, -0.72]}>
          <boxGeometry args={[0.9, 0.025, 0.025]} />
          <meshBasicMaterial color="#c4b5fd" transparent opacity={0.48} />
        </mesh>
      ))}

      {(hovered || selected) && (
        <Html center distanceFactor={9} position={[0, node.size + 0.8, 0]}>
          <div className="whitespace-nowrap rounded-full border border-white/10 bg-slate-950/85 px-3 py-1 text-xs font-semibold text-white shadow-[0_0_22px_rgba(34,211,238,.22)] backdrop-blur-xl">
            {node.title}
          </div>
        </Html>
      )}
    </group>
  );
}
