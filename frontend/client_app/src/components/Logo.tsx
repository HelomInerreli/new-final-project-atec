interface LogoProps {
  /**
   * Largura do logo em pixels (padrão: 400)
   */
  width?: number;
  /**
   * Altura do logo em pixels (padrão: 100)
   */
  height?: number;
  /**
   * Escala geral do logo (multiplica width e height)
   */
  scale?: number;
  /**
   * Classes CSS adicionais
   */
  className?: string;
  /**
   * Mostrar ou não o subtítulo abaixo da logo
   */
  showSubtitle?: boolean;
}

export function Logo({
  width = 400,
  height = 100,
  scale = 1,
  className = "",
  showSubtitle = true,
}: LogoProps) {
  // Definir dimensões baseadas no conteúdo, não no espaço vazio
  const logoOnlyHeight = showSubtitle ? height : 70; // Altura apenas do texto principal
  const finalWidth = width * scale;
  const finalHeight = logoOnlyHeight * scale;

  // Calcular posições proporcionalmente
  const textXMec = (110 / 400) * finalWidth;
  const textXAtec = (195 / 400) * finalWidth;
  const textY = showSubtitle
    ? (70 / 100) * finalHeight
    : (50 / 70) * finalHeight; // Posição Y ajustada
  const subtitleX = (111 / 400) * finalWidth;
  const subtitleY = (82 / 100) * finalHeight;

  // Calcular tamanhos de fonte proporcionalmente
  const mainFontSize = (60 / 400) * finalWidth;
  const subtitleFontSize = (12 / 400) * finalWidth;

  return (
    <>
      <style>
        {`
          .font-staatliches {
            font-family: "Staatliches", cursive;
          }
          .font-bold {
            font-family: "Staatliches", cursive;
            font-weight: 900;
            stroke-width: 0.8;
          }
        `}
      </style>
      <svg
        viewBox={`0 0 ${finalWidth} ${finalHeight}`}
        width={finalWidth}
        height={finalHeight}
        className={`${className}`}
      >
        {/* Texto do Logo */}
        <text
          x={textXMec}
          y={textY}
          fontSize={mainFontSize}
          fill="#D82E2F"
          stroke="#D82E2F"
          strokeWidth="0.8"
          fontWeight="900"
          className="font-bold"
        >
          Mec
        </text>
        <text
          x={textXAtec}
          y={textY}
          fontSize={mainFontSize}
          fill="#4F4F4F"
          stroke="#4F4F4F"
          strokeWidth="0.8"
          fontWeight="900"
          className="font-bold"
        >
          atec
        </text>
        {/* Texto abaixo da Logo - só renderiza se showSubtitle for true */}
        {showSubtitle && (
          <text
            x={subtitleX}
            y={subtitleY}
            fontSize={subtitleFontSize}
            fill="#333"
            fontStyle="italic"
            className="font-staatliches"
          >
            Tecnologia e confiança a seu serviço
          </text>
        )}
      </svg>
    </>
  );
}
