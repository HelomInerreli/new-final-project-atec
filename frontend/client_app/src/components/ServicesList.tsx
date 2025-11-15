import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

// Components
import { CreateAppointmentModal } from './CreateAppointmentModal';

// Hooks
import { useCarousel } from '../hooks/useCarousel';

// Interfaces
import { type ServiceInfo } from '../interfaces/service';

// Styles
import '../styles/ServicesList.css';

export function ServicesList() {
  const { t } = useTranslation();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // ✅ Dados dos serviços
  const services: ServiceInfo[] = [
    {
      id: 1,
      name: t('servicesPage.serviceNames.completeInspection'),
      description: t('servicesPage.serviceDescriptions.completeInspection'),
      features: [
        t('servicesPage.features.engineCheck', 'Verificação do motor e transmissão'),
        t('servicesPage.features.brakeSuspension', 'Inspeção dos travões e suspensão'),
        t('servicesPage.features.fluidsFilters', 'Análise de fluidos e filtros'),
        t('servicesPage.features.electronicDiagnosis', 'Diagnóstico eletrónico completo'),
        t('servicesPage.features.detailedReport', 'Relatório detalhado'),
      ],
      icon: 'bi-gear-wide-connected',
      priceRange: 200,
    },
    {
      id: 2,
      name: t('servicesPage.serviceNames.oilChange'),
      description: t('servicesPage.serviceDescriptions.oilChange'),
      features: [
        t('servicesPage.features.highQualityOil', 'Óleo de alta qualidade'),
        t('servicesPage.features.oilFilter', 'Substituição do filtro de óleo'),
        t('servicesPage.features.levelCheck', 'Verificação dos níveis'),
        t('servicesPage.features.visualEngine', 'Inspeção visual do motor'),
      ],
      icon: 'bi-droplet-fill',
      priceRange: 40,
    },
    {
      id: 3,
      name: t('servicesPage.serviceNames.electronicDiagnostics'),
      description: t('servicesPage.serviceDescriptions.electronicDiagnostics'),
      features: [
        t('servicesPage.features.advancedOBD', 'Scanner OBD avançado'),
        t('servicesPage.features.errorCodes', 'Análise de códigos de erro'),
        t('servicesPage.features.sensorTest', 'Teste de sensores'),
        t('servicesPage.features.ecuCheck', 'Verificação da ECU'),
        t('servicesPage.features.technicalReport', 'Relatório técnico'),
      ],
      icon: 'bi-cpu',
      priceRange: 50,
    },
    {
      id: 4,
      name: t('servicesPage.serviceNames.brakeSystem'),
      description: t('servicesPage.serviceDescriptions.brakeSystem'),
      features: [
        t('servicesPage.features.brakePads', 'Inspeção das pastilhas e discos'),
        t('servicesPage.features.brakeFluid', 'Verificação do fluido de travões'),
        t('servicesPage.features.performanceTest', 'Teste de desempenho'),
        t('servicesPage.features.replacement', 'Substituição se necessário'),
        t('servicesPage.features.safetyCertificate', 'Certificado de segurança'),
      ],
      icon: 'bi-stop-circle',
      priceRange: 45,
    },
    {
      id: 5,
      name: t('servicesPage.serviceNames.airConditioning'),
      description: t('servicesPage.serviceDescriptions.airConditioning'),
      features: [
        t('servicesPage.features.gasRecharge', 'Recarga do gás'),
        t('servicesPage.features.filterCleaning', 'Limpeza de filtros'),
        t('servicesPage.features.compressorCheck', 'Verificação do compressor'),
        t('servicesPage.features.temperatureTest', 'Teste de temperatura'),
        t('servicesPage.features.systemDisinfection', 'Desinfeção do sistema'),
      ],
      icon: 'bi-snow',
      priceRange: 70,
    },
    {
      id: 6,
      name: t('servicesPage.serviceNames.tiresAlignment'),
      description: t('servicesPage.serviceDescriptions.tiresAlignment'),
      features: [
        t('servicesPage.features.tireMounting', 'Montagem de pneus'),
        t('servicesPage.features.computerAlignment', 'Alinhamento computadorizado'),
        t('servicesPage.features.wheelBalancing', 'Balanceamento'),
        t('servicesPage.features.pressureCheck', 'Verificação da pressão'),
        t('servicesPage.features.tireRotation', 'Rodízio de pneus'),
      ],
      icon: 'bi-circle',
      priceRange: 35,
    },
  ];

  // ✅ Hook personalizado para carousel
  const { currentSlide, nextSlide, prevSlide, goToSlide } = useCarousel(
    services.length,
    6000
  );

  return (
    <>
      {/* Header */}
      <header className="services-header">
        <div className="container text-center py-0">
          <div className="services-hero">
            <h1 className="services-title">{t('servicesPage.title')}</h1>
            <p className="services-subtitle">{t('servicesPage.subtitle')}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="services-main">
        <div className="container py-5">
          
          {/* Carousel */}
          <section className="services-carousel mb-5">
            <div className="carousel slide" id="servicesCarousel">
              
              {/* Indicators */}
              <div className="carousel-indicators mb-4">
                {services.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={currentSlide === i ? 'active' : ''}
                    onClick={() => goToSlide(i)}
                    aria-label={`Slide ${i + 1}`}
                  />
                ))}
              </div>

              {/* Slides */}
              <div className="carousel-inner">
                {services.map((service, i) => (
                  <div
                    key={service.id}
                    className={`carousel-item ${currentSlide === i ? 'active' : ''}`}
                  >
                    <div className="row justify-content-center">
                      <div className="col-lg-10">
                        <div className="card service-card border-0">
                          <div className="row g-0 h-100">
                            
                            {/* Icon Area */}
                            <div className="col-md-4 service-icon-area text-white">
                              <div className="text-center p-4">
                                <i className={`${service.icon} mb-4 service-icon-large`} />
                                <h3 className="fw-bold mb-3">{service.name}</h3>
                                <span className="badge bg-white price-tag">
                                  {t('servicesPage.priceFrom')} €{service.priceRange}
                                </span>
                              </div>
                            </div>

                            {/* Content */}
                            <div className="col-md-8">
                              <div className="card-body p-5 d-flex flex-column justify-content-center">
                                <h2 className="service-title">{service.name}</h2>
                                <p className="service-description">
                                  {service.description}
                                </p>
                                
                                {/* Features */}
                                <div className="service-features mb-4">
                                  <h5 className="mb-3">
                                    <i className="bi bi-check-circle-fill text-danger me-2" />
                                    {t('servicesPage.whatsIncluded')}
                                  </h5>
                                  {service.features.map((feature, idx) => (
                                    <div key={idx} className="feature-item">
                                      <i className="bi bi-arrow-right-circle-fill text-danger me-2" />
                                      {feature}
                                    </div>
                                  ))}
                                </div>

                                {/* Actions */}
                                <div className="d-flex gap-3">
                                  <button
                                    className="btn btn-danger px-4"
                                    onClick={() => setShowCreateModal(true)}
                                  >
                                    <i className="bi bi-calendar-plus me-2" />
                                    {t('servicesPage.scheduleService')}
                                  </button>
                                  <button
                                    className="btn btn-outline-danger px-4"
                                    onClick={() => setShowContactModal(true)}
                                  >
                                    <i className="bi bi-telephone me-2" />
                                    {t('servicesPage.contact')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Controls */}
              <button
                className="carousel-control-prev"
                type="button"
                onClick={prevSlide}
              >
                <span className="carousel-control-prev-icon" aria-hidden="true" />
                <span className="visually-hidden">
                  {t('previous', 'Anterior')}
                </span>
              </button>
              <button
                className="carousel-control-next"
                type="button"
                onClick={nextSlide}
              >
                <span className="carousel-control-next-icon" aria-hidden="true" />
                <span className="visually-hidden">
                  {t('next', 'Seguinte')}
                </span>
              </button>
            </div>
          </section>

          {/* Overview Grid */}
          <section className="services-overview mb-5">
            <h3 className="text-center mb-4 overview-title">
              {t('servicesPage.allServices')}
            </h3>
            <div className="row g-4">
              {services.map((service, i) => (
                <div key={service.id} className="col-lg-4 col-md-6">
                  <div
                    className={`card overview-card ${
                      currentSlide === i ? 'border-danger' : ''
                    }`}
                    onClick={() => goToSlide(i)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="card-body text-center p-4">
                      <i className={`${service.icon} overview-icon mb-3`} />
                      <h5 className="card-title">{service.name}</h5>
                      <p className="card-text small text-muted">
                        {service.description.length > 80 
                          ? `${service.description.substring(0, 80)}...`
                          : service.description
                        }
                      </p>
                      <span className="badge bg-danger price-tag-small">
                        {t('servicesPage.priceFrom')} €{service.priceRange}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center">
            <div className="card border-0 shadow-sm rounded-3">
              <div className="card-body p-5">
                <h3 className="cta-title">
                  {t('servicesPage.readyToSchedule')}
                </h3>
                <p className="cta-text">{t('servicesPage.subtitle')}</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <button
                    className="btn btn-danger px-5"
                    onClick={() => setShowCreateModal(true)}
                  >
                    <i className="bi bi-calendar-plus me-2" />
                    {t('servicesPage.scheduleService')}
                  </button>
                  <button
                    className="btn btn-outline-danger px-5"
                    onClick={() => setShowContactModal(true)}
                  >
                    <i className="bi bi-telephone me-2" />
                    +351 123 456 789
                  </button>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Contact Modal */}
      <Modal
        show={showContactModal}
        onHide={() => setShowContactModal(false)}
        centered
        className="contact-modal"
      >
        <Modal.Header closeButton>
          <Modal.Title>{t('contactModal.title')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>{t('contactModal.emailLabel')}:</strong>{' '}
            <a href={`mailto:${t('contactModal.emailValue')}`}>
              {t('contactModal.emailValue')}
            </a>
          </p>
          <p>
            <strong>{t('contactModal.phoneLabel')}:</strong>{' '}
            <a href={`tel:${t('contactModal.phoneValue')}`}>
              {t('contactModal.phoneValue')}
            </a>
          </p>
          <p className="mt-2">{t('contactModal.subtitle')}</p>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowContactModal(false)}
          >
            {t('contactModal.close')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Appointment Modal */}
      <CreateAppointmentModal
        show={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setShowCreateModal(false);
          alert(
            t('appointmentCreatedSuccess', 'Agendamento criado com sucesso!')
          );
        }}
      />
    </>
  );
}


