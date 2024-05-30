/* eslint-disable react/display-name */
import useElementSize from "@custom-react-hooks/use-element-size";
import gsap from 'gsap'
import { useEffect, useMemo, useTransition, useRef, useState, forwardRef, useImperativeHandle } from "react";

const LayerGrid = forwardRef(({
  squareSize = 100,
  onItemsChanged = (evt) => {}
}, ref) => {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState([]);
  const [elRef, {width, height}] = useElementSize();
  const size = useMemo(() => {
    return squareSize;
  }, [squareSize]);
  const numcols = useMemo(() => ~~(width / size), [width, size])
  const numrows = useMemo(() => ~~(height / size), [height, size])
  let otherRef = useRef();

  useEffect(() => {
    startTransition(() => {
      setItems(new Array(numcols * numrows).fill(1));
    });
  }, [numcols, numrows]);

  useEffect(() => {
    if (otherRef.current && typeof onItemsChanged === 'function') {
      const items = gsap.utils.toArray('span', otherRef.current);
      onItemsChanged(items)
    }
  })

  useImperativeHandle(ref, () => {
    return {
      
    }
  })
  
  return (
    <span ref={(el) => { elRef(el); otherRef.current = el }}
    className="grid w-full h-full min-h-svh pointer-events-none gap-1"
    style={{
      gridTemplateColumns: `repeat(${numcols}, minmax(0, 1fr))`,
      gridTemplateRows: `repeat(${numrows}, minmax(0, 1fr))`
    }}
    >
      {
        items.map((_, idx) => (<span className="block bg-blue-500" key={idx}></span>))
      }
    </span>
  );
});

export default LayerGrid;