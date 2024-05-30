/* eslint-disable */
import { forwardRef, useImperativeHandle, useMemo, useRef, memo } from 'react'
import {
  DataTexture,
  FloatType,
  NearestFilter,
  RGBAFormat,
  Scene,
  Camera,
} from 'three'
import { createPortal, useFrame } from 'react-three-fiber'
import { useFBO } from '@react-three/drei'

const FBO = forwardRef(({
  width,
  height,
  data,
  name,
  shader,
  texture,
  uniforms = {},
  rtOptions = {},
}, ref) => {
  const vertices = new Float32Array([
    -1.0, -1.0, 0.0,
    3.0, -1.0, 0.0,
    -1.0, 3.0, 0.0
  ])
  const uv = new Float32Array([
    0, 0, 2,
    0, 0, 2
  ])

  console.log('FBO...')
  const copyDataRef = useRef(true)
  const scene = useMemo(() => new Scene(), [])
  const camera = useMemo(() => new Camera(), [])
  const materialRef = useRef()
  const indexRef = useRef(0)
  const defaultTexture = useMemo(() => {
    const tx = texture || new DataTexture(data || new Float32Array(width * height * 4), width, height, RGBAFormat, FloatType)
    tx.needsUpdate = true
    return tx
  }, [texture, data]);
  
  const memoUniforms = useMemo(() => ({
    ...uniforms,
    texture: {
      value: defaultTexture
    }
  }), [uniforms])

  const rt = [
    useFBO(width, height, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      stencilBuffer: false,
      depthBuffer: false,
      depthWrite: false,
      depthTest: false,
      type: FloatType,
      ...rtOptions
    }),
    useFBO(width, height, {
      minFilter: NearestFilter,
      magFilter: NearestFilter,
      stencilBuffer: false,
      depthBuffer: false,
      depthWrite: false,
      depthTest: false,
      type: FloatType,
      ...rtOptions
    })
  ]

  useFrame(({ gl }) => {
    const destIndex = indexRef.current === 0 ? 1 : 0
    const old = rt[indexRef.current]
    const dest = rt[destIndex]

    materialRef.current.uniforms.texture.value = copyDataRef.current ? defaultTexture : old.texture

    const oldMainTarget = gl.getRenderTarget()
    gl.setRenderTarget(dest)
    gl.render(scene, camera)
    gl.setRenderTarget(oldMainTarget)

    indexRef.current = destIndex
    copyDataRef.current = false
  })

  useImperativeHandle(ref, () => {
    return {
      getUniforms() { return materialRef.current.uniforms },
      getTexture() { return rt[indexRef.current].texture },
    };
  }, [])

  return createPortal(
    <mesh frustumCulled={false}>
      <rawShaderMaterial
        ref={materialRef}
        vertexShader={`
        precision highp float;
        attribute vec3 position;
        void main() {
          gl_Position = vec4(position, 1.0);
        }`}
        fragmentShader={shader || `
        precision highp float;
        uniform sampler2D texture;
        void main() {
          vec2 uv = gl_FragCoord.xy / RESOLUTION.xy;
          gl_FragColor = texture2D(texture, uv);
        }`}
        defines={{
          RESOLUTION: `vec2(${width.toFixed(1)}, ${height.toFixed(1)})`
        }}
        uniforms={memoUniforms}
        name={name || 'FBO'}
      />
      <bufferGeometry attach="geometry">
        <bufferAttribute
          attach="attributes-position"
          array={vertices}
          count={vertices.length / 3}
          itemSize={3} />
        <bufferAttribute
          attach="attributes-uv"
          array={uv}
          count={uv.length / 2}
          itemSize={2} />
      </bufferGeometry>
    </mesh>
  , scene)
})

export default memo(FBO);

