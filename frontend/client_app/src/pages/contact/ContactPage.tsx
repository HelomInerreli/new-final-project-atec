import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/ContactPage.css';

/**
 * Componente de página de contacto
 * Exibe informações de contacto da empresa (email, telefone, morada)
 * Inclui mapa do Google Maps incorporado com localização da empresa
 * Totalmente internacionalizado com suporte a múltiplos idiomas
 * @returns Componente JSX da página de contacto
 */
export function ContactPage() {
  /**
   * Hook de tradução para internacionalização
   */
  const { t } = useTranslation();

  return (
    <div className="contact-container">
      {/* Cabeçalho da página com título e subtítulo */}
      <header className="contact-header">
        <div className="container text-center py-5">
          <h1 className="contact-title">{t('contact')}</h1>
          <p className="contact-subtitle">{t('contactSubtitle')}</p>
        </div>
      </header>
      {/* Conteúdo principal com informações de contacto e mapa */}
      <main className="contact-main">
        <div className="container py-5">
          <section className="contact-section">
            {/* Card com informações de contacto (email, telefone, morada) */}
            <div className="contact-card">
              <h5 className="contact-card-title">{t('contactUs')}</h5>
              {/* Email de contacto */}
              <p className="contact-info">
                <strong>{t('email')}:</strong><br />
                <a href="mailto:projetodghhn@gmail.com" className="text-decoration-none">
                  projetodghhn@gmail.com
                </a>
              </p>
              {/* Telefone de contacto */}
              <p className="contact-info">
                <strong>{t('phone')}:</strong><br />
                <a href="tel:+351123456789" className="text-decoration-none">
                  +351 123 456 789
                </a>
              </p>
              {/* Morada física da empresa */}
              <p className="contact-info">
                <strong>{t('address')}:</strong><br />
                Avenida Mário Brito (EN107), nº 3570 - Freixieiro, 4455-491 Perafita
              </p>
            </div>
            {/* Card com mapa Google Maps incorporado */}
            <div className="contact-card">
              <iframe
                className="contact-map"
                title={t('companyLocation')}
                src="https://www.google.com/maps?q=Avenida+M%C3%A1rio+Brito+EN107+3570+Freixieiro+4455-491+Perafita&output=embed"
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
export default ContactPage;