import { useState, useEffect, useCallback } from 'react';

interface CarouselControls {
  currentSlide: number;
  nextSlide: () => void;
  prevSlide: () => void;
  goToSlide: (index: number) => void;
  pause: () => void;
  resume: () => void;
  isPaused: boolean;
}

export function useCarousel(
  itemsLength: number, 
  autoPlayInterval = 6000
): CarouselControls {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % itemsLength);
  }, [itemsLength]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + itemsLength) % itemsLength);
  }, [itemsLength]);

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < itemsLength) {
      setCurrentSlide(index);
    }
  }, [itemsLength]);

  const pause = useCallback(() => {
    setIsPaused(true);
  }, []);

  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  // Auto-play effect
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