/* eslint-disable react/display-name */
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import gsap from "gsap";
import LayerGrid from "./LayerGrid";

const LayerLinearGrid = forwardRef(({ defaultVisible = true }, ref) => {
  const items = useRef([]);
  const ready = useRef(false);
  const tween = useRef();
  const lastProgress = useRef(0);
  const lastState = useRef({
    show: 0,
  });

  useEffect(() => {
    return () => {
      if (tween.current) {
        tween.current.kill();
      }
    };
  }, []);

  const animate = (show, opts) => {
    lastState.current = { show, opts };
    if (!tween.current) return;
    const target = show
      ? defaultVisible
        ? "start"
        : "end"
      : defaultVisible
        ? "end"
        : "start";
    return tween.current.tweenTo(target, { ease: "none", ...opts });
  };

  const createTimeline = useCallback(() => {
    tween.current?.kill();
    tween.current = gsap.timeline({
      paused: true,
      onUpdate() {
        lastProgress.current = tween.current.progress;
      },
      onComplete() {
        lastProgress.current = 1;
      },
    });

    const stepTime = 1 / items.current.length;
    tween.current.addLabel("start");
    items.current.forEach((item, i) => {
      gsap.set(item, { autoAlpha: defaultVisible ? 1 : 0 });
      tween.current.to(
        item,
        {
          autoAlpha: defaultVisible ? 0 : 1,
          ease: "none",
          duration: 0.1,
        },
        stepTime * i,
      );
    });
    tween.current.addLabel("end");
  }, []);

  const handleOnItemsChange = useCallback((_items) => {
    items.current = [..._items].sort(() => Math.random() - 0.5);
    createTimeline();
    ready.current = true;
  }, []);

  const tweenRef = useCallback(() => {
    if (!tween.current) return;
    tween.current.progress(lastProgress.current);
    if (lastState.current)
      animate(lastState.current.show, lastState.current.opts);
  }, []);

  useImperativeHandle(ref, () => {
    return {};
  });

  return <LayerGrid ref={tweenRef} onItemsChanged={handleOnItemsChange} />;
});

export default LayerLinearGrid;
