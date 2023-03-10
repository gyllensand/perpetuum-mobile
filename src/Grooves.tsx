import { a } from "@react-spring/three";
import { useEffect, useRef } from "react";
import { AdditiveBlending, Mesh, Vector3 } from "three";
const Grooves = ({
  index,
  radius,
  depth,
  color,
  thetaStart,
  gap,
  width,
  cameraPosition,
}: {
  index: number;
  radius: number;
  depth: number;
  color: string;
  thetaStart: number;
  gap: number;
  width: number;
  cameraPosition: Vector3;
}) => {
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    const angle = thetaStart + index * Math.PI * gap;

    meshRef
      .current!.position.set(Math.cos(angle), Math.sin(angle), 0)
      .multiplyScalar(radius * 21 + (depth / 2) * 1);

    meshRef.current?.lookAt(cameraPosition);
  }, [cameraPosition, depth, gap, index, radius, thetaStart]);

  return (
    <a.mesh ref={meshRef}>
      <boxGeometry args={[0.05, width, depth, 1, 1]} />
      <meshBasicMaterial
        color={color}
        blending={AdditiveBlending}
        transparent
        toneMapped={false}
      />
    </a.mesh>
  );
};

export default Grooves;
