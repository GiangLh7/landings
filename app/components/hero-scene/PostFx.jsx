import React, { useMemo, useEffect } from "react";
import { ShaderMaterial, Uniform, Vector2 } from "three";
import { useFrame, useThree } from '@react-three/fiber'
import {
} from "@react-three/postprocessing";
import { BlendFunction, BloomEffect, EffectComposer, EffectPass, FXAAEffect, RenderPass, ShaderPass, ToneMappingEffect } from "postprocessing";

const fragmentShader1 = "precision highp float;\n#define GLSLIFY 1\n\nuniform sampler2D tDiffuse;\nuniform sampler2D tTrail;\nuniform vec2 uResolution;\nuniform float uHold;\nuniform float uBend;\n\n#define BLACK vec3(0., 0., 0.)\n#define BLUE vec3(0., 0., 1.)\nfloat luma_0(vec3 color) {\n  return dot(color, vec3(0.299, 0.587, 0.114));\n}\n\nfloat luma_0(vec4 color) {\n  return dot(color.rgb, vec3(0.299, 0.587, 0.114));\n}\n\nfloat luma_1(vec3 color) {\n  return dot(color, vec3(0.299, 0.587, 0.114));\n}\n\nfloat luma_1(vec4 color) {\n  return dot(color.rgb, vec3(0.299, 0.587, 0.114));\n}\n\nfloat dither4x4(vec2 position, float brightness) {\n  int x = int(mod(position.x, 4.0));\n  int y = int(mod(position.y, 4.0));\n  int index = x + y * 4;\n  float limit = 0.0;\n\n  if (x < 8) {\n    if (index == 0) limit = 0.0625;\n    if (index == 1) limit = 0.5625;\n    if (index == 2) limit = 0.1875;\n    if (index == 3) limit = 0.6875;\n    if (index == 4) limit = 0.8125;\n    if (index == 5) limit = 0.3125;\n    if (index == 6) limit = 0.9375;\n    if (index == 7) limit = 0.4375;\n    if (index == 8) limit = 0.25;\n    if (index == 9) limit = 0.75;\n    if (index == 10) limit = 0.125;\n    if (index == 11) limit = 0.625;\n    if (index == 12) limit = 1.0;\n    if (index == 13) limit = 0.5;\n    if (index == 14) limit = 0.875;\n    if (index == 15) limit = 0.375;\n  }\n\n  return brightness < limit ? 0.0 : 1.0;\n}\n\nvec3 dither4x4(vec2 position, vec3 color) {\n  return color * dither4x4(position, luma_1(color));\n}\n\nvec4 dither4x4(vec2 position, vec4 color) {\n  return vec4(color.rgb * dither4x4(position, luma_1(color)), 1.0);\n}\n\nvec2 barrelPincushion(vec2 uv, float strength) {\n  vec2 st = uv - 0.5;\n  float theta = atan(st.x, st.y);\n  float radius = sqrt(dot(st, st));\n  radius *= 1.0 + strength * (radius * radius);\n\n  return 0.5 + radius * vec2(sin(theta), cos(theta));\n}\n\nvec2 scaleUv(vec2 uv, vec2 scale, vec2 origin) {\n  vec2 st = uv - origin;\n  st /= scale;\n  return st + origin;\n}\n\nfloat fastEdgeDetection(sampler2D tex, vec2 coords) {\n  vec3 TL = texture2D(tex, coords + vec2(-1, 1)/ uResolution.xy).rgb;\n  vec3 TM = texture2D(tex, coords + vec2(0, 1)/ uResolution.xy).rgb;\n  vec3 TR = texture2D(tex, coords + vec2(1, 1)/ uResolution.xy).rgb;\n\n  vec3 ML = texture2D(tex, coords + vec2(-1, 0)/ uResolution.xy).rgb;\n  vec3 MR = texture2D(tex, coords + vec2(1, 0)/ uResolution.xy).rgb;\n\n  vec3 BL = texture2D(tex, coords + vec2(-1, -1)/ uResolution.xy).rgb;\n  vec3 BM = texture2D(tex, coords + vec2(0, -1)/ uResolution.xy).rgb;\n  vec3 BR = texture2D(tex, coords + vec2(1, -1)/ uResolution.xy).rgb;\n\n  vec3 GradX = -TL + TR - 2.0 * ML + 2.0 * MR - BL + BR;\n  vec3 GradY = TL + 2.0 * TM + TR - BL - 2.0 * BM - BR;\n\n  return length(vec2(GradX.r, GradY.r)) + length(vec2(GradX.g, GradY.g)) + length(vec2(GradX.b, GradY.b));\n}\n\nvoid main() {\n  vec2 uv = gl_FragCoord.xy / uResolution.xy;\n  float aspect = uResolution.x / uResolution.y;\n  vec2 uv2 = uv;\n\n  uv = (uv - .5) / 1. + .5;\n  uv = barrelPincushion( uv , -uBend);\n  uv = scaleUv(uv, vec2(1. + -1. * min(0., uBend)), vec2(.5));\n  vec4 trail = texture2D(tTrail, uv2);\n  vec3 color = texture2D(tDiffuse, uv).rgb;\n  float bwTex = luma_0(texture2D(tDiffuse, uv + trail.yz * .01).rgb);\n\n  vec2 dithUv = uv;\n  dithUv.x *= aspect;\n  vec4 dith = vec4(0.0);\n  dith.rgb = vec3(bwTex) * clamp(0., 1., trail.x);\n  dith = max(dither4x4(dithUv * 300. + trail.yz * 10., dith), .05);\n  vec3 coloredDith = mix(BLACK, BLUE, dith.r);\n\n  vec3 edges = clamp(0., 1., fastEdgeDetection(tDiffuse, uv + trail.yz * .01)) * BLUE;\n\n  vec3 finalC = mix(color.rgb, coloredDith + edges, smoothstep(0.9, 2.5, trail.r) * uHold);\n\n  gl_FragColor = vec4(finalC, 1.0);\n}\n";
const vertexShader1 = `#define GLSLIFY 1\nvarying vec2 vUv;\n\nvoid main() {\n  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);\n  vUv = uv;\n}\n`;


