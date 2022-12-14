import React, { useCallback, useEffect, useState } from "react";
import { ActionBar, Mask } from "../../components";
import {
  Button,
  Form,
  Input,
  Modal,
  notification,
  Space,
  Typography,
} from "antd";
import { Boundary, Point } from "../../contatnts/types";
import { ImageMaskerWrapper, Image, Container } from "./styles";
import { SaveOutlined } from "@ant-design/icons";
import "../../api/createImage";
import { useDropzone } from "react-dropzone";
import { createImage } from "../../api/createImage";
import { useNavigate } from "react-router-dom";
import { Vexile } from "@haechi/flexile";

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
  const [imageSrc, setImageSrc] = useState<string>();
  const [maskingRatio, setMaskingRatio] = useState(0.5);
  const [isFirstDraw, setIsFirstDraw] = useState(true);

  const goto = useNavigate();
  const { acceptedFiles, getRootProps, getInputProps } = useDropzone();

  useEffect(() => {
    setMasks([]);
  }, [imageSrc]);

  useEffect(() => {
    if (acceptedFiles.length) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageSrc(reader.result as string);
      };
      reader.readAsDataURL(acceptedFiles[0]);
    }
  }, [acceptedFiles]);

  const hideRandom = useCallback(() => {
    while (true) {
      const newDisabledIndexes = masks
        .map((e, index) => (Math.random() < maskingRatio ? index : -1))
        .filter((e) => e !== -1);
      if (newDisabledIndexes.length === masks.length) continue;
      setDisabledIndexes(newDisabledIndexes);
      break;
    }
  }, [masks, maskingRatio]);

  const getRelativePoint = (p: Point) => {
    if (!boundary) throw "boundary is not defined";
    return {
      x: (p.x - boundary.x) / boundary.width,
      y: (p.y - boundary.y) / boundary.height,
    };
  };

  const startClick = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (startPoint) {
      setStartPoint(undefined);
      setEndPoint(undefined);
      return;
    }
    try {
      const { x, y } = getPoint(e);

      const selected = masks.find((mask) => {
        const relativePoint = getRelativePoint({ x, y });
        const startx = mask.x;
        const starty = mask.y;
        const endx = mask.x + mask.width;
        const endy = mask.y + mask.height;

        return (
          relativePoint.x >= startx &&
          relativePoint.x <= endx &&
          relativePoint.y >= starty &&
          relativePoint.y <= endy
        );
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
    [startPoint, boundary]
  );

  const endClick = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>
  ) => {
    if (!startPoint || !endPoint) {
      setStartPoint(undefined);
      setEndPoint(undefined);
      return;
    }

    if (!boundary) return;

    const relativeStartPoint = getRelativePoint(startPoint);
    const relativeEndPoint = getRelativePoint(endPoint);

    const newMask = {
      x: Math.min(relativeStartPoint.x, relativeEndPoint.x),
      y: Math.min(relativeStartPoint.y, relativeEndPoint.y),
      width: Math.abs(relativeStartPoint.x - relativeEndPoint.x),
      height: Math.abs(relativeStartPoint.y - relativeEndPoint.y),
    };

    // if (newMask.width < 10 || newMask.height < 10) {
    // } else {
    setMasks((prev) => [...prev, newMask]);
    // }

    setEndPoint(undefined);
    setStartPoint(undefined);
    if (isFirstDraw) {
      setIsFirstDraw(false);
      notification.info({
        message: "????????? ???????????? ????????? ??? ????????????",
      });
    }
  };

  const changeOpacity = useCallback(() => {
    setOpacity((prev) => (prev === 1 ? 0.2 : 1));
  }, []);

  const changeMaskingRatio = useCallback(() => {
    setMaskingRatio((prev) => Math.round(((prev + 0.2) % 1) * 100) / 100);
    hideRandom();
  }, [hideRandom]);

  const removeAll = () => {
    setMasks([]);
    setDisabledIndexes([]);
  };

  const [form] = Form.useForm();

  const saveMasks = async () => {
    if (!imageSrc) {
      notification.error({
        message: "???????????? ?????? ?????????????????????",
        duration: 1,
      });
      return;
    }

    let title = "";
    let description = "";

    await new Promise<void>((ok, error) => {
      const modal = Modal.info({
        icon: <></>,
        closable: true,
        okButtonProps: {
          onClick() {
            if (title) {
              modal.destroy();
              ok();
            } else notification.error({ message: "????????? ??????????????????" });
          },
        },
        title: (
          <>
            <Typography.Title level={5}>
              ???????????? ????????? ???????????????
            </Typography.Title>
          </>
        ),
        content: (
          <Form layout="vertical" form={form}>
            <Form.Item
              label="??????"
              name="title"
              required
              rules={[
                {
                  required: true,
                  message: "????????? ??????????????????",
                },
              ]}
            >
              <Input
                placeholder="[????????????] ??????????????? ??????"
                required
                onChange={(e) => {
                  title = e.target.value;
                }}
              />
            </Form.Item>
            <Form.Item label="??????">
              <Input
                placeholder="??????: ???????????? ???????????? 175p 2??? ??????"
                onChange={(e) => {
                  description = e.target.value;
                }}
              />
            </Form.Item>
          </Form>
        ),
      });
    });

    const image = await (await fetch(imageSrc)).blob();
    const createId = await createImage(masks, image, title, description);

    notification.success({
      message: "????????? ?????????????????? :) ????????? ?????? ????????? ??????????????????!",
      duration: 1,
    });

    goto(`/image/${createId}`);
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
      <ImageMaskerWrapper>
        {imageSrc ? (
          <Image src={imageSrc} onDraw={setBoundary} />
        ) : (
          <div {...getRootProps({ className: "dropzone" })}>
            <input {...getInputProps()} />
            <p>????????? ???????????? ????????? ?????????, ????????? ????????? ?????????????????????</p>
            <p>?????? ????????? ???????????? Ctrl-V??? ???????????????!</p>
          </div>
        )}
        {/* {console.log(boundary)} */}
        {boundary && (
          <div
            onMouseDown={startClick}
            onMouseMove={onDrag}
            onMouseUp={endClick}
            onTouchStart={startClick}
            onTouchMove={onDrag}
            onTouchEnd={endClick}
            onDragStart={(e) => e.preventDefault()}
            draggable={false}
            style={{
              position: "absolute",
              top: boundary.y,
              left: boundary.x,
              width: boundary.width,
              height: boundary.height,
            }}
          >
            {masks.map((mask, index) => (
              <Mask
                key={JSON.stringify(mask)}
                boundary={mask}
                disabled={disabledIndexes.includes(index)}
                opacity={opacity}
              />
            ))}
          </div>
        )}
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
      </ImageMaskerWrapper>
      <ActionBar x="right" gap={1} padding={2}>
        <Button onClick={changeMaskingRatio}>
          {maskingRatio * 100}% ?????????
        </Button>
        <Button onClick={changeOpacity}>???????????? {opacity * 100}%</Button>
        <Button onClick={removeAll}>?????? ?????????</Button>
        <Button onClick={saveMasks} icon={<SaveOutlined />}>
          ??????
        </Button>
        <Button onClick={hideRandom}>??????????</Button>
      </ActionBar>
    </Container>
  );
};
