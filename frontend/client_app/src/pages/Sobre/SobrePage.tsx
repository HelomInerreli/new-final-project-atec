import React, { useEffect } from "react";
import "../../styles/SobrePage.css";
import { useTranslation } from "react-i18next";

/**
 * Interface para item individual da faixa de serviços
 * Representa um serviço com ícone e label descritiva
 */
type ServiceStripItem = {
  /** Texto descritivo do serviço (pode conter \n para quebras de linha) */
  label: string;
  /** URL do ícone do serviço */
  icon: string;
};

/**
 * Interface para estrutura completa da faixa de serviços
 * Contém título da secção e array de itens de serviço
 */
type ServiceStrip = {
  /** Título da secção de serviços */
  title: string;
  /** Array de itens de serviço a serem exibidos */
  items: ServiceStripItem[];
};

/**
 * Componente de página "Sobre Nós" da aplicação cliente
 * Exibe informações institucionais da oficina: história, missão, diferenciais
 * Apresenta destaques visuais, faixa de serviços disponíveis e horários de funcionamento
 * Implementa animações de scroll com IntersectionObserver para efeito fade-in
 * Utiliza sistema de tradução i18n para conteúdo multilíngue
 * @returns Componente JSX da página Sobre
 */
export function SobrePage() {
  /**
   * Hook de tradução para internacionalização
   * Fornece função t() para traduzir chaves de texto
   */
  const { t } = useTranslation();

  /**
   * Efeito para configurar animações de scroll com IntersectionObserver
   * Adiciona classe "in-view" aos elementos com classe "fade-in" quando entram no viewport
   * Ativa animação quando 10% do elemento está visível (threshold: 0.1)
   * Executado apenas na montagem do componente
   */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          }
        });
      },
      { threshold: 0.1 }
    );
    document.querySelectorAll(".fade-in").forEach((el) => observer.observe(el));
  }, []);

  /**
   * Obtém dados da faixa de serviços do sistema de tradução
   * Retorna objeto com título e array de serviços (cada um com label e ícone)
   */
  const servicesStrip = t("servicesStrip", { returnObjects: true }) as ServiceStrip;

  return (
    <div className="sobre-container">
      {/* Secção Hero com título e subtítulo principais */}
      <header className="sobre-hero">
        <div className="overlay"></div>
        <div className="hero-content">
          <h1 className="hero-title">{t("sobrePage.title")}</h1>
          <p className="hero-subtitle">{t("sobrePage.subtitle")}</p>
        </div>
      </header>

      <main className="sobre-main container">
        {/* Nossa História */}
        <section className="sobre-section fade-in">
          <div className="sobre-flex">
            <img
              src="https://cdn.autopapo.com.br/box/uploads/2018/04/20145649/revisao-mecanica-oficina.jpg"
              alt={t("sobrePage.ourStory")}
              className="sobre-img"
            />
            <div className="sobre-text">
              <h2>{t("sobrePage.ourStory")}</h2>
              <p>{t("sobrePage.storyText")}</p>
            </div>
          </div>
        </section>

        {/* Nossa Missão */}
        <section className="sobre-section fade-in">
          <div className="sobre-flex reverse">
            <img
              src="https://kmctecnologia.com/wp-content/uploads/2023/06/201-8-dicas-para-abrir-sua-propria-oficina-mecanica.png"
              alt={t("sobrePage.ourMission")}
              className="sobre-img"
            />
            <div className="sobre-text">
              <h2>{t("sobrePage.ourMission")}</h2>
              <p>{t("sobrePage.missionText")}</p>
            </div>
          </div>
        </section>

        {/* Por que nos escolher */}
        <section className="sobre-section fade-in">
          <h2 className="text-center">{t("sobrePage.whyChoose")}</h2>
          <div className="sobre-grid">
            {[
              "sobrePage.reason1",
              "sobrePage.reason2",
              "sobrePage.reason3",
              "sobrePage.reason4",
            ].map((key, i) => (
              <div className="sobre-card" key={i}>
                <div className="sobre-icon">🚗</div>
                <p>{t(key)}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Horário - Destaques  */}
        <section className="sobre-section fade-in">
          <div className="destaques-horario-wrapper">
            {/* Card de Destaques */}
            <div className="destaques-card">
              <h3 className="destaques-title">{t("sobrePage.highlights.title")}</h3>
              <div className="destaques-grid">
                <div className="destaque-card">
                  <div className="destaque-icon">{t("sobrePage.highlights.transparency.icon")}</div>
                  <img
                    src="https://kmctecnologia.com/wp-content/uploads/2023/05/100-ferramentas-ideias-para-oficinas-mecanicas-modernas.png"
                    alt={t("sobrePage.highlights.transparency.label")}
                    className="destaque-img"
                  />
                  <div>
                    <div className="destaque-num">{t("sobrePage.highlights.transparency.num")}</div>
                    <div className="destaque-label">{t("sobrePage.highlights.transparency.label")}</div>
                  </div>
                </div>
                <div className="destaque-card">
                  <div className="destaque-icon">{t("sobrePage.highlights.technology.icon")}</div>
                  <img
                    src="https://reparacaoautomotiva.com.br/wp-content/uploads/2020/09/WhatsApp-Image-2020-09-15-at-11.14.23-e1600179317987.jpeg"
                    alt={t("sobrePage.highlights.technology.label")}
                    className="destaque-img"
                  />
                  <div>
                    <div className="destaque-num">{t("sobrePage.highlights.technology.num")}</div>
                    <div className="destaque-label">{t("sobrePage.highlights.technology.label")}</div>
                  </div>
                </div>
                <div className="destaque-card">
                  <div className="destaque-icon">{t("sobrePage.highlights.service.icon")}</div>
                  <img
                    src="https://img.freepik.com/fotos-gratis/mecanico-feliz-cumprimentando-seus-clientes-na-oficina-de-reparacao-de-automoveis_637285-11563.jpg"
                    alt={t("sobrePage.highlights.service.label")}
                    className="destaque-img"
                  />
                  <div>
                    <div className="destaque-num">{t("sobrePage.highlights.service.num")}</div>
                    <div className="destaque-label">{t("sobrePage.highlights.service.label")}</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Separador visual */}
            <div className="destaques-separador">
              <span className="separador-icon">↓</span>
            </div>
            {/* Faixa de serviços  */}
            <div className="services-strip">
              <h2 className="services-strip-title" style={{ color: '#e53935', textAlign: 'center', marginBottom: '2rem' }}>
                {servicesStrip.title}
              </h2>
              <div className="services-strip-list">
                {servicesStrip.items.map((item: ServiceStripItem, idx: number) => (
                  <div className="services-strip-item" key={idx}>
                    <img src={item.icon} alt={item.label} className="services-strip-icon" />
                    <div className="services-strip-label">
                      {item.label.split('\n').map((line: string, i: number) => (
                        <React.Fragment key={i}>
                          {line}
                          {i < item.label.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Card do Horário */}
            <div className="horario-centro">
              <div className="horario-card">
                <h2 className="horario-title">{t("sobrePage.openingHoursTitle")}</h2>
                <div className="horario-list">
                  <div className="horario-item">
                    <span className="horario-icon">📅</span>
                    <span className="horario-day">{t("sobrePage.openingHours.mondayFriday")}</span>
                  </div>
                  <div className="horario-item">
                    <span className="horario-icon">🗓️</span>
                    <span className="horario-day">{t("sobrePage.openingHours.saturday")}</span>
                  </div>
                  <div className="horario-item">
                    <span className="horario-icon">⛔</span>
                    <span className="horario-day">{t("sobrePage.openingHours.sunday")}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

export default SobrePage;