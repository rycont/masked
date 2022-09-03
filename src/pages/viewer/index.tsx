import { ShareAltOutlined } from "@ant-design/icons";
import { Hexile, Vexile } from "@haechi/flexile";
import { Button, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import {
  useLocation,
  useMatch,
  useNavigate,
  useParams,
} from "react-router-dom";
import { getImageInfo } from "../../api/getImageInfo";
import { getRandomImage } from "../../api/getRandomImage";
import { ActionBar, ImageFitter, Mask } from "../../components";
import { Boundary } from "../../contatnts/types";
import { notiOnce } from "../../functions/notiOnce";
import { ImageMaskerWrapper } from "../masker/styles";

const ratioThresholds = [0, 0.2, 0.4, 0.6, 0.8, 1];

export const ImageViewer = () => {
  const [boundary, setBoundary] = useState<Boundary>();
  const [opacity, setOpacity] = useState<number>(1);
  const [masks, setMasks] = useState<Boundary[]>([]);
  const [maskingRatio, setMaskingRatio] = useState(ratioThresholds[2]);
  const [imageSrc, setImageSrc] = useState<string>();
  const [imageName, setImageName] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [disabledIndexes, setDisabledIndexes] = useState<number[]>([]);

  const goto = useNavigate();

  const hideRandom = () => {
    const newDisabledIndexes = masks
      .map((e, index) => (Math.random() < maskingRatio ? index : -1))
      .filter((e) => e !== -1);

    setDisabledIndexes(newDisabledIndexes);
  };

  const changeOpacity = () => {
    setOpacity((prev) => (prev === 1 ? 0.2 : 1));
  };

  const changeMaskingRatio = () => {
    const newMaskingRatio =
      ratioThresholds[
        (ratioThresholds.indexOf(maskingRatio) + 1) % ratioThresholds.length
      ];

    setMaskingRatio(newMaskingRatio);
  };

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

  const goOtherImage = async () => {
    // setImageSrc(undefined);
    // setBoundary(undefined);
    // setMasks([]);
    // setDisabledIndexes([]);

    while (true) {
      if (!imageId) return;

      const nid = await getRandomImage();
      if (nid === +imageId) continue;

      setImageSrc(undefined);
      setBoundary(undefined);
      setMasks([]);
      setDisabledIndexes([]);
      setDescription(undefined);

      goto("/image/" + nid);
      break;
    }
  };

  useEffect(() => {
    if (!imageId) return;
    getImageInfo(imageId).then((res) => {
      setImageSrc(import.meta.env.VITE_SUPABASE_STORAGE_URL + res.image_uri);
      setMasks(res.masks);
      setDisabledIndexes(
        (res.masks as Boundary[])
          .map((_, index) => (Math.random() < maskingRatio ? index : -1))
          .filter((e) => e !== -1)
      );
      setImageName(res.name);
      setDescription(res.description);
    });
  }, [imageId, maskingRatio]);

  useEffect(() => {
    console.log("넘지 말아 BORDER LINE", maskingRatio);
    hideRandom();
  }, [maskingRatio]);

  useEffect(() => {
    notiOnce(
      "가려진 영역에 마우스를 올리거나 터치하면 정답을 볼 수 있습니다",
      "hover_answer"
    );
  }, []);

  useEffect(() => {
    console.log(!!imageSrc);
  }, [imageSrc, masks]);

  return (
    <Vexile filly>
      <ImageMaskerWrapper
        style={{
          opacity: imageSrc && masks.length && boundary ? 1 : 0,
          transition: "0.3s",
        }}
      >
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
              <>
                <Mask
                  key={JSON.stringify(mask)}
                  boundary={mask}
                  disabled={!disabledIndexes.includes(index)}
                  opacity={opacity}
                />
                {console.log(
                  disabledIndexes,
                  disabledIndexes.includes(index),
                  opacity
                )}
              </>
            ))}
          </div>
        )}
      </ImageMaskerWrapper>
      <Vexile padding={2} gap={2}>
        <Hexile y="bottom" gap={1} keepsize>
          <Typography.Title
            style={{
              margin: 0,
            }}
            level={5}
          >
            {imageName}
          </Typography.Title>
          {description && (
            <Typography.Text
              style={{
                opacity: 0.5,
              }}
            >
              {description}
            </Typography.Text>
          )}
        </Hexile>
        <ActionBar x="right" gap={2}>
          <Hexile gap={1} linebreak fillx>
            <Button type="primary" onClick={() => goto("/")}>
              나도 이런거 만들기!
            </Button>
            <Button onClick={sharePage} icon={<ShareAltOutlined />}>
              공유
            </Button>
            <Button onClick={goOtherImage}>다른 이미지 보기</Button>
            <Button onClick={changeMaskingRatio}>
              {maskingRatio * 100}% 숨기기
            </Button>
            <Button onClick={changeOpacity}>불투명도 {opacity * 100}%</Button>
            <Button onClick={hideRandom}>👻섞기</Button>
          </Hexile>
        </ActionBar>
      </Vexile>
    </Vexile>
  );
};
