import { ShareAltOutlined } from "@ant-design/icons";
import { Vexile } from "@haechi/flexile";
import { Button } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  useLocation,
  useMatch,
  useNavigate,
  useParams,
} from "react-router-dom";
import { getImageInfo } from "../../api/getImageInfo";
import { ActionBar, ImageFitter, Mask } from "../../components";
import { Boundary } from "../../contatnts/types";
import { ImageMaskerWrapper } from "../masker/styles";

export const ImageViewer = () => {
  const [boundary, setBoundary] = useState<Boundary>();
  const [opacity, setOpacity] = useState<number>(0.2);
  const [masks, setMasks] = useState<Boundary[]>([]);
  const [maskingRatio, setMaskingRatio] = useState(0.5);
  const [imageSrc, setImageSrc] = useState<string>();
  const [imageName, setImageName] = useState<string>();
  const [disabledIndexes, setDisabledIndexes] = useState<number[]>([]);

  const goto = useNavigate();

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

  const changeOpacity = useCallback(() => {
    setOpacity((prev) => (prev === 1 ? 0.2 : 1));
  }, []);

  const changeMaskingRatio = useCallback(() => {
    setMaskingRatio((prev) => Math.round(((prev + 0.2) % 1) * 100) / 100);
    hideRandom();
  }, [hideRandom]);

  const sharePage = () => {
    if (navigator.share === undefined) {
      prompt("링크를 복사해서 공유해주세요", window.location.href);
      return;
    }

    navigator.share({
      title: ["👻Masked에서 같이", imageName, "공부해요!"].join(" "),
      url: window.location.href,
    });
  };

  const imageId = useParams().id;

  useEffect(() => {
    if (!imageId) return;
    getImageInfo(imageId).then((res) => {
      setImageSrc(import.meta.env.VITE_SUPABASE_STORAGE_URL + res.image_uri);
      setMasks(res.masks);
      setImageName(res.name);
    });
  }, [imageId]);

  return (
    <Vexile filly>
      <ImageMaskerWrapper>
        {imageSrc && <ImageFitter src={imageSrc} onDraw={setBoundary} />}
        {boundary && (
          <div
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
      </ImageMaskerWrapper>
      <ActionBar x="right" gap={1} padding={2}>
        <Button type="primary" onClick={() => goto("/")}>
          나도 이런거 만들기!
        </Button>
        <Button onClick={sharePage} icon={<ShareAltOutlined />}>
          공유
        </Button>
        <Button onClick={changeMaskingRatio}>
          {maskingRatio * 100}% 보이기
        </Button>
        <Button onClick={changeOpacity}>불투명도 {opacity * 100}%</Button>
        <Button onClick={hideRandom}>👻섞기</Button>
      </ActionBar>
    </Vexile>
  );
};
