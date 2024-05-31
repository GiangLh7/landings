import { useMemo } from "react";
import { OrthographicCamera, PerspectiveCamera } from "three";
import { useThree } from "react-three-fiber";
import { useElementBounding, useWindowSize } from "@reactuses/core";

const useDomMapping = (element, options = {}) => {
  const {
    top,
    left,
    width: elWidth,
    height: elHeight,
    bottom,
    update,
    x,
    y,
  } = useElementBounding(element, {});
  const { camera } = useThree();
  const { width: screenWidth, height: screenHeight } = useWindowSize();

  const cameraSize = useMemo(() => {
    const f = (camera.fov * Math.PI) / 180;
    const u = 2 * Math.tan(f / 2) * camera.position.z;

    return {
      width: u * (camera.aspect || 0),
      height: u || 0,
    };
  }, [camera]);

  const scale = useMemo(() => {
    if (camera instanceof PerspectiveCamera) {
      const { width, height } = cameraSize;
      return !width || !height
        ? { x: 0, y: 0, z: 1 }
        : {
            x: (elWidth / screenWidth) * width,
            y: (elHeight / screenHeight) * height,
            z: 1,
          };
    } else if (camera instanceof OrthographicCamera) {
      return {
        x: elWidth,
        y: elHeight,
        z: 1,
      };
    }
    return { x: 0, y: 0, z: 1 };
  }, [camera, cameraSize, elHeight, elWidth, screenHeight, screenWidth]);

  const position = useMemo(() => {
    const tx = left;
    const ty = top;
    if (camera instanceof PerspectiveCamera) {
      const { width, height } = cameraSize;
      return !width || !height
        ? { x: 0, y: 0, z: 0 }
        : {
            x: (scale.x - width) / 2 + (tx / screenWidth) * width,
            y: (height - scale.y) / 2 - (ty / screenHeight) * height,
            z: options.value || 0,
          };
    } else if (camera instanceof OrthographicCamera) {
      return {
        x: tx - (screenWidth - scale.x) / 2,
        y: -ty + (screenHeight - scale.y) / 2,
        z: 0,
      };
    }

    return { x: 0, y: 0, z: 0 };
  }, [
    camera,
    cameraSize,
    left,
    options.value,
    scale.x,
    scale.y,
    top,
    screenWidth,
    screenHeight,
  ]);

  return {
    height: elHeight,
    position,
    scale,
    update: update,
    visible: true,
    width: elWidth,
  };
};

export default useDomMapping;
