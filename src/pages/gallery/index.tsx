import { FileAddOutlined, PlusOutlined } from "@ant-design/icons";
import { Hexile, Vexile } from "@haechi/flexile";
import { Button, Card, Typography } from "antd";
import { Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getImageLists, getImageListsSuspend } from "../../api/getImageLists";
import { ImageItem } from "../../contatnts/types";

const Gallery: React.FC<{
  resource: ReturnType<typeof getImageListsSuspend>;
}> = ({ resource }) => {
  const images = resource.read();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gridGap: "2rem",
      }}
    >
      {images.map((image) => (
        <Link to={"/image/" + image.id}>
          <Card
            key={image.id}
            cover={
              <img
                alt="example"
                src={
                  import.meta.env.VITE_SUPABASE_STORAGE_URL + image.image_uri
                }
                style={{
                  aspectRatio: "1",
                  objectFit: "cover",
                }}
              />
            }
          >
            <Card.Meta
              title={image.name}
              description={[
                image.description,
                new Date(image.created_at).toLocaleDateString(),
              ]
                .filter(Boolean)
                .join(" / ")}
            />
          </Card>
        </Link>
      ))}
    </div>
  );
};

const GalleryWrapper = () => {
  return (
    <Vexile
      gap={2}
      padding={4}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.03)",
      }}
      filly
    >
      <Hexile x="space">
        <Typography.Title level={3}>👻Masked</Typography.Title>
        <Link to="/new">
          <Button type="primary" icon={<FileAddOutlined />}>
            새로 만들기
          </Button>
        </Link>
      </Hexile>
      <Suspense fallback={<div>불러오는 중...</div>}>
        <Gallery resource={getImageListsSuspend()} />
      </Suspense>
    </Vexile>
  );
};

export { GalleryWrapper as Gallery };
