import { Chart, registerables } from 'chart.js';

export const initializeChart = () => {
  try {
    if (!Chart.defaults.plugins) {
      Chart.register(...registerables);
    }
    return true;
  } catch (error) {
    console.error('Chart initialization failed:', error);
    return false;
  }
};