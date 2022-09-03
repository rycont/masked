import { styled } from "@stitches/react";
import { Boundary } from "../contatnts/types";

const MaskRect = styled("div", {
  position: "fixed",
  border: "2px solid black",
});

export const Mask: React.FC<{
  boundary: Boundary;
  disabled?: boolean;
  opacity?: number;
}> = (props) => {
  return (
    <MaskRect
      style={{
        left: props.boundary.x,
        top: props.boundary.y,
        width: props.boundary.width,
        height: props.boundary.height,
        background: `rgba(0, 0, 0, ${props.disabled ? 0 : props.opacity ?? 1})`,
      }}
    />
  );
};
