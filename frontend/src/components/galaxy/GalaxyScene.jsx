import { OrbitControls, Stars } from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

import KnowledgeStar from "./KnowledgeStar.jsx";
import StarLink from "./StarLink.jsx";

function CameraRig({ flyTarget }) {
  const controlsRef = useRef();
  const { camera } = useThree();
  const desiredPosition = useMemo(() => new THREE.Vector3(), []);
  const desiredTarget = useMemo(() => new THREE.Vector3(), []);
  const flyingRef = useRef(false);

  useEffect(() => {
    if (!flyTarget) return;
    desiredTarget.set(flyTarget.x, flyTarget.y, flyTarget.z);
    desiredPosition.set(flyTarget.x + 6.5, flyTarget.y + 4.2, flyTarget.z + 8.5);
    flyingRef.current = true;
  }, [flyTarget?.id, flyTarget?.nonce, desiredPosition, desiredTarget]);

  useFrame(() => {
    if (!flyingRef.current || !controlsRef.current) return;
    camera.position.lerp(desiredPosition, 0.085);
    controlsRef.current.target.lerp(desiredTarget, 0.105);
    controlsRef.current.update();
    if (camera.position.distanceTo(desiredPosition) < 0.08 && controlsRef.current.target.distanceTo(desiredTarget) < 0.08) {
      flyingRef.current = false;
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.08}
      enableRotate
      enableZoom
      enablePan
      screenSpacePanning
      rotateSpeed={0.65}
      zoomSpeed={0.8}
      panSpeed={0.75}
      minDistance={4}
      maxDistance={56}
    />
  );
}

export default function GalaxyScene({ nodes, links, selectedNode, flyTarget, filter, onSelectNode }) {
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

      <CameraRig flyTarget={flyTarget} />
    </>
  );
}
