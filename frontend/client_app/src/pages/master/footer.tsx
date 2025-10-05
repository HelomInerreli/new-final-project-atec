import { useTranslation } from "react-i18next";

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer
      className="bg-dark text-light py-3 w-100"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        zIndex: 1020,
      }}
    >
      <div className="container">
        <div className="d-flex justify-content-center align-items-center position-relative">
          <p className="mb-0">
            &copy; 2025 Mecatec. {t('allRightsReserved')}
          </p>
          <p className="mb-0 small position-absolute end-0">
            {t('developedBy')} DGHHN
          </p>
        </div>
      </div>
    </footer>
  );
}
