import CarouselImage from "../../components/carousel/CarouselImage";
import { FloatingWhatsApp } from "../../components/FloatingWhatsApp";

export default function Home() {
  return (
    <>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-3">
          Bem-vindo à Mecatec
        </h1>
        <p className="lead text-muted">
          Sua oficina mecânica de confiança - Tecnologia e qualidade a seu
          serviço
        </p>
      </div>

      <div className="mb-5">
        <CarouselImage />
      </div>

      {/* Seção de serviços em destaque */}
      <div className="row g-4 mt-4">
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title text-danger">
                🔧 Manutenção Preventiva
              </h5>
              <p className="card-text">
                Mantenha seu veículo sempre em perfeito estado.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title text-danger">⚡ Diagnóstico Rápido</h5>
              <p className="card-text">
                Identificamos problemas com precisão e agilidade.
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title text-danger">
                🛠️ Reparos Especializados
              </h5>
              <p className="card-text">
                Técnicos experientes para qualquer tipo de reparo.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="App">
        <FloatingWhatsApp
          phoneNumber="+351934108628"
          accountName="Mecatec"
          allowEsc
          allowClickAway
          notification
          notificationSound
        />
      </div>
    </>
  );
}
