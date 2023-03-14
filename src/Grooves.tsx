import { a, SpringValue } from "@react-spring/three";
import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { AdditiveBlending, BackSide, Mesh, Vector3 } from "three";

const Grooves = ({
  index,
  radius,
  depth,
  color,
  thetaStart,
  gap,
  width,
  cameraPosition,
  scale,
}: {
  index: number;
  radius: number;
  depth: number;
  color: string;
  thetaStart: number;
  gap: SpringValue<number>;
  width: number;
  cameraPosition: SpringValue<number[]>;
  scale: SpringValue<number[]>;
}) => {
  const meshRef = useRef<Mesh>(null);

  useFrame(() => {
    const angle = thetaStart + index * Math.PI * gap.get();

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
      <boxGeometry args={[0.05, width, depth, 1, 1]} />
      <meshBasicMaterial
        color={color}
        blending={AdditiveBlending}
        transparent
        toneMapped={false}
        side={BackSide}
      />
    </a.mesh>
  );
};

export default Grooves;
