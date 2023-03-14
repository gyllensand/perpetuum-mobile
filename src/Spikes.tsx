import { a, SpringValue } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { AdditiveBlending, Mesh, Vector3 } from "three";

const Spikes = ({
  index,
  radius,
  depth,
  color,
  thetaStart,
  gap,
  cameraPosition,
  scale,
}: {
  index: number;
  radius: number;
  depth: number;
  color: string;
  thetaStart: number;
  gap: number;
  cameraPosition: SpringValue<number[]>;
  scale: SpringValue<number[]>;
}) => {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    const angle = thetaStart + index * Math.PI * gap;

    meshRef
      .current!.position.set(Math.cos(angle), Math.sin(angle), 0)
      .multiplyScalar(radius * 21 + (depth / 2) * scale.get()[2]);

    meshRef.current?.lookAt(
      new Vector3(
        cameraPosition.get()[0],
        cameraPosition.get()[1],
        cameraPosition.get()[2]
      )
    );
  });

  return (
    // @ts-ignore
    <a.mesh ref={meshRef} scale={scale}>
      <boxGeometry args={[0.05, 0.05, depth, 1, 1]} />
      <meshBasicMaterial
        color={color}
        blending={AdditiveBlending}
        transparent
        toneMapped={false}
      />
    </a.mesh>
  );
};

export default Spikes;
