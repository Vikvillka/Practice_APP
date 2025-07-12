// useYandexMaps.js
import { useEffect, useRef } from 'react';

const useYandexMaps = (apiKey, callback) => {
  const callbackRef = useRef(callback);
  
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (window.ymaps) {
      callbackRef.current();
      return;
    }

    if (window.__YMAPS_LOADING) return;
    window.__YMAPS_LOADING = true;

    const script = document.createElement('script');
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.async = true;

    script.onload = () => {
      window.ymaps.ready(() => {
        window.__YMAPS_LOADING = false;
        callbackRef.current();
      });
    };

    script.onerror = () => {
      window.__YMAPS_LOADING = false;
      console.error('Failed to load Yandex Maps');
    };

    document.head.appendChild(script);

    return () => {
      window.__YMAPS_LOADING = false;
    };
  }, [apiKey]);
};

export default useYandexMaps;