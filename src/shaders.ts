const glsl = require("babel-plugin-glsl/macro");

export const vertexShader = glsl`
  uniform vec3 uLightPos[2];

  varying vec3 vNormal;
  varying vec3 vSurfaceToLight[2];

  void main(void) {
    vNormal = normalize(normalMatrix * normal);

    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vec3 surfaceToLightDirection = vec3( modelViewMatrix * vec4(position, 1.0));
    vec3 worldLightPos1 = vec3( viewMatrix * vec4(uLightPos[0], 1.0));
    vSurfaceToLight[0] = normalize(worldLightPos1 - surfaceToLightDirection);
    vec3 worldLightPos2 = vec3( viewMatrix * vec4(uLightPos[1], 1.0));
    vSurfaceToLight[1] = normalize(worldLightPos2 - surfaceToLightDirection);
  }
`;

export const fragmentShader = glsl`
  #pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

  uniform vec3 uColor;
  uniform vec3 uLightColor;
  uniform float uLightIntensity;
  uniform float uNoiseScale;
  uniform float uNoiseCoef;

  uniform vec3 diffuse;
  uniform vec3 emissive;
  uniform float opacity;

  varying vec3 vLightFront;
  varying vec3 vIndirectFront;

  #ifdef DOUBLE_SIDED
    varying vec3 vLightBack;
    varying vec3 vIndirectBack;
  #endif


  #include <common>
  #include <packing>
  #include <dithering_pars_fragment>
  #include <color_pars_fragment>
  #include <uv_pars_fragment>
  #include <uv2_pars_fragment>
  #include <map_pars_fragment>
  #include <alphamap_pars_fragment>
  #include <alphatest_pars_fragment>
  #include <aomap_pars_fragment>
  #include <lightmap_pars_fragment>
  #include <emissivemap_pars_fragment>
  #include <envmap_common_pars_fragment>
  #include <envmap_pars_fragment>
  #include <cube_uv_reflection_fragment>
  #include <bsdfs>
  #include <lights_pars_begin>
  #include <fog_pars_fragment>
  #include <shadowmap_pars_fragment>
  #include <shadowmask_pars_fragment>
  #include <specularmap_pars_fragment>
  #include <logdepthbuf_pars_fragment>
  #include <clipping_planes_pars_fragment>

  void main() {

    #include <clipping_planes_fragment>

    vec4 diffuseColor = vec4( diffuse, opacity );
    ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
    vec3 totalEmissiveRadiance = emissive;

    #include <logdepthbuf_fragment>
    #include <map_fragment>
    #include <color_fragment>
    #include <alphamap_fragment>
    #include <alphatest_fragment>
    #include <specularmap_fragment>
    #include <emissivemap_fragment>

    // accumulation

    #ifdef DOUBLE_SIDED

      reflectedLight.indirectDiffuse += ( gl_FrontFacing ) ? vIndirectFront : vIndirectBack;

    #else

      reflectedLight.indirectDiffuse += vIndirectFront;

    #endif

    #include <lightmap_fragment>

    reflectedLight.indirectDiffuse *= BRDF_Lambert( diffuseColor.rgb );

    #ifdef DOUBLE_SIDED

      reflectedLight.directDiffuse = ( gl_FrontFacing ) ? vLightFront : vLightBack;

    #else

      reflectedLight.directDiffuse = vLightFront;

    #endif

    reflectedLight.directDiffuse *= BRDF_Lambert( diffuseColor.rgb ) * getShadowMask();

    // modulation

    #include <aomap_fragment>

    vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

    #include <envmap_fragment>

    #include <output_fragment>
    #include <tonemapping_fragment>
    #include <encodings_fragment>
    #include <fog_fragment>
    #include <premultiplied_alpha_fragment>
    #include <dithering_fragment>

        // grain
    vec2 uv = gl_FragCoord.xy;
    uv /= uNoiseScale;

    vec3 colorNoise = vec3(snoise2(uv) * 0.5 + 0.5);
    colorNoise *= pow(outgoingLight.r, uNoiseCoef);

    gl_FragColor.r = max(colorNoise.r, uColor.r);
    gl_FragColor.g = max(colorNoise.g, uColor.g);
    gl_FragColor.b = max(colorNoise.b, uColor.b);
    gl_FragColor.a = 1.0;
  }
`;

// export const fragmentShader = glsl`
//   #pragma glslify: snoise2 = require(glsl-noise/simplex/2d)

//   uniform vec3 uLightColor[2];
//   uniform vec3 uColor;
//   uniform float uLightIntensity;
//   uniform float uNoiseCoef;
//   uniform float uNoiseMin;
//   uniform float uNoiseMax;
//   uniform float uNoiseScale;

//   varying vec3 vNormal;
//   varying vec3 vSurfaceToLight[2];

//   vec3 light_reflection(vec3 vSurfaceToLight, vec3 lightColor) {
//     vec3 ambient = lightColor;
//     vec3 diffuse = lightColor * max(dot(vSurfaceToLight, vNormal), 0.0);

//     return (ambient + diffuse);
//   }

//   void main(void) {
//     vec3 light_value = vec3(0);

//     for(int i = 0; i < 2; i++) {
//       light_value += light_reflection(vSurfaceToLight[i], uLightColor[i]);
//     }

//     light_value *= uLightIntensity;

//     vec2 uv = gl_FragCoord.xy;
//     uv /= uNoiseScale;

//     vec3 colorNoise = vec3(snoise2(uv) * 0.5 + 0.5);
//     colorNoise *= clamp(uNoiseMin, uNoiseMax, pow(light_value.r, uNoiseCoef));

//     gl_FragColor.r = max(colorNoise.r, uColor.r);
//     gl_FragColor.g = max(colorNoise.g, uColor.g);
//     gl_FragColor.b = max(colorNoise.b, uColor.b);
//     gl_FragColor.a = 1.0;
//   }
// `;
