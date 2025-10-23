import React from 'react';
import { useTranslation } from 'react-i18next';
import '../../styles/ContactPage.css';

export function ContactPage() {
  const { t } = useTranslation();

  return (
    <div className="contact-container">
      <header className="contact-header">
        <div className="container text-center py-5">
          <h1 className="contact-title">{t('contact')}</h1>
          <p className="contact-subtitle">{t('contactSubtitle')}</p>
        </div>
      </header>
      <main className="contact-main">
        <div className="container py-5">
          <section className="contact-section">
            <div className="contact-card">
              <h5 className="contact-card-title">{t('contactUs')}</h5>
              <p className="contact-info">
                <strong>{t('email')}:</strong><br />
                <a href="mailto:projetodghhn@gmail.com" className="text-decoration-none">
                  projetodghhn@gmail.com
                </a>
              </p>
              <p className="contact-info">
                <strong>{t('phone')}:</strong><br />
                <a href="tel:+351123456789" className="text-decoration-none">
                  +351 123 456 789
                </a>
              </p>
              <p className="contact-info">
                <strong>{t('address')}:</strong><br />
                Avenida Mário Brito (EN107), nº 3570 - Freixieiro, 4455-491 Perafita
              </p>
            </div>
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