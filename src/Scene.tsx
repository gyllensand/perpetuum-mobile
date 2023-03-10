import {
  Edges,
  GradientTexture,
  MeshDistortMaterial,
  OrbitControls,
  shaderMaterial,
  useHelper,
  useTexture,
} from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { RefObject, useEffect, useLayoutEffect, useRef } from "react";
import { a, useSpring } from "@react-spring/three";
import { MeshLineGeometry, MeshLineMaterial } from "meshline";
import {
  AdditiveBlending,
  Color,
  Mesh,
  RepeatWrapping,
  ShaderLib,
  SpotLight,
  SpotLightHelper,
  Vector3,
} from "three";
import {
  COLORS,
  DARK_BG_COLORS,
  GRAY_COLORS,
  LIGHT_GRAY_COLORS,
} from "./constants";
import {
  pickRandom,
  pickRandomBoolean,
  pickRandomColorWithTheme,
  pickRandomDecimalFromInterval,
  pickRandomIntFromInterval,
  range,
} from "./utils";
import Spikes from "./Spikes";
import { vertexShader, fragmentShader } from "./shaders";
import Grooves from "./Grooves";
import Points from "./Points";
import StripeBackground from "./StripeBackground";

extend({ MeshLineGeometry, MeshLineMaterial });

const GrainMaterial = shaderMaterial(
  {
    uLightPos: new Vector3(0, 5, 3),
    uNoiseCoef: 3.5,
    uLightColor: new Color("#ffffff"),
    uColor: new Color("#ff7300"),
  },
  // vertexShader,
  ShaderLib.lambert.vertexShader,
  fragmentShader
);

extend({ GrainMaterial });

const cameraPosition = new Vector3(
  pickRandomDecimalFromInterval(-15, 15),
  pickRandomDecimalFromInterval(-15, 15),
  0
);
const bgColor = pickRandom(DARK_BG_COLORS);
const primaryColor = pickRandom(COLORS);
const secondaryColor = pickRandom(COLORS);
const hasGradient = pickRandomBoolean();
const hasMixedColors = pickRandom([
  ...new Array(9).fill(null).map(() => false),
  true,
]);
const hasStripeBackground = pickRandom([
  ...new Array(9).fill(null).map(() => false),
  true,
]);
const hasPointsBackground = hasStripeBackground
  ? false
  : pickRandom([...new Array(4).fill(null).map(() => false), true]);
export enum PointsBackgroundType {
  "Points" = 0,
  "Lines" = 1,
}
const pointsBackgroundType = pickRandom([0, 0, 1]);

const sides = new Array(12).fill(null).map((_, i) => i * (Math.PI / 6));
const primarySideCount = pickRandom([2, 3, 4, 5, 6]);
const secondarySideCount = pickRandom([1, 2, 3]);
const tertiarySideCount = pickRandom([1, 2]);
const quaternarySideCount = pickRandom([1, 2]);
const primaryLengths = [0, 0, 1 * (Math.PI / 6), 2 * (Math.PI / 6)];
const secondarylengths = [
  0,
  1 * (Math.PI / 6),
  2 * (Math.PI / 6),
  3 * (Math.PI / 6),
];
// enum RingSectionTypes {
//   "empty" = 0,
//   "filled" = 1,
//   "striped" = 2,
//   "textured" = 3,
// }
const ringSectionTypes = [0, 1];

const getSides = (count: number, sideArray: number[]) =>
  new Array(count).fill(null).reduce<number[]>((array) => {
    if (!array.length) {
      array = [pickRandom(sideArray)];
      return array;
    }

    const availableSides = sideArray.filter(
      (side) => !array.find((o) => side === o)
    );

    array.push(pickRandom(availableSides));
    return array;
  }, []);

enum RingSectionAltStart {
  "Default" = 0,
  "DoubleSpiral" = 1,
  "SingleSpiral" = 2,
}
const ringAltStart = pickRandom([0, 0, 0, 1, 2]);
enum RingSectionAltLength {
  "Default" = 0,
  "Irregular" = 1,
  "Flat" = 2,
}
const ringAltLength = pickRandom([0, 0, 0, 1, 2]);

interface RingSectionData {
  thetaStart: number;
  length: number;
  type: number;
  color: string;
  strokeColor: string;
  opacity: number;
}

const primaryRingSides = getSides(primarySideCount, sides).map(
  (thetaStart) => ({
    ringSections: new Array(36).fill(null).map((_, i) => {
      const color = hasMixedColors
        ? pickRandom(COLORS)
        : pickRandomColorWithTheme(primaryColor, COLORS, COLORS.length * 10);

      const type = pickRandom(ringSectionTypes);
      const strokeColor = pickRandom(GRAY_COLORS);
      const length = pickRandom([
        pickRandom(primaryLengths),
        pickRandom(primaryLengths) * (i / 10),
      ]);

      return {
        thetaStart,
        length,
        type,
        color,
        opacity: 1,
        strokeColor,
      };
    }),
  })
);

