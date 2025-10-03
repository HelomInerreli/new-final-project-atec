interface ExampleCarouselImageProps {
  text: string;
  src?: string;
  alt?: string;
  height?: string;
}

export default function ExampleCarouselImage({
  text,
  src,
  alt,
  height = "500px",
}: ExampleCarouselImageProps) {
  // Se não tiver src, usa uma imagem placeholder baseada no texto
  const imageUrl =
    src ||
    `https://via.placeholder.com/800x500/6c757d/ffffff?text=${encodeURIComponent(
      text
    )}`;

  return (
    <img
      className="d-block w-100"
      src={imageUrl}
      alt={alt || text}
      style={{
        height: height,
        objectFit: "cover",
      }}
    />
  );
}
