import { useEffect, useRef, useState } from "react";
import { Boundary } from "../contatnts/types";

export const ImageFitter: React.FC<{
  src: string;
  className?: string;
  onDraw?: (boundary: Boundary) => void;
}> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  const onResize = () => {
    if (!containerRef.current || !imageRef.current) return;

    const containerSize = {
      width: containerRef.current.clientWidth,
      height: containerRef.current.clientHeight,
    };

    const imageSize = {
      width: imageRef.current.clientWidth,
      height: imageRef.current.clientHeight,
    };

    const containerAspect = containerSize.width / containerSize.height;
    const imageAspect =
      imageRef.current.naturalWidth / imageRef.current.naturalHeight;

    if (containerAspect > imageAspect) {
      props.onDraw?.({
        y: 0,
        x: (containerSize.width - containerSize.height * imageAspect) / 2,
        width: containerSize.height * imageAspect,
        height: containerSize.height,
      });
    } else {
      // 가로에 맞춤
      props.onDraw?.({
        x: 0,
        y: (containerSize.height - containerSize.width / imageAspect) / 2,
        width: containerSize.width,
        height: containerSize.width / imageAspect,
      });
    }
  };

  useEffect(() => {
    onResize();
    window.addEventListener("resize", onResize);

    return () => window.removeEventListener("resize", onResize);
  }, [props.src, props.onDraw]);

  return (
    <div className={props.className} ref={containerRef}>
      <img
        src={props.src}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
        }}
        ref={imageRef}
      />
    </div>
  );
};
