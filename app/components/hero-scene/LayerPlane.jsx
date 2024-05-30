import { useEffect, useRef, useState, useMemo } from "react"
import { useFrame, useThree } from "react-three-fiber"
import { Html } from "@react-three/drei"
import gsap from "gsap"
import { Vector2 } from "three"
import { useWindowSize } from "@reactuses/core"
import useDomMapping from "../../utils/useDomMapping"

const LayerPlane = ({ squareSize = 4.5, strength = 1, colorMix = 0, masked = true, cursorTrail }) => {
  const [domEl, setDomEl] = useState(null)
  const mesh = useRef()
  const {gl} = useThree()
  const { width, height } = useWindowSize();
  const { position, scale } = useDomMapping(domEl)
  const uniforms = useMemo(
    () => ({
      tTrail: {
          value: null
      },
      uColorMix: {
          value: 1
      },
      uDitherStrength: {
          value: 1
      },
      uMask: {
          value: 0
      },
      uPlaneSize: {
          value: new Vector2(0,0)
      },
      uResolution: {
          value: new Vector2(0,0)
      },
      uSquareSize: {
          value: 4.5
      },
      uTime: {
          value: 0
      }
    }),
    []
  )
  
  useFrame(({clock}) => {
    if (!mesh.current) {
      return
    }
    mesh.current.material.uniforms.uTime.value = clock.getElapsedTime();
    mesh.current.material.uniforms.uMask.value = masked
    if (cursorTrail.current) {
      mesh.current.material.uniforms.tTrail.value = cursorTrail.current.getTarget()
    }
  })

  useEffect(() => {
    mesh.current.material.uniforms.uPlaneSize.value.set(width, height)
  }, [width, height])

  useEffect(() => {
    const dpr = gl.pixelRatio || 1
    mesh.current.material.uniforms.uResolution.value.set(width * dpr, height * dpr)
  }, [gl.pixelRatio, width, height])

  useEffect(() => {
    mesh.current.position.set(position.x, position.y, position.z)
  }, [position])

  useEffect(() => {
    mesh.current.scale.set(scale.x, scale.y, scale.z)
  }, [scale])

  useEffect(() => {
    mesh.current.material.uniforms.uColorMix.value = gsap.utils.clamp(0, 1, colorMix)
  }, [colorMix])

  useEffect(() => {
    mesh.current.material.uniforms.uDitherStrength.value = strength
  }, [strength])

  useEffect(() => {
    mesh.current.material.uniforms.uSquareSize.value = squareSize
  }, [squareSize])

  return (
    <group>
      <Html zIndexRange={[-1, -10]} fullscreen>
        <div ref={(el) => {setDomEl(el)}} className="pointer-events-none h-full w-full"></div>
      </Html>
      <mesh ref={mesh}>
        <planeGeometry args={[1, 1, 1, 1]} />
        <shaderMaterial
          uniforms={uniforms}
          defines={{
            MASKED: masked
          }}
          vertexShader={`#define GLSLIFY 1
          varying vec2 vUv;
          
          void main() {
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            vUv = uv;
          }
          `}
          fragmentShader={`#define GLSLIFY 1
          uniform sampler2D tTrail;
          uniform vec2 uResolution;
          uniform vec2 uPlaneSize;
          uniform float uColorMix;
          uniform float uTime;
          uniform float uMask;
          uniform float uDitherStrength;
          uniform float uSquareSize;
          
          varying vec2 vUv;
          
          #define BLACK vec3(0., 0., 0.)
          #define BLUE vec3(0., 0., 1.)
          #define DITHER_STRENGTH .8
          float luma(vec3 color) {
            return dot(color, vec3(0.299, 0.587, 0.114));
          }
          
          float luma(vec4 color) {
            return dot(color.rgb, vec3(0.299, 0.587, 0.114));
          }
          
          float dither4x4(vec2 position, float brightness) {
            int x = int(mod(position.x, 4.0));
            int y = int(mod(position.y, 4.0));
            int index = x + y * 4;
            float limit = 0.0;
          
            if (x < 8) {
              if (index == 0) limit = 0.0625;
              if (index == 1) limit = 0.5625;
              if (index == 2) limit = 0.1875;
              if (index == 3) limit = 0.6875;
              if (index == 4) limit = 0.8125;
              if (index == 5) limit = 0.3125;
              if (index == 6) limit = 0.9375;
              if (index == 7) limit = 0.4375;
              if (index == 8) limit = 0.25;
              if (index == 9) limit = 0.75;
              if (index == 10) limit = 0.125;
              if (index == 11) limit = 0.625;
              if (index == 12) limit = 1.0;
              if (index == 13) limit = 0.5;
              if (index == 14) limit = 0.875;
              if (index == 15) limit = 0.375;
            }
          
            return brightness < limit ? 0.0 : 1.0;
          }
          
          vec3 dither4x4(vec2 position, vec3 color) {
            return color * dither4x4(position, luma(color));
          }
          
          vec4 dither4x4(vec2 position, vec4 color) {
            return vec4(color.rgb * dither4x4(position, luma(color)), 1.0);
          }
          
          float checkEffect(float check, float progress) {
            return smoothstep(0.0, -0.01, check - progress * (1. + 0.01));
          }
          
          float mod289(float x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
          vec4 mod289(vec4 x){return x - floor(x * (1.0 / 289.0)) * 289.0;}
          vec4 perm(vec4 x){return mod289(((x * 34.0) + 1.0) * x);}
          
          float noise(vec3 p){
            vec3 a = floor(p);
            vec3 d = p - a;
            d = d * d * (3.0 - 2.0 * d);
          
            vec4 b = a.xxyy + vec4(0.0, 1.0, 0.0, 1.0);
            vec4 k1 = perm(b.xyxy);
            vec4 k2 = perm(k1.xyxy + b.zzww);
          
            vec4 c = k2 + a.zzzz;
            vec4 k3 = perm(c);
            vec4 k4 = perm(c + 1.0);
          
            vec4 o1 = fract(k3 * (1.0 / 41.0));
            vec4 o2 = fract(k4 * (1.0 / 41.0));
          
            vec4 o3 = o2 * d.z + o1 * (1.0 - d.z);
            vec2 o4 = o3.yw * d.x + o3.xz * (1.0 - d.x);
          
            return o4.y * d.y + o4.x * (1.0 - d.y);
          }
          
          float fbm(vec3 x) {
            float v = 0.0;
            float a = 0.5;
            vec3 shift = vec3(100);
            for (int i = 0; i < 5; ++i) {
              v += a * noise(x);
              x = x * 2.0 + shift;
              a *= 0.5;
            }
            return v;
          }
          
          float rand (vec2 co) {
            return fract(sin(dot(co.xy ,vec2(12.9898,78.233))) * 43758.5453);
          }
          
          void main() {
              vec2 uv = gl_FragCoord.xy / uResolution.xy;
              float aspect = uResolution.x / uResolution.y;
          
              // Textures
              vec2 trailUv = gl_FragCoord.xy / uResolution.xy;
              vec4 trail = texture2D(tTrail, trailUv);
          
              vec3 bgColor = mix(BLACK, BLUE, uColorMix);
              vec3 ditherColor = mix(BLUE, BLACK, uColorMix);
          
              vec2 dithUV = uv;
              dithUV.x *= aspect;
          
              vec3 pattern = vec3(fbm(vec3(uv, uTime * .1)));
              vec4 texCol = vec4(pattern, 1.);
              texCol = max(dither4x4(dithUV * 300., texCol), .05) * DITHER_STRENGTH * uDitherStrength;
          
              // checkered reveal
              vec2 cUv = vUv;
              cUv.x = (cUv.x - .5) * uPlaneSize.x / uPlaneSize.y + .5;
          
              vec3 finalC = mix(bgColor, ditherColor, texCol.r * trail.x);
              gl_FragColor = vec4(finalC, 1.);
          
              #ifdef MASKED
                float check = rand(floor(vec2(uSquareSize) * cUv));
                float mask = checkEffect(check, uMask);
                gl_FragColor.a = mask;
              #endif
          }`}/>
      </mesh>
    </group>
  )
}

export default LayerPlane;