class DiffuseEffect extends ShaderPass {
  constructor({ material, inputType }) {
    super(material, inputType);
  }
}

function PostFx({cursorTrail}) {
  const { gl, camera, scene } = useThree()

  const uniforms = useMemo(() => ({
    tDiffuse: {
      value: null
    },
    tTrail: {
      value: null
    },
    uHold: {
      value: 0
    },
    uBend: {
      value:0
    },
    uResolution: {
      value: new Vector2(0,0)
    }
  }), [])

  const mat = useMemo(() => new ShaderMaterial({
    fragmentShader: fragmentShader1,
    vertexShader: vertexShader1,
    uniforms: uniforms
  }), [uniforms])

  const diffuse = new DiffuseEffect({
    material: mat,
    inputType: 'tDiffuse'
  });

  const composer = useMemo(() => {
    const composer = new EffectComposer(gl, {
      frameBufferType: 1009,
      multisampling: false,
      depthBuffer: true
    })
    const effectPass = new EffectPass(camera)
    effectPass.renderToScreen = true
    composer.addPass(new BloomEffect({
      mipmapBlur: true,
      intensity: 1,
      luminanceSmoothing: true,
      radius: 0.85,
      luminanceThreshold: 0.01
    }))
    composer.addPass(new ToneMappingEffect({
      blendFunction: BlendFunction.SCREEN
    }))
    composer.addPass(new FXAAEffect({
      blendFunction: BlendFunction.SRC
    }))
    composer.addPass(new DiffuseEffect({
      material: mat,
      inputType: 'tDiffuse'
    }))
    composer.addPass(new RenderPass(scene, camera))
    composer.addPass(effectPass)
    return composer
  }, [camera, gl, mat, scene])

  useEffect(() => composer.dispose, [])

  useFrame((state, delta) => {
    composer.render(delta)
    if (cursorTrail.current) {
      diffuse.fullscreenMaterial.uniforms.tTrail.value = cursorTrail.current.getTarget()
    }
  })
  return null
}

export default PostFx