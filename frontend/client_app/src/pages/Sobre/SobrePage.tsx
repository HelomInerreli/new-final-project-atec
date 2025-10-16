import React from 'react';
import '../../styles/SobrePage.css';
import { useTranslation } from "react-i18next";

const images = [
  "https://cdn.autopapo.com.br/box/uploads/2018/04/20145649/revisao-mecanica-oficina.jpg",
  "https://kmctecnologia.com/wp-content/uploads/2023/06/201-8-dicas-para-abrir-sua-propria-oficina-mecanica.png",
  "https://onmotor.com.br/wp-content/uploads/2023/04/2023-05-31-servicos-de-mecanica-automotiva.jpg",
  "https://blog.kroftools.com/wp-content/uploads/2021/02/o-que-precisa-para-abrir-uma-oficina-mecanica.png"
];

export function SobrePage() {
  const { t } = useTranslation();

  return (
    <div className="sobre-container">
      <header className="sobre-header">
        <div className="container text-center py-5">
          <h1 className="sobre-title">{t('sobrePage.title')}</h1>
          <p className="sobre-subtitle">{t('sobrePage.subtitle')}</p>
        </div>
      </header>

      {/* Galeria de imagens */}
      <section className="sobre-gallery">
        <div className="container">
          <div className="row g-3">
            {images.map((src, idx) => (
              <div className="col-6 col-md-3" key={idx}>
                <img src={src} alt="Mecânica" className="sobre-gallery-img" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <main className="sobre-main">
        <div className="container py-5">
          <section className="sobre-section mb-5">
            <h2 className="mb-4">{t('sobrePage.ourStory')}</h2>
            <p>{t('sobrePage.storyText')}</p>
          </section>
          <section className="sobre-section mb-5">
            <h2 className="mb-4">{t('sobrePage.ourMission')}</h2>
            <p>{t('sobrePage.missionText')}</p>
          </section>
          <section className="sobre-section mb-5">
            <h2 className="mb-4">{t('sobrePage.whyChoose')}</h2>
            <ul>
              <li>{t('sobrePage.reason1')}</li>
              <li>{t('sobrePage.reason2')}</li>
              <li>{t('sobrePage.reason3')}</li>
              <li>{t('sobrePage.reason4')}</li>
            </ul>
          </section>
             <section className="sobre-section text-center">
            <h2 className="mb-4">{t('sobrePage.contactUs')}</h2>
            <div className="d-flex justify-content-center">
              <div className="card shadow-sm" style={{ maxWidth: 400 }}>
                <div className="card-body">
                  
                  <p className="mb-2">
                    <strong>Email:</strong><br />
                    <a href="mailto:projetodghhn@gmail.com" className="text-decoration-none">
                      projetodghhn@gmail.com
                    </a>
                  </p>
                  <p>
                    <strong>Telefone:</strong><br />
                    <a href="tel:+351123456789" className="text-decoration-none">
                      +351 123 456 789
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}


