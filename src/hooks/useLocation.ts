import { useState, useEffect } from 'react';

export function useLocation() {
  const [pathname, setPathname] = useState('/');

  useEffect(() => {
    const updatePathname = () => {
      const hash = window.location.hash.slice(1) || '/';
      setPathname(hash);
    };

    window.addEventListener('hashchange', updatePathname);
    updatePathname();

    return () => window.removeEventListener('hashchange', updatePathname);
  }, []);

  return { pathname };
}