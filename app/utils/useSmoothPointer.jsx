import gsap from "gsap";
import { useEffect, useMemo, useRef } from "react";
import { useMouse, useWindowSize } from "@reactuses/core";

const getTravel = (value) => Math.round(value * 100) / 100

const useSmoothNumber = (val, option) => {
  const state = useRef({
    value: val,
    target: val,
  });

  const tweenFunc = useMemo(
    () =>
      gsap.quickTo(state.current, "value", {
        duration: 0.5,
        ease: "none",
        ...option,
      }),
    [option],
  );

  useEffect(() => {
    state.current.target = val;
    tweenFunc(val);
  }, [tweenFunc, val]);

  useEffect(() => {
    tweenFunc(val);
    return () => {
      tweenFunc.tween.kill();
    }
  })

  return {
    data: state.current,
    smoother: tweenFunc,
  }
}

const useSmoothPointer = () => {
  const state = useRef({
    moving: { x: false, y: false },
    travel: { x: 0, y: 0 },
    isMoving: false,
    normalizedX: 0,
    normalizedY: 0,
    velocityX: 0,
    velocityY: 0,
    mappedX: 0,
    mappedY: 0,
    speed: 0,
    speedNormalized: 0,
  })

  const pointer = useMouse();
  const { width, height } = useWindowSize();
  const dirtyCheck = () => {
    state.current.velocityX = gsap.utils.mapRange(
      -width / 2,
      width / 2,
      1,
      -1,
      state.current.travel.x,
    );
    state.current.velocityY = gsap.utils.mapRange(
      -height / 2,
      height / 2,
      1,
      -1,
      state.current.travel.y,
    );
    state.current.isMoving = state.current.moving.x || state.current.moving.y;
    const speed = Math.max(
      Math.abs(state.current.travel.x),
      Math.abs(state.current.travel.y),
    );
    state.current.speed = speed;
    state.current.speedNormalized = gsap.utils.clamp(0, 1, speed);
  }

  useEffect(() => {
    state.current.normalizedX = (pointer.clientX || 0) / width;
    state.current.normalizedY = (pointer.clientY || 0) / height;

    state.current.mappedX = gsap.utils.mapRange(
      0,
      width,
      -1,
      1,
      pointer.clientX || 0,
    );
    state.current.mappedY = gsap.utils.mapRange(
      0,
      height,
      -1,
      1,
      pointer.clientY || 0,
    );
  }, [height, pointer.clientX, pointer.clientY, width])

  const smootherX = useSmoothNumber(pointer.clientX || 0, {
    duration: 0.6,
    ease: "power3",
    onStart: () => {
      state.current.moving.x = true
    },
    onComplete: () => {
      state.current.moving.x = false
      dirtyCheck()
    },
    onUpdate: () => {
      state.current.travel.x = getTravel(
        smootherX.data.target - smootherX.data.value,
      );
      dirtyCheck()
    },
  })

  const smootherY = useSmoothNumber(pointer.clientY || 0, {
    duration: 0.6,
    ease: "power3",
    onStart: () => {
      state.current.moving.y = true
    },
    onComplete: () => {
      state.current.moving.y = false
      dirtyCheck()
    },
    onUpdate: () => {
      state.current.travel.y = getTravel(
        smootherY.data.target - smootherY.data.value,
      );
      dirtyCheck()
    },
  })

  return state
}

export default useSmoothPointer
