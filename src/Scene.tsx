import {
  Edges,
  GradientTexture,
  MeshDistortMaterial,
  OrbitControls,
  shaderMaterial,
  useHelper,
  useTexture,
  SpotLight,
  useDepthBuffer,
} from "@react-three/drei";
import { extend, useFrame, useThree } from "@react-three/fiber";
import { RefObject, useEffect, useRef } from "react";
import { a, useSpring } from "@react-spring/three";
import {
  AdditiveBlending,
  Color,
  Mesh,
  RepeatWrapping,
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
const glslify = require("glslify");

const cameraPosition = new Vector3(
  pickRandomDecimalFromInterval(-15, 15),
  pickRandomDecimalFromInterval(-15, 15),
  0
);

const GrainMaterial = shaderMaterial(
  {
    uLightPos: new Vector3(cameraPosition.x, cameraPosition.y, 15),
    uLightColor: new Color("#ffffff"),
    uLightIntensity: 0.5,
    uColor: new Color("#ffffff"),
    uNoiseCoef: 5,
    uNoiseMin: 0.5,
    uNoiseMax: 200,
    uNoiseScale: 2,
  },
  vertexShader,
  glslify(fragmentShader)
);

extend({ GrainMaterial });

const bgColor = pickRandom(DARK_BG_COLORS);
const primaryColor = pickRandom(COLORS);
const secondaryColor = pickRandom(COLORS);
const hasGradient = pickRandomBoolean();
const hasFog = pickRandom([...new Array(19).fill(null).map(() => false), true]);
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

const strobesCount = pickRandom([0, pickRandom([1, 2])]);
const strobesSides = getSides(strobesCount, remainingSides);
const strobes = new Array(strobesCount).fill(null).map((_, outerIndex) => {
  const anglePower = pickRandomDecimalFromInterval(1, 2);
  const angle = pickRandomDecimalFromInterval(1, 3);
  const distance = pickRandomDecimalFromInterval(30, 50);
  const color = pickRandom(COLORS);
  console.log(strobesSides);

  console.log(Math.round(12 * Math.cos(strobesSides[outerIndex]) * 100) / 100);
  console.log(Math.round(12 * Math.sin(strobesSides[outerIndex]) * 100) / 100);
  return {
    distance,
    angle,
    anglePower,
    color,
    targetX: Math.round(12 * Math.cos(strobesSides[outerIndex]) * 100) / 100,
    targetY: Math.round(12 * Math.sin(strobesSides[outerIndex]) * 100) / 100,
    rotation: strobesSides[outerIndex],
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
      {/* <grainMaterial uColor={section.color} /> */}
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

  const spotLightRefs = useRef<any[]>([]);

  useEffect(() => {
    spotLightRefs.current = spotLightRefs.current.slice(0, strobesCount);

    strobes.forEach((strobe, i) => {
      if (!spotLightRefs.current[i]) {
        return;
      }

      spotLightRefs.current[i].target.position.set(
        strobe.targetX,
        strobe.targetY,
        0.5
      );
      spotLightRefs.current[i].target.updateMatrixWorld();
    });
  }, []);
  console.log(spotLightRefs.current);
  const [spotLightSprings, setSpotLightSprings] = useSpring(() => ({
    angle: 0,
  }));

  // useEffect(() => {
  //   setSpotLightSprings.start({
  //     from: { angle: 0 },
  //     to: { angle: 0.7 },
  //     loop: { reverse: true },
  //     config: { mass: 1, tension: 60, friction: 40 },
  //   });
  // }, [setSpotLightSprings]);

  // useEffect(() => {
  //   strobes.forEach((strobe) => {
  //     spotLight.current?.target.position.set(-20, 0, 5);
  //     spotLight.current?.target.updateMatrixWorld();
  //   });
  // }, []);

  const depthBuffer = useDepthBuffer({ frames: 1 });

  return (
    <>
      <color attach="background" args={[bgColor]} />
      {/* {hasFog && <fog attach="fog" args={[bgColor, 5, 60]} />} */}
      <OrbitControls enabled={true} />
      <ambientLight />
      <group position={cameraPosition}>
        {strobes.map((strobe, i) => (
          // @ts-ignore
          <SpotLight
            key={i}
            position={[0, 0, 0.5]}
            rotation={[0, 0, 0]}
            ref={(el) => (spotLightRefs.current[i] = el)}
            angle={strobe.angle}
            penumbra={1}
            intensity={10}
            distance={strobe.distance}
            attenuation={strobe.distance}
            anglePower={strobe.anglePower}
            color={strobe.color}
            depthBuffer={depthBuffer}
          />
        ))}

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

        {hasPointsBackground && <Points type={pointsBackgroundType} />}
        {hasStripeBackground && <StripeBackground />}
      </group>
    </>
  );
};

export default Scene;
