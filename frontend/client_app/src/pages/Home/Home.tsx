import CarouselImage from "../../components/carousel/CarouselImage";
import { FloatingWhatsApp } from "../../components/FloatingWhatsApp";
import '../../i18n';
import { useTranslation } from "react-i18next";

export default function Home() {
  const { t, i18n } = useTranslation();

  return (
    <>
      <div className="text-center mb-5">
        <h1 className="display-4 fw-bold text-dark mb-3">
          {t('welcome')} {t('toMecatec')}
        </h1>
        <p className="lead text-muted">
          {t('yourTrustedAutoShop')} - {t('technologyAndQuality')}
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
                🔧 {t('preventiveMaintenance')}
              </h5>
              <p className="card-text">
                {t('preventiveMaintenanceDescription')}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title text-danger">⚡ {t('quickDiagnosis')}</h5>
              <p className="card-text">
                {t('quickDiagnosisDescription')}
              </p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card h-100 shadow-sm">
            <div className="card-body text-center">
              <h5 className="card-title text-danger">
                🛠️ {t('specializedRepair')}
              </h5>
              <p className="card-text">
                {t('specializedRepairDescription')}
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
