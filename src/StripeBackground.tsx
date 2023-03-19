import { useTexture } from "@react-three/drei";
import { useMemo } from "react";
import { AdditiveBlending } from "three";
import { COLORS } from "./constants";
import {
  pickRandom,
  pickRandomDecimalFromInterval,
  pickRandomIntFromInterval,
} from "./utils";

const zIndex = pickRandomIntFromInterval(-10, -20);
const opacity = pickRandomDecimalFromInterval(0.03, 0.05);
const color = pickRandom(COLORS);
const gap = pickRandomDecimalFromInterval(1.5, 3);

const StripeBackground = () => {
  const asset = useTexture(`${process.env.PUBLIC_URL}/line.png`);
  const xCount = useMemo(() => 300, []);
  const yCount = useMemo(() => 100, []);

  const pointsArray = useMemo(() => {
    const positions = [];

    for (let xi = 0; xi < xCount; xi++) {
      for (let yi = 0; yi < yCount; yi++) {
        const x = gap * (xi - xCount / 2);
        const y = gap * (yi - yCount / 2);

        positions.push(x, y, zIndex);
      }
    }

    return new Float32Array(positions);
  }, [xCount, yCount]);

  return (
    <points>
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={pointsArray}
          count={pointsArray.length / 3}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        attach="material"
        map={asset}
        color={color}
        size={9}
        sizeAttenuation
        transparent
        depthWrite={false}
        toneMapped={false}
        blending={AdditiveBlending}
        opacity={opacity}
      />
    </points>
  );
};

export default StripeBackground;
