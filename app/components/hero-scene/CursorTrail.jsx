/* eslint-disable */
import {
  forwardRef,
  memo,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from "react";
import { useFrame } from "react-three-fiber";
import { LinearFilter, Vector2 } from "three";
import FBO from "./FBO";
import useSmoothPointer from "../../utils/useSmoothPointer";
import { useWindowSize } from "@reactuses/core";

const CursorTrail = forwardRef(({ width = 128, height = 128 }, ref) => {
  const fboVelocityRef = useRef();
  const fboRef = useRef();
  const viewport = useWindowSize();
  const uniforms = useMemo(
    () => ({
      tVelocity: { value: null },
      uOpacity: { value: 0 },
      uAspect: { value: 0 },
      uPointer: { value: new Vector2() },
      uVelocity: { value: new Vector2() },
      uSize: { value: 0.09999 },
      uTime: { value: 0 },
    }),
    [],
  );

  const uniforms2 = useMemo(
    () => ({
      uVelocity: { value: new Vector2() },
    }),
    [],
  );

  const pointer = useSmoothPointer();

  useFrame((state) => {
    if (fboVelocityRef.current && fboRef.current) {
      const uniVelocity = fboVelocityRef.current.getUniforms();
      uniVelocity.uVelocity.value.x = pointer.current.velocityX;
      uniVelocity.uVelocity.value.y = pointer.current.velocityY;

      const uni = fboRef.current.getUniforms();
      uni.tVelocity.value = fboVelocityRef.current.getTexture();
      uni.uOpacity.value = pointer.current.speedNormalized;
      uni.uSize.value = Math.abs(pointer.current.speedNormalized - 1) * 0.09999;
      uni.uTime.value = state.clock.elapsedTime;
      uni.uPointer.value.set(
        pointer.current.normalizedX,
        1 - pointer.current.normalizedY,
      );
    }
  });

  useEffect(() => {
    fboRef.current &&
      (fboRef.current.getUniforms().uAspect.value =
        viewport.width / viewport.height);
    fboVelocityRef.current &&
      (fboRef.current.getUniforms().uAspect.value =
        viewport.width / viewport.height);
  }, [viewport.width, viewport.height]);

  useImperativeHandle(ref, () => {
    return {
      getTarget() {
        return fboRef.current.getTexture();
      },
    };
  });

  return (
    <>
      <FBO
        name="trail"
        ref={fboRef}
        width={width}
        height={height}
        shader={`precision highp float;
        #define GLSLIFY 1
        
        uniform sampler2D texture;
        uniform sampler2D tVelocity;
        uniform vec2 uPointer;
        uniform vec2 uVelocity;
        uniform float uAspect;
        uniform float uSize;
        uniform float uOpacity;
        uniform float uTime;
        
        //
        // Description : Array and textureless GLSL 2D simplex noise function.
        //      Author : Ian McEwan, Ashima Arts.
        //  Maintainer : ijm
        //     Lastmod : 20110822 (ijm)
        //     License : Copyright (C) 2011 Ashima Arts. All rights reserved.
        //               Distributed under the MIT License. See LICENSE file.
        //               https://github.com/ashima/webgl-noise
        //
        
        vec3 mod289(vec3 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec2 mod289(vec2 x) {
          return x - floor(x * (1.0 / 289.0)) * 289.0;
        }
        
        vec3 permute(vec3 x) {
          return mod289(((x*34.0)+1.0)*x);
        }
        
        float snoise(vec2 v)
          {
          const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                              0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                             -0.577350269189626,  // -1.0 + 2.0 * C.x
                              0.024390243902439); // 1.0 / 41.0
        // First corner
          vec2 i  = floor(v + dot(v, C.yy) );
          vec2 x0 = v -   i + dot(i, C.xx);
        
        // Other corners
          vec2 i1;
          //i1.x = step( x0.y, x0.x ); // x0.x > x0.y ? 1.0 : 0.0
          //i1.y = 1.0 - i1.x;
          i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
          // x0 = x0 - 0.0 + 0.0 * C.xx ;
          // x1 = x0 - i1 + 1.0 * C.xx ;
          // x2 = x0 - 1.0 + 2.0 * C.xx ;
          vec4 x12 = x0.xyxy + C.xxzz;
          x12.xy -= i1;
        
        // Permutations
          i = mod289(i); // Avoid truncation effects in permutation
          vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
            + i.x + vec3(0.0, i1.x, 1.0 ));
        
          vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
          m = m*m ;
          m = m*m ;
        
        // Gradients: 41 points uniformly over a line, mapped onto a diamond.
        // The ring size 17*17 = 289 is close to a multiple of 41 (41*7 = 287)
        
          vec3 x = 2.0 * fract(p * C.www) - 1.0;
          vec3 h = abs(x) - 0.5;
          vec3 ox = floor(x + 0.5);
          vec3 a0 = x - ox;
        
        // Normalise gradients implicitly by scaling m
        // Approximation of: m *= inversesqrt( a0*a0 + h*h );
          m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        
        // Compute final noise value at P
          vec3 g;
          g.x  = a0.x  * x0.x  + h.x  * x0.y;
          g.yz = a0.yz * x12.xz + h.yz * x12.yw;
          return 130.0 * dot(m, g);
        }
        
        float circle(vec2 uv, vec2 disc_center, float disc_radius, float border_size) {
            uv -= disc_center;
            uv.x *= uAspect;
            float dist = sqrt(dot(uv, uv));
            return smoothstep(disc_radius+border_size, disc_radius-border_size, dist);
        }
        
        vec2 scuv(vec2 uv) {
            float zoom = 1.;
            return (uv - .5)*1.2*zoom+.5;
        }
        
        void main() {
            vec2 uv = gl_FragCoord.xy / RESOLUTION.xy;
            vec2 cUV = uv;
            cUV += snoise(cUV * 2. + uTime * .1) * .04;
        
            vec4 texVel = texture2D(tVelocity, uv);
            cUV += texVel.yz * .05;
            vec4 tex = texture2D(texture, (uv));
        
            vec3 cursor = vec3(circle(cUV, uPointer, 0., .35 - uSize)) * uOpacity;
            cursor *= vec3(1., texVel.yz * .2); // X coord for strength, YZ coords for direction
        
            vec4 finalColor = vec4(cursor + tex.rgb * .975, uVelocity);
        
            gl_FragColor = finalColor;
        }`}
        uniforms={uniforms}
      />
      <FBO
        name="trail-velocity"
        ref={fboVelocityRef}
        width={width}
        height={height}
        shader={`precision highp float;
          uniform sampler2D texture;
          uniform vec2 uVelocity;
          void main () {
            vec2 uv = gl_FragCoord.xy / RESOLUTION.xy;
            gl_FragColor = vec4(vec3(1., uVelocity * .25) + texture2D(texture, uv).rgb * 0.975, 1.);
          }
        `}
        uniforms={uniforms2}
        rtOptions={{
          minFilter: LinearFilter,
          magFilter: LinearFilter,
        }}
      />
    </>
  );
});

export default memo(CursorTrail);
