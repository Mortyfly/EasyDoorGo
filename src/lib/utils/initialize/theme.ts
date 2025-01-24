export const initializeTheme = () => {
  try {
    // Set initial theme based on localStorage or system preference
    const isDark = localStorage.getItem('darkMode') === 'true' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    document.documentElement.classList.toggle('dark', isDark);
    return true;
  } catch (error) {
    console.error('Theme initialization failed:', error);
    return false;
  }
};