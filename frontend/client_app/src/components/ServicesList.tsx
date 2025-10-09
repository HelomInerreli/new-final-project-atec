import React, { useState, useEffect } from 'react';
import '../styles/ServicesList.css';

interface ServiceInfo {
  id: number;
  name: string;
  description: string;
  features: string[];
  icon: string;
  priceRange: string;
}

export function ServicesList() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const services: ServiceInfo[] = [
    {
      id: 1,
      name: 'Inspeção Completa',
      description: 'Inspeção detalhada de todos os sistemas do seu veículo para garantir máxima segurança e desempenho.',
      features: [
        'Verificação do motor e transmissão',
        'Inspeção dos travões e suspensão',
        'Análise de fluidos e filtros',
        'Diagnóstico eletrónico completo',
        'Relatório detalhado'
      ],
      icon: 'bi-gear-wide-connected',
      priceRange: '€120 - €200'
    },
    {
      id: 2,
      name: 'Mudança de Óleo',
      description: 'Serviço essencial para manter o motor do seu carro a funcionar de forma suave e prolongar a sua vida útil.',
      features: [
        'Óleo de alta qualidade',
        'Substituição do filtro de óleo',
        'Verificação dos níveis',
        'Inspeção visual do motor',
        
      ],
      icon: 'bi-droplet-fill',
      priceRange: '€60 - €120'
    },
    {
      id: 3,
      name: 'Diagnóstico Eletrónico',
      description: 'Análise computadorizada completa para identificar problemas eletrónicos e otimizar o desempenho.',
      features: [
        'Scanner OBD avançado',
        'Análise de códigos de erro',
        'Teste de sensores',
        'Verificação da ECU',
        'Relatório técnico detalhado'
      ],
      icon: 'bi-cpu',
      priceRange: '€45 - €80'
    },
    {
      id: 4,
      name: 'Sistema de Travagem',
      description: 'Manutenção completa do sistema de travagem para garantir a sua segurança na estrada.',
      features: [
        'Inspeção das pastilhas e discos de travão',
        'Verificação do fluido de travões',
        'Teste de desempenho',
        'Substituição se necessário',
        'Certificado de segurança'
      ],
      icon: 'bi-stop-circle',
      priceRange: '€80 - €250'
    },
    {
      id: 5,
      name: 'Ar Condicionado',
      description: 'Manutenção e reparação do sistema de ar condicionado para o seu conforto em todas as estações.',
      features: [
        'Recarga do gás refrigerante',
        'Limpeza de filtros',
        'Verificação do compressor',
        'Teste de temperatura',
        'Desinfeção do sistema'
      ],
      icon: 'bi-snow',
      priceRange: '€70 - €150'
    },
    {
      id: 6,
      name: 'Pneus e Alinhamento',
      description: 'Serviços completos de pneus, alinhamento e balanceamento para uma condução segura e económica.',
      features: [
        'Montagem de pneus novos',
        'Alinhamento computadorizado',
        'Balanceamento de rodas',
        'Verificação da pressão',
        'Rodízio de pneus'
      ],
      icon: 'bi-circle',
      priceRange: '€35 - €400'
    }
  ];

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % services.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + services.length) % services.length);
  const goToSlide = (index: number) => setCurrentSlide(index);

  useEffect(() => {
    const interval = setInterval(nextSlide, 6000);
    return () => clearInterval(interval);
  }, [services.length]);

  return (
    <>
      <header className="services-header">
        <div className="container text-center py-5">
          <h1 className="services-title">Os Nossos Serviços</h1>
          <p className="services-subtitle">
            Soluções completas para manter o seu veículo em perfeitas condições
          </p>
        </div>
      </header>

      <main className="services-main">
        <div className="container py-5">

          {/* Carousel */}
          <section className="services-carousel mb-5">
            <div className="carousel slide" id="servicesCarousel" data-bs-ride="false">
              <div className="carousel-indicators mb-4">
                {services.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    className={currentSlide === i ? 'active' : ''}
                    onClick={() => goToSlide(i)}
                    aria-label={`Slide ${i + 1}`}
                  ></button>
                ))}
              </div>

              <div className="carousel-inner">
                {services.map((s, i) => (
                  <div key={s.id} className={`carousel-item ${currentSlide === i ? 'active' : ''}`}>
                    <div className="row justify-content-center">
                      <div className="col-lg-10">
                        <div className="card service-card border-0">
                          <div className="row g-0 h-100">
                            <div className="col-md-4 service-icon-area text-white">
                              <div className="text-center p-4">
                                <i className={`${s.icon} mb-4 service-icon-large`}></i>
                                <h3 className="fw-bold mb-3">{s.name}</h3>
                                <span className="badge bg-white price-tag">{s.priceRange}</span>
                              </div>
                            </div>
                            <div className="col-md-8">
                              <div className="card-body p-5 d-flex flex-column justify-content-center">
                                <h2 className="service-title">{s.name}</h2>
                                <p className="service-description">{s.description}</p>
                                <div className="service-features mb-4">
                                  <h5 className="mb-3">
                                    <i className="bi bi-check-circle-fill text-danger me-2"></i>
                                    O que inclui:
                                  </h5>
                                  {s.features.map((f, idx) => (
                                    <div key={idx} className="feature-item">
                                      <i className="bi bi-arrow-right-circle-fill text-danger me-2"></i>
                                      {f}
                                    </div>
                                  ))}
                                </div>
                                <div className="d-flex gap-3">
                                  <button className="btn btn-danger px-4">
                                    <i className="bi bi-calendar-plus me-2"></i>
                                    Agendar Serviço
                                  </button>
                                  <button className="btn btn-outline-danger px-4">
                                    <i className="bi bi-telephone me-2"></i>
                                    Contactar
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

              <button className="carousel-control-prev" type="button" onClick={prevSlide}>
                <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Anterior</span>
              </button>
              <button className="carousel-control-next" type="button" onClick={nextSlide}>
                <span className="carousel-control-next-icon" aria-hidden="true"></span>
                <span className="visually-hidden">Seguinte</span>
              </button>
            </div>
          </section>

          {/* Overview */}
          <section className="services-overview mb-5">
            <h3 className="text-center mb-4 overview-title">Visão Geral de Todos os Serviços</h3>
            <div className="row g-4">
              {services.map((s, i) => (
                <div key={s.id} className="col-lg-4 col-md-6">
                  <div
                    className={`card overview-card ${
                      currentSlide === i ? 'border-danger' : ''
                    }`}
                    onClick={() => goToSlide(i)}
                  >
                    <div className="card-body text-center p-4">
                      <i className={`${s.icon} overview-icon mb-3`}></i>
                      <h5 className="card-title">{s.name}</h5>
                      <p className="card-text small">{s.description.substring(0, 80)}...</p>
                      <span className="badge bg-danger price-tag-small">{s.priceRange}</span>
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
                <h3 className="cta-title">Deseja agendar um serviço ou saber mais?</h3>
                <p className="cta-text">
                  Contacte-nos para mais informações ou para agendar o seu serviço
                </p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <button className="btn btn-danger px-5">
                    <i className="bi bi-calendar-plus me-2"></i>
                    Agendar Serviço
                  </button>
                  <button className="btn btn-outline-danger px-5">
                    <i className="bi bi-telephone me-2"></i>
                    +351 123 456 789
                  </button>
                </div>
              </div>
            </div>
          </section>

        </div>
      </main>

      <footer className="services-footer mt-auto py-4">
        <div className="container text-center">
          <p className="mb-0">© 2025 Mecatec. Todos os direitos reservados</p>
          <small className="text-muted">Desenvolvido por DGHHN</small>
        </div>
      </footer>
    </>
  );
}
