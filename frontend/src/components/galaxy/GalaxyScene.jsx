import { OrbitControls, Stars } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

import KnowledgeStar from "./KnowledgeStar.jsx";
import StarLink from "./StarLink.jsx";

function CameraRig({ focusNode }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(), []);

  useFrame(() => {
    if (!focusNode || !controlsRef.current) return;
    desiredTarget.set(focusNode.x, focusNode.y, focusNode.z);
    desiredPosition.set(focusNode.x + 6.5, focusNode.y + 4.2, focusNode.z + 8.5);
    camera.position.lerp(desiredPosition, 0.045);
    controlsRef.current.target.lerp(desiredTarget, 0.055);
    controlsRef.current.update();
  });

  return <OrbitControls ref={controlsRef} enableDamping dampingFactor={0.08} minDistance={5} maxDistance={42} />;
}

export default function GalaxyScene({ nodes, links, selectedNode, focusNode, filter, onSelectNode }) {
  const nodeMap = useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes]);

  function matchesFilter(node) {
    if (filter === "mastered") return node.mastery >= 80;
    if (filter === "weak") return node.mastery < 70;
    if (filter === "high-risk") return node.risk >= 70;
    if (filter === "boss") return node.type === "boss";
    if (filter === "locked") return !node.unlocked || node.status === "locked";
    if (filter === "resources") return node.resource_count > 0;
    if (filter === "wrong") return node.wrong_count > 0;
    return true;
  }

  return (
    <>
      <color attach="background" args={["#020617"]} />
      <fog attach="fog" args={["#020617", 22, 60]} />
      <ambientLight intensity={0.28} />
      <pointLight position={[0, 8, 0]} intensity={1.35} color="#67e8f9" />
      <pointLight position={[12, -4, -8]} intensity={0.85} color="#a78bfa" />
      <Stars radius={90} depth={45} count={2400} factor={4} saturation={0} fade speed={0.75} />

      {links.map((link, index) => (
        <StarLink key={`${link.source}-${link.target}-${index}`} source={nodeMap.get(link.source)} target={nodeMap.get(link.target)} strength={link.strength} />
      ))}

      {nodes.map((node) => (
        <KnowledgeStar
          key={node.id}
          node={node}
          selected={selectedNode?.id === node.id}
          dimmed={!matchesFilter(node)}
          onSelect={onSelectNode}
        />
      ))}

      <CameraRig focusNode={focusNode} />
    </>
  );
}
