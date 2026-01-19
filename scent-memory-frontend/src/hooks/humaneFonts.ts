import { useEffect } from 'react';

export const useHumaneFont = () => {
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @font-face {
        font-family: 'HUMANE';
        src: url('/Humane-Medium.otf') format('opentype');
        font-weight: normal;
        font-style: normal;
      }
      @font-face {
        font-family: 'HUMANE';
        src: url('/Humane-SemiBold.otf') format('opentype');
        font-weight: 600;
        font-style: normal;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);
};
