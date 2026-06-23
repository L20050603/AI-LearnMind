import { useFrame } from "@react-three/fiber";
import { useMemo, useRef } from "react";
import * as THREE from "three";

export default function StarOrbitResources({ count = 0, radius = 1.35 }) {
  const groupRef = useRef();
  const visibleCount = Math.min(count, 8);
  const orbitGeometry = useMemo(() => {
    const points = new Array(72).fill(0).map((_, index) => {
      const angle = (index / 71) * Math.PI * 2;
      return new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.8;
  });

  if (!visibleCount) return null;

  return (
    <group ref={groupRef}>
      {Array.from({ length: visibleCount }).map((_, index) => {
        const angle = (index / visibleCount) * Math.PI * 2;
        return (
          <mesh key={index} position={[Math.cos(angle) * radius, Math.sin(index * 1.7) * 0.16, Math.sin(angle) * radius]}>
            <sphereGeometry args={[0.07, 12, 12]} />
            <meshBasicMaterial color="#67e8f9" toneMapped={false} />
          </mesh>
        );
      })}
      <line geometry={orbitGeometry}>
        <lineBasicMaterial color="#22d3ee" transparent opacity={0.18} />
      </line>
    </group>
  );
}
