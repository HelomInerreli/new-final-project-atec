import { useEffect } from "react";

export default function Carousel() {
  useEffect(() => {
    // Auto-rotation manual usando JavaScript
    const carousel = document.getElementById("carouselExampleSlidesOnly");
    const items = carousel?.querySelectorAll(".carousel-item");
    let currentIndex = 0;

    const nextSlide = () => {
      if (items) {
        // Remove active da imagem atual
        items[currentIndex].classList.remove("active");

        // Move para o próximo índice
        currentIndex = (currentIndex + 1) % items.length;

        // Adiciona active na nova imagem
        items[currentIndex].classList.add("active");
      }
    };

    // Troca a cada 5 segundos
    const interval = setInterval(nextSlide, 5000);

    // Cleanup quando o componente for desmontado
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      id="carouselExampleSlidesOnly"
      className="carousel slide"
      data-ride="carousel"
      data-interval="5000"
      data-bs-ride="carousel"
      data-bs-interval="5000"
    >
      <div className="carousel-inner">
        <div className="carousel-item active">
          <img
            className="d-block w-100"
            src="https://tse1.mm.bing.net/th/id/OIP.HiRRY_3ItxjKqcBAs9p6ZgAAAA?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3"
            alt="First slide"
          />
        </div>
        <div className="carousel-item">
          <img
            className="d-block w-100"
            src="https://blog.simplusbr.com/wp-content/uploads/2020/09/oficina-mecanica-organizada.jpg"
            alt="Second slide"
          />
        </div>
        <div className="carousel-item">
          <img
            className="d-block w-100"
            src="https://tse1.mm.bing.net/th/id/OIP.s3M5FitSCr11qsmt8st2kgHaEW?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3"
            alt="Third slide"
          />
        </div>
      </div>
    </div>
  );
}
