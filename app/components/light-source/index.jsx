import React, { useRef, useEffect, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import { debounce } from "lodash";
import { isMobile } from "react-device-detect";

export default function LightSource() {
  const [colors, setColors] = useState([
    "orange",
    "red",
    "red",
    "orange",
    "lightblue",
    "green",
    "blue",
    "blue"
  ]);
  const activeRef = useRef(true);
  const light = useRef();
  const light2 = useRef();
  const light3 = useRef();
  const light4 = useRef();
  const light5 = useRef();

  useEffect(() => {
    const setActiveToFalse = debounce(() => {
      setTimeout(() => {
        activeRef.current = false;
      }, 0)
    }, 1500);

    const handleClick = () => {
      const newColors = colors.sort(() => Math.random() - 0.5);
      setColors(newColors);
    }

    const handleMouseMove = () => {
      if (activeRef.current) {
        setActiveToFalse();
      } else {
        activeRef.current = true;
      }
    }

    window.addEventListener("click", handleClick);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener("click", handleClick);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [colors]);

  useFrame((state, delta) => {
    easing.dampC(light.current.color, colors[0], 0.25, delta);
    easing.dampC(light2.current.color, colors[1], 0.35, delta);
    easing.dampC(light3.current.color, colors[2], 0.25, delta);
    easing.dampC(light4.current.color, colors[3], 0.15, delta);
    easing.dampC(light5.current.color, colors[4], 0.45, delta);

    if (activeRef.current) {
      easing.damp(light.current, 'intensity', 2, 0.25, delta);
      easing.damp(light2.current, 'intensity', 3, 0.35, delta);
      easing.damp(light3.current, 'intensity', 2.5, 0.25, delta);
      easing.damp(light4.current, 'intensity', 5, 0.15, delta);
      // easing.damp(light5.current, 'intensity', 100, 0.15, delta);
    } else {
      easing.damp(light.current, 'intensity', 0, 0.25, delta);
      easing.damp(light2.current, 'intensity', 0, 0.35, delta);
      easing.damp(light3.current, 'intensity', 0, 0.25, delta);
      easing.damp(light4.current, 'intensity', 0, 0.15, delta);
      // easing.damp(light5.current, 'intensity', 0, 0.15, delta);
    }

    if (isMobile) {
      light.current.position.set(
        -0.1,
        -Math.sin(state.clock.getElapsedTime()) / 2,
        1
      );
      light2.current.position.set(
        -0.1,
        -Math.sin(state.clock.getElapsedTime()) / 2,
        1
      );
      light3.current.position.set(
        -0.1,
        -Math.sin(state.clock.getElapsedTime()) / 2,
        1
      );
      light4.current.position.set(
        -0.1,
        -Math.sin(state.clock.getElapsedTime()) / 2,
        1
      );
    } else {
      easing.damp3(
        light.current.position,
        [
          ((state.pointer.x / 2) * state.viewport.width) / 4,
          ((state.pointer.y / 2) * state.viewport.height) / 4,
          1
        ],
        0.4,
        delta
      );

      easing.damp3(
        light2.current.position,
        [
          ((state.pointer.x / 2) * state.viewport.width) / 4,
          ((state.pointer.y / 2) * state.viewport.height) / 4,
          1.1
        ],
        0.4,
        delta
      );

      easing.damp3(
        light3.current.position,
        [
          ((state.pointer.x / 2) * state.viewport.width) / 4,
          ((state.pointer.y / 2) * state.viewport.height) / 4,
          1
        ],
        0.4,
        delta
      );

      easing.damp3(
        light4.current.position,
        [
          ((state.pointer.x / 2) * state.viewport.width) / 4,
          ((state.pointer.y / 2) * state.viewport.height) / 4,
          0.8
        ],
        0.4,
        delta
      );
    }
  });

  return (
    <>
      <directionalLight ref={light} intensity={2} />
      <directionalLight ref={light2} intensity={3} />
      <directionalLight ref={light3} intensity={2.5} />
      <directionalLight
        ref={light4}
        position={[-100, -200, -50]}
      />

      <ambientLight color={"lightblue"} ref={light5} intensity={100} />
    </>
  );
}
