import { styled } from "@stitches/react";
import { Boundary } from "../contatnts/types";

const MaskRect = styled("div", {
  position: "absolute",
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
        left: props.boundary.x * 100 + "%",
        top: props.boundary.y * 100 + "%",
        width: props.boundary.width * 100 + "%",
        height: props.boundary.height * 100 + "%",
        background: `rgba(0, 0, 0, ${props.disabled ? 0 : props.opacity ?? 1})`,
      }}
    />
  );
};
