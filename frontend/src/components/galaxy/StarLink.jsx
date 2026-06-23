import * as THREE from "three";

export default function StarLink({ source, target, strength = 0.5 }) {
  if (!source || !target) return null;
  const points = [
    new THREE.Vector3(source.x, source.y, source.z),
    new THREE.Vector3((source.x + target.x) / 2, (source.y + target.y) / 2 + 0.8, (source.z + target.z) / 2),
    new THREE.Vector3(target.x, target.y, target.z),
  ];
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.BufferGeometry().setFromPoints(curve.getPoints(32));

  return (
    <line geometry={geometry}>
      <lineBasicMaterial color="#22d3ee" transparent opacity={0.16 + strength * 0.42} />
    </line>
  );
}
