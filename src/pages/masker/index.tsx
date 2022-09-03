// import { ImageFitter } from "../../components";
import React, { useCallback, useEffect, useState } from "react";
import { ActionBar, Mask } from "../../components";
import { Button } from "antd";
import { Boundary, Point } from "../../contatnts/types";
import { ImageMaskerWrapper, Image, Container } from "./styles";
import { SaveOutlined } from "@ant-design/icons";

const isMouseEvent = (
  event: React.TouchEvent | React.MouseEvent
): event is React.MouseEvent => {
  return "clientX" in event;
};

const getPoint = (
  event: React.TouchEvent | React.MouseEvent,
  allowMultipoint = false
): Point => {
  if (isMouseEvent(event)) {
    return {
      x: event.clientX,
      y: event.clientY,
    };
  } else {
    if (event.touches.length > 1 && !allowMultipoint)
      throw new Error("Too many points");

    return {
      x: event.touches[0].clientX,
      y: event.touches[0].clientY,
    };
  }
};

export const Masker = () => {
  const [boundary, setBoundary] = useState<Boundary>();
  const [masks, setMasks] = useState<Boundary[]>([]);
  const [disabledIndexes, setDisabledIndexes] = useState<number[]>([]);

  const [startPoint, setStartPoint] = useState<Point>();
  const [endPoint, setEndPoint] = useState<Point>();

  const [opacity, setOpacity] = useState<number>(0.2);
  const [maskingRatio, setMaskingRatio] = useState(0.5);
  const [imageSrc, setImageSrc] = useState<string>(
    "https://www.dimigo.hs.kr/layouts/minimal_dimigo/images/background.jpg"
  );

  const hideRandom = useCallback(() => {
    while (true) {
      const newDisabledIndexes = masks
        .map((e, index) => (Math.random() < maskingRatio ? index : -1))
        .filter((e) => e !== -1);
      console.log(newDisabledIndexes.length);
      if (newDisabledIndexes.length === masks.length) continue;
      setDisabledIndexes(newDisabledIndexes);
      break;
    }
  }, [masks, maskingRatio]);

  const startClick = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (startPoint) return;
    try {
      const { x, y } = getPoint(e);

      const selected = masks.find((mask) => {
        const startx = mask.x;
        const starty = mask.y;
        const endx = mask.x + mask.width;
        const endy = mask.y + mask.height;

        return x >= startx && x <= endx && y >= starty && y <= endy;
      });

      if (selected) {
        setMasks(masks.filter((mask) => mask != selected));
        return;
      }

      setStartPoint({ x, y });
    } catch (e) {}
  };

  const onDrag = useCallback(
    (
      e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
    ) => {
      if (!startPoint) return;

      try {
        const { x, y } = getPoint(e);
        setEndPoint({ x, y });
      } catch (e) {}
    },
    [startPoint]
  );

  const endClick = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (!startPoint) return;
    if (!endPoint) return;

    const newMask = {
      x: Math.min(startPoint.x, endPoint.x),
      y: Math.min(startPoint.y, endPoint.y),
      width: Math.abs(startPoint.x - endPoint.x),
      height: Math.abs(startPoint.y - endPoint.y),
    };

    if (newMask.width < 10 || newMask.height < 10) {
    } else setMasks((prev) => [...prev, newMask]);

    setEndPoint(undefined);
    setStartPoint(undefined);
  };

  const changeOpacity = useCallback(() => {
    setOpacity((prev) => (prev === 1 ? 0.2 : 1));
  }, []);

  const changeMaskingRatio = useCallback(() => {
    setMaskingRatio((prev) => Math.floor(((prev + 0.2) % 1) * 100) / 100);
    hideRandom();
  }, [hideRandom]);

  const removeAll = () => {
    setMasks([]);
    setDisabledIndexes([]);
  };

  useEffect(() => {
    const pasteFromClipboard = (e: ClipboardEvent) => {
      const item = e.clipboardData?.items[0];
      if (!item?.type.startsWith("image")) return;

      const blob = item.getAsFile();
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      setImageSrc(url);
    };
    document.addEventListener("paste", pasteFromClipboard);

    return () => document.removeEventListener("paste", pasteFromClipboard);
  }, []);

  return (
    <Container filly>
      <ImageMaskerWrapper
        onMouseDown={startClick}
        onMouseMove={onDrag}
        onMouseUp={endClick}
        onTouchStart={startClick}
        onTouchMove={onDrag}
        onTouchEnd={endClick}
        onClick={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        draggable={false}
      >
        <Image src={imageSrc} onDraw={setBoundary} />
        {startPoint && endPoint && (
          <div
            style={{
              position: "fixed",
              border: "2px solid black",
              background: "rgba(0, 0, 128, 0.5)",
              left: Math.min(startPoint.x, endPoint.x),
              top: Math.min(startPoint.y, endPoint.y),
              width: Math.abs(startPoint.x - endPoint.x),
              height: Math.abs(startPoint.y - endPoint.y),
            }}
          />
        )}
        {masks.map((mask, index) => (
          <Mask
            boundary={mask}
            disabled={disabledIndexes.includes(index)}
            opacity={opacity}
          />
        ))}
      </ImageMaskerWrapper>
      <ActionBar x="right" gap={1} padding={2}>
        <Button onClick={changeMaskingRatio}>
          {maskingRatio * 100}% 가리기
        </Button>
        <Button onClick={changeOpacity}>투명도 {opacity}</Button>
        <Button onClick={removeAll}>모두 지우기</Button>
        <Button icon={<SaveOutlined />}>(작동 안함) 저장</Button>
        <Button onClick={hideRandom}>👻섞기</Button>
      </ActionBar>
    </Container>
  );
};
