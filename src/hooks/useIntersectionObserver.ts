import { useEffect, useRef, useState } from 'react';

interface UseIntersectionObserverOptions extends IntersectionObserverInit {
  freezeOnceVisible?: boolean;
}

export const useIntersectionObserver = (
  options: UseIntersectionObserverOptions = {}
) => {
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [hasBeenVisible, setHasBeenVisible] = useState(false);
  const elementRef = useRef<HTMLElement | null>(null);

  const { freezeOnceVisible = false, ...observerOptions } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const isElementIntersecting = entry.isIntersecting;
        
        if (isElementIntersecting && !hasBeenVisible) {
          setHasBeenVisible(true);
        }

        if (!freezeOnceVisible || !hasBeenVisible) {
          setIsIntersecting(isElementIntersecting);
        }
      },
      observerOptions
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [freezeOnceVisible, hasBeenVisible, observerOptions]);

  return {
    ref: elementRef,
    isIntersecting,
    hasBeenVisible
  };
};

export const useOnScreen = (options?: UseIntersectionObserverOptions) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    ...options
  });

  return { ref, isVisible: isIntersecting };
};