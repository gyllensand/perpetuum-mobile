import { Suspense, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import Scene from "./Scene";
import { Sampler } from "tone";

console.log(
  "%c * Computer Emotions * ",
  "color: #d80fe7; font-size: 14px; background-color: #000000;"
);

console.log(
  "%c http://www.computeremotions.com ",
  "font-size: 12px; background-color: #000000;"
);

const baseUrl = `${process.env.PUBLIC_URL}/audio/`;

export interface Sample {
  index: number;
  sampler: Sampler;
}

export const HITS: Sample[] = [
  {
    index: 0,
    sampler: new Sampler({
      urls: {
        1: `d3.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 1,
    sampler: new Sampler({
      urls: {
        1: `a2.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 2,
    sampler: new Sampler({
      urls: {
        1: `f2s.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 3,
    sampler: new Sampler({
      urls: {
        1: `b2.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 4,
    sampler: new Sampler({
      urls: {
        1: `f3s.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 5,
    sampler: new Sampler({
      urls: {
        1: `d2.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 6,
    sampler: new Sampler({
      urls: {
        1: `e3.mp3`,
      },
      baseUrl,
    }),
  },
  {
    index: 7,
    sampler: new Sampler({
      urls: {
        1: `e3-2.mp3`,
      },
      baseUrl,
    }),
  },
];

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  return (
    <Canvas
      ref={canvasRef}
      camera={{ position: [0, 0, 30] }}
      dpr={window.devicePixelRatio}
    >
      <Suspense fallback={null}>
        <Scene canvasRef={canvasRef} />
      </Suspense>
    </Canvas>
  );
};

export default App;
