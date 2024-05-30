/* eslint-disable react/display-name */

import CustomPass from "./CustomPass";
import { forwardRef } from "react";

export default forwardRef(function (props, ref) {
  const effect = new CustomPass(props);

  return <primitive ref={ref} object={effect} />;
});
