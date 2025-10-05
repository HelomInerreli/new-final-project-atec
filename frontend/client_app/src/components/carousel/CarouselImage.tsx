import { useState, useEffect } from "react";
import Carousel from "react-bootstrap/Carousel";
import ExampleCarouselImage from "./ExampleCarouselImage";
import '../../i18n';
import { useTranslation } from "react-i18next";

function CarouselImage() {
  const [index, setIndex] = useState(0);
  const { t } = useTranslation();

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  // Auto-rotação a cada 5 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % 3); // 3 slides
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container py-4">
      <div className="row justify-content-center">
        <Carousel
          activeIndex={index}
          onSelect={handleSelect}
          interval={5000} // 5 segundos
          controls={true}
          indicators={true}
        >
          <Carousel.Item>
            <ExampleCarouselImage
              text={t("carousel.textImage1")}
              src="https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?cs=srgb&dl=pexels-pixabay-279949.jpg&fm=jpg"
              alt={t("carousel.altImage1")}
            />
            <Carousel.Caption>
              <h3>{t("carousel.captionImage1")}</h3>
            </Carousel.Caption>
          </Carousel.Item>

          <Carousel.Item>
            <ExampleCarouselImage
              text={t("carousel.textImage2")}
              src="https://quatrorodas.abril.com.br/wp-content/uploads/2019/06/foto-1-e1561482583234.jpg?quality=70&strip=info"
              alt={t("carousel.altImage2")}
            />
            <Carousel.Caption>
              <h3>{t("carousel.captionImage2")}</h3>
            </Carousel.Caption>
          </Carousel.Item>

          <Carousel.Item>
            <ExampleCarouselImage
              text={t("carousel.textImage3")}
              src="https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg?cs=srgb&dl=pexels-olly-3806249.jpg&fm=jpg"
              alt={t("carousel.altImage3")}
            />
            <Carousel.Caption>
              <h3>{t("carousel.captionImage3")}</h3>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </div>
    </div>
  );
}

export default CarouselImage;