const secondaryRingSides = getSides(secondarySideCount, sides).map(
  (thetaStart) => ({
    ringSections: new Array(18).fill(null).map((_, i) => {
      const color = hasMixedColors
        ? pickRandom(COLORS)
        : pickRandomColorWithTheme(primaryColor, COLORS, COLORS.length * 10);

      const type = pickRandom(ringSectionTypes);
      const strokeColor = pickRandom(GRAY_COLORS);
      const length = pickRandom([
        pickRandom(primaryLengths),
        pickRandom(primaryLengths) * (i / 10),
      ]);

      return {
        thetaStart,
        length,
        type,
        color,
        opacity: 1,
        strokeColor,
      };
    }),
  })
);

const tertiaryRingSides = getSides(tertiarySideCount, sides).map(
  (thetaStart) => ({
    ringSections: new Array(9).fill(null).map((_, i) => {
      const color = hasMixedColors
        ? pickRandom(COLORS)
        : pickRandomColorWithTheme(primaryColor, COLORS, COLORS.length * 10);

      const type = pickRandom(ringSectionTypes);
      const strokeColor = pickRandom(GRAY_COLORS);
      const length = pickRandom([
        ...new Array(81)
          .fill(null)
          .map(() =>
            pickRandom([
              pickRandom(secondarylengths),
              pickRandom(secondarylengths) * (i / 5),
            ])
          ),
        Math.PI * 2,
      ]);

      return {
        thetaStart,
        length,
        type,
        color,
        opacity: length === Math.PI * 2 ? pickRandom([0.8, 1]) : 1,
        strokeColor,
      };
    }),
  })
);

const quaternaryRingSides = getSides(quaternarySideCount, sides).map(
  (thetaStart) => ({
    ringSections: new Array(4).fill(null).map((_, i) => {
      const color = hasMixedColors
        ? pickRandom(COLORS)
        : pickRandomColorWithTheme(primaryColor, COLORS, COLORS.length * 10);

      const type = pickRandom(ringSectionTypes);
      const strokeColor = pickRandom(GRAY_COLORS);
      const length = pickRandom([
        ...new Array(36)
          .fill(null)
          .map(() =>
            pickRandom([
              pickRandom(secondarylengths),
              pickRandom(secondarylengths) * (i / 2),
            ])
          ),
        Math.PI * 2,
      ]);

      return {
        thetaStart,
        length,
        opacity: length === Math.PI * 2 ? pickRandom([0.8, 1]) : 1,
        type,
        color,
        strokeColor,
      };
    }),
  })
);

const remainingSides = sides.filter(
  (side) =>
    ![
      ...primaryRingSides,
      ...secondaryRingSides,
      ...tertiaryRingSides,
      ...quaternaryRingSides,
    ].find((o) => o.ringSections[0].thetaStart === side)
);

/****************************************************** */

const spikesCount = pickRandom([1, 2, 3]);
const spikes = new Array(spikesCount).fill(null).map(() => {
  const thetaStart = pickRandom([
    pickRandom(sides),
    pickRandom(remainingSides),
  ]);
  const gap = pickRandomDecimalFromInterval(0.01, 0.05);
  const count = pickRandomIntFromInterval(6, 18);
  const color = pickRandom([0, 1]);
  const solidColor = pickRandom(COLORS);

  return {
    spikes: new Array(count).fill(null).map(() => ({
      thetaStart,
      depth: pickRandomDecimalFromInterval(5, 30),
      color: color === 0 ? pickRandom(LIGHT_GRAY_COLORS) : solidColor,
      gap,
    })),
  };
});

/****************************************************** */

const groovesCount = pickRandom([1, 2, 3]);
const groovesSides = getSides(groovesCount, remainingSides);
const grooves = new Array(groovesCount).fill(null).map((_, outerIndex) => {
  const radius = pickRandomDecimalFromInterval(0.62, 1.6);
  const width = pickRandomDecimalFromInterval(0.4, 0.6);
  const gap = range(0.62, 1.6, 0.02, 0.015, radius);
  const count = pickRandomIntFromInterval(6, 36);
  const color = pickRandom(COLORS);
  const hasSameDepth = pickRandomBoolean();
  const uniDepth = pickRandomDecimalFromInterval(2, 3);

  return {
    grooves: new Array(count).fill(null).map(() => ({
      thetaStart: groovesSides[outerIndex],
      radius,
      depth: hasSameDepth ? uniDepth : pickRandomDecimalFromInterval(2, 3),
      color: hasMixedColors ? pickRandom(COLORS) : color,
      gap,
      width,
    })),
  };
});

