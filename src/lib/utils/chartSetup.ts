import { Chart, registerables } from 'chart.js';

export const setupChart = () => {
  try {
    // Ensure Chart.js is only registered once
    if (!Chart.defaults.plugins) {
      Chart.register(...registerables);
    }
    
    // Set default options
    Chart.defaults.responsive = true;
    Chart.defaults.maintainAspectRatio = false;
    
    // Set default font
    Chart.defaults.font = {
      ...Chart.defaults.font,
      family: "'Inter', sans-serif"
    };
    
    // Set default colors that work with dark mode
    Chart.defaults.color = 'hsl(var(--foreground))';
    Chart.defaults.borderColor = 'hsl(var(--border))';
    
  } catch (error) {
    console.error('Failed to setup Chart.js:', error);
    throw new Error('Chart.js initialization failed');
  }
};