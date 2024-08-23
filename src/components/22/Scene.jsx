import { useControls } from "leva";
import React from "react";
import { Balls } from "./Balls";
import { Plane } from "./Plane";

export function Scene() {
  
  return (
    <>
      <Plane size={[200, 200]} />
      <Balls />
    </>
  );
}