/****************************************************** */

const circleCount = pickRandom([0, 1, 2, 3]);
const circles = new Array(circleCount).fill(null).map(() => {
  const distort = pickRandomDecimalFromInterval(0, 0.5);
  const thetaStart = pickRandom([
    ...primaryRingSides.map((o) => o.ringSections[0].thetaStart),
    ...secondaryRingSides.map((o) => o.ringSections[0].thetaStart),
    ...tertiaryRingSides.map((o) => o.ringSections[0].thetaStart),
    ...quaternaryRingSides.map((o) => o.ringSections[0].thetaStart),
  ]);
  const rotation = pickRandomDecimalFromInterval(
    thetaStart - 0.5,
    thetaStart + 0.5,
    3
  );

  return {
    rotation,
    distort,
    radius: pickRandomDecimalFromInterval(2, 6),
    color: pickRandom(COLORS),
  };
});

const RingSection = ({
  outerIndex,
  innerIndex,
  innerRadius,
  outerRadius,
  section,
}: {
  outerIndex: number;
  innerIndex: number;
  innerRadius: number;
  outerRadius: number;
  section: RingSectionData;
}) => {
  const texture = useTexture({
    alphaMap: `${process.env.PUBLIC_URL}/texture.jpg`,
  });

  Object.keys(texture).forEach((key) => {
    texture[key as keyof typeof texture].wrapS = RepeatWrapping;
    texture[key as keyof typeof texture].wrapT = RepeatWrapping;
    texture[key as keyof typeof texture].repeat.x = 1 + outerRadius / 4;
    texture[key as keyof typeof texture].repeat.y = 1 + outerRadius / 4;
  });

  return (
    <mesh>
      <ringGeometry
        args={[
          innerRadius,
          outerRadius,
          64,
          64,
          ringAltStart === RingSectionAltStart.Default
            ? section.thetaStart
            : ringAltStart === RingSectionAltStart.DoubleSpiral
            ? section.thetaStart + innerIndex * (Math.PI / (6 + outerIndex))
            : innerIndex * (Math.PI / 6),
          ringAltLength === RingSectionAltLength.Default
            ? section.length
            : ringAltLength === RingSectionAltLength.Irregular
            ? section.length + Math.PI / (6 + outerIndex)
            : Math.PI / (6 + outerIndex),
        ]}
      />
      {/*
      // @ts-ignore */}
      {/* <grainMaterial /> */}
      {section.type === 1 ? (
        hasGradient && section.color === primaryColor ? (
          <meshStandardMaterial
            transparent
            opacity={section.opacity}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
          >
            <GradientTexture
              stops={[0, 1]}
              colors={[primaryColor, secondaryColor]}
              size={1024}
            />
          </meshStandardMaterial>
        ) : (
          <meshStandardMaterial
            transparent
            opacity={section.opacity}
            blending={AdditiveBlending}
            depthWrite={false}
            toneMapped={false}
            color={section.color}
            // {...texture}
          />
        )
      ) : (
        <>
          <meshBasicMaterial transparent opacity={0} />
          <Edges scale={1} color={section.strokeColor} />
        </>
      )}
    </mesh>
  );
};

