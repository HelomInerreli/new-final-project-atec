import { useState, useEffect } from "react";
import Carousel from "react-bootstrap/Carousel";
import ExampleCarouselImage from "./ExampleCarouselImage";

function CarouselImage() {
  const [index, setIndex] = useState(0);

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
              text="Oficina Mecânica Profissional"
              src="https://images.pexels.com/photos/279949/pexels-photo-279949.jpeg?cs=srgb&dl=pexels-pixabay-279949.jpg&fm=jpg"
              alt="Oficina mecânica com equipamentos profissionais"
            />
            <Carousel.Caption>
              <h3>Mecatec - Sua Oficina de Confiança</h3>
            </Carousel.Caption>
          </Carousel.Item>

          <Carousel.Item>
            <ExampleCarouselImage
              text="Oficina Organizada"
              src="https://quatrorodas.abril.com.br/wp-content/uploads/2019/06/foto-1-e1561482583234.jpg?quality=70&strip=info"
              alt="Oficina mecânica bem organizada"
            />
            <Carousel.Caption>
              <h3>Organização e Qualidade</h3>
            </Carousel.Caption>
          </Carousel.Item>

          <Carousel.Item>
            <ExampleCarouselImage
              text="Serviços Especializados"
              src="https://images.pexels.com/photos/3806249/pexels-photo-3806249.jpeg?cs=srgb&dl=pexels-olly-3806249.jpg&fm=jpg"
              alt="Mecânico trabalhando em veículo"
            />
            <Carousel.Caption>
              <h3>Serviços Especializados</h3>
            </Carousel.Caption>
          </Carousel.Item>
        </Carousel>
      </div>
    </div>
  );
}

export default CarouselImage;
