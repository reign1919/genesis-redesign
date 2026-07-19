import { useState, useEffect } from 'react';

const MOBILE_REGEX = /Mobi|Android|iPhone|iPad|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i;
const MOBILE_QUERY = '(max-width: 768px)';

export default function useIsMobile() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return MOBILE_REGEX.test(navigator.userAgent) || window.matchMedia(MOBILE_QUERY).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const handler = (e) => {
      setIsMobile(MOBILE_REGEX.test(navigator.userAgent) || e.matches);
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  return isMobile;
}