const Scene = ({ canvasRef }: { canvasRef: RefObject<HTMLCanvasElement> }) => {
  const { aspect } = useThree((state) => ({
    aspect: state.viewport.aspect,
  }));

  const meshLineRef = useRef<Mesh>(null);
  const spotLight = useRef<SpotLight>(null);
  // useHelper(spotLight, SpotLightHelper, "red");

  const [spotLightSprings, setSpotLightSprings] = useSpring(() => ({
    angle: 0,
  }));

  useEffect(() => {
    setSpotLightSprings.start({
      from: { angle: 0 },
      to: { angle: 0.7 },
      loop: { reverse: true },
      config: { mass: 1, tension: 60, friction: 40 },
    });
  }, [setSpotLightSprings]);

  useFrame(({ clock }) => {
    // spotLight.current?.target.position.set(
    //   Math.sin(clock.getElapsedTime()) * 50,
    //   0,
    //   0
    // );
    // spotLight.current?.target.updateMatrixWorld();
    // spotLight.current?.position.set(
    //   Math.sin(clock.getElapsedTime()) * 50,
    //   0,
    //   50
    // );
    // spotLight.current?.angle.
  });

  // useLayoutEffect(() => {
  //   // @ts-ignore
  //   meshLineRef.current!.geometry.setPoints(
  //     // [0, 0, 0, 10, -2, 0, 10, 3, 0, 15, 1, 0, 15, 10, 0, 20, 10, 0],
  //     // [
  //     //   0, 0, 0, 10, -2, 0, 10, 3, 0, 20, 1, 0, 20, 6, 0, 30, 4, 0, 30, 9, 0,
  //     //   40, 7, 0,
  //     // ],
  //     [0, 0, 0, 15, -5, 0, 15, 0, 0, 30, -7, 0],
  //     (p: number) => Math.sin(p * 3.5) * 4
  //   );
  // }, []);

  return (
    <>
      <color attach="background" args={[bgColor]} />
      <OrbitControls enabled={true} />
      <ambientLight />
      <group position={cameraPosition}>
        {/* 
      // @ts-ignore */}
        {/* <a.spotLight
          ref={spotLight}
          position={[-cameraPosition.x, -cameraPosition.y, 50]}
          angle={spotLightSprings.angle}
          penumbra={2}
          intensity={10}
          distance={60}
        /> */}

        {primaryRingSides.map(({ ringSections }, outerIndex) => (
          <group key={outerIndex}>
            {ringSections.map((section, innerIndex) => (
              <RingSection
                key={innerIndex}
                section={section}
                outerIndex={outerIndex}
                innerIndex={innerIndex}
                innerRadius={innerIndex + 1}
                outerRadius={innerIndex + 2}
              />
            ))}
          </group>
        ))}

        {secondaryRingSides.map(({ ringSections }, outerIndex) => (
          <group key={outerIndex} position={[0, 0, 0.05]}>
            {ringSections.map((section, innerIndex) => (
              // new Array(12 + outerIndex * 2).fill(null).map
              <RingSection
                key={innerIndex}
                section={section}
                outerIndex={outerIndex}
                innerIndex={innerIndex}
                innerRadius={innerIndex * 2 + 1}
                outerRadius={innerIndex * 2 + 3}
              />
            ))}
          </group>
        ))}

        {tertiaryRingSides.map(({ ringSections }, outerIndex) => (
          <group key={outerIndex} position={[0, 0, 0.1]}>
            {ringSections.map((section, innerIndex) => (
              <RingSection
                key={innerIndex}
                section={section}
                outerIndex={outerIndex}
                innerIndex={innerIndex}
                innerRadius={innerIndex * 4 + 1}
                outerRadius={innerIndex * 4 + 5}
              />
            ))}
          </group>
        ))}

        {quaternaryRingSides.map(({ ringSections }, outerIndex) => (
          <group key={outerIndex} position={[0, 0, 0.15]}>
            {ringSections.map((section, innerIndex) => (
              <RingSection
                key={innerIndex}
                section={section}
                outerIndex={outerIndex}
                innerIndex={innerIndex}
                innerRadius={innerIndex * 8 + 1}
                outerRadius={innerIndex * 8 + 9}
              />
            ))}
          </group>
        ))}

        {spikes.map((spike, i) => (
          <group key={i} position={[0, 0, -0.05]}>
            {spike.spikes.map((o, ii) => (
              <Spikes
                key={ii}
                index={ii}
                radius={0.05}
                {...o}
                cameraPosition={cameraPosition}
              />
            ))}
          </group>
        ))}

        {grooves.map((groove, i) => (
          <group key={i} position={[0, 0, -0.05]}>
            {groove.grooves.map((o, ii) => (
              <Grooves
                key={ii}
                index={ii}
                {...o}
                cameraPosition={cameraPosition}
              />
            ))}
          </group>
        ))}

        {circles.map((circle, i) => (
          <group key={i} rotation={[0, 0, circle.rotation]}>
            <mesh position={[10, -10, -0.1]}>
              <circleGeometry args={[circle.radius, 128, 128]} />
              <MeshDistortMaterial
                transparent
                opacity={0.5}
                blending={AdditiveBlending}
                depthWrite={false}
                toneMapped={false}
                color={circle.color}
                speed={0}
                distort={circle.distort}
              />
            </mesh>
          </group>
        ))}

        {/* <mesh ref={meshLineRef}> */}
        {/*
      // @ts-ignore */}
        {/* <meshLineGeometry attach="geometry" /> */}
        {/*
      // @ts-ignore */}
        {/* <meshLineMaterial
            attach="material"
            transparent
            opacity={0.5}
            depthWrite={false}
            toneMapped={false}
            lineWidth={1}
            color={"red"}
            // dashArray={dashArray}
            // dashOffset={dashOffset}
            // dashRatio={dashRatio}
            blending={AdditiveBlending}
          />
        </mesh> */}
        {hasPointsBackground && <Points type={pointsBackgroundType} />}
        {hasStripeBackground && <StripeBackground />}
      </group>
    </>
  );
};

export default Scene;
