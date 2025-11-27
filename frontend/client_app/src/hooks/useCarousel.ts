import { useState, useEffect, useCallback } from 'react';

/**
 * Interface para os controles do carrossel
 */
interface CarouselControls {
  /** Índice do slide atual */
  currentSlide: number;
  /** Função para avançar para o próximo slide */
  nextSlide: () => void;
  /** Função para voltar ao slide anterior */
  prevSlide: () => void;
  /** Função para ir diretamente a um slide específico */
  goToSlide: (index: number) => void;
  /** Função para pausar o auto-play */
  pause: () => void;
  /** Função para retomar o auto-play */
  resume: () => void;
  /** Indica se o auto-play está pausado */
  isPaused: boolean;
}

/**
 * Hook personalizado para controlar um carrossel com navegação e auto-play
 * @param itemsLength - Número total de itens/slides no carrossel
 * @param autoPlayInterval - Intervalo em ms para auto-play (padrão: 6000ms)
 * @returns Objeto com controles do carrossel
 */
export function useCarousel(
  itemsLength: number, 
  autoPlayInterval = 6000
): CarouselControls {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  /**
   * Avança para o próximo slide (circular)
   */
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % itemsLength);
  }, [itemsLength]);

  /**
   * Volta ao slide anterior (circular)
   */
  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + itemsLength) % itemsLength);
  }, [itemsLength]);

  /**
   * Vai diretamente a um slide específico
   * @param index - Índice do slide (0-based)
   */
  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < itemsLength) {
      setCurrentSlide(index);
    }
  }, [itemsLength]);

  /**
   * Pausa o auto-play
   */
  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  /**
   * Retoma o auto-play
   */
  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  /**
   * Efeito para auto-play: avança slides automaticamente
   */
  useEffect(() => {
    if (isPaused || itemsLength <= 1) {
      return;
    }

    const interval = setInterval(nextSlide, autoPlayInterval);
    
    return () => clearInterval(interval);
  }, [itemsLength, autoPlayInterval, isPaused, nextSlide]);

  return {
    currentSlide,
    nextSlide,
    prevSlide,
    goToSlide,
    pause,
    resume,
    isPaused,
  };
}