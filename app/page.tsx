'use client';
import { Suspense, useMemo, useRef } from "react"
import { Canvas } from "react-three-fiber"
import { Loader } from "@react-three/drei"
import * as THREE from "three"
import CursorTrail from './components/hero-scene/CursorTrail'
import PostFx from './components/hero-scene/PostFx'
import LayerPlane from './components/hero-scene/LayerPlane'
import LayerLinearGrid from './components/LayerLinearGrid'

const Home = () => {
  const cursorTrailRef = useRef();
  const camera = useMemo(() => {
    const cam = new THREE.PerspectiveCamera(0.1, 1, 0.1, 100)
    cam.position.set(0, 0, 2)
    cam.rotation.set(0, 0, 0)
    cam.lookAt(0, 0, 0);
    return cam
  }, [])
  

  return (
    <>
      <Canvas
        className="-z-10"
        camera={camera}
        id="my-canvas"
        gl={{
          pixelRatio: 2,
          antialias: false,
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 3,
          depth: true,
          powerPreference: 'high-performance',
          preserveDrawingBuffer: true
        }}
      >
        <Suspense fallback={<LayerLinearGrid />}>
          <CursorTrail ref={cursorTrailRef}/>
          <PostFx cursorTrail={cursorTrailRef} />
          <LayerPlane cursorTrail={cursorTrailRef} />
        </Suspense>
      </Canvas>
      <Loader />
    </>
  );
}

export default Home;