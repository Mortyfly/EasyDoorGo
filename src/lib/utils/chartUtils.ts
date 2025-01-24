import { ChartConfiguration } from 'chart.js/auto';
import { AddressStatus } from '@/lib/types/address';

export const createStatusChartConfig = (statusCounts: Record<AddressStatus, number>): ChartConfiguration => ({
  type: 'pie',
  data: {
    labels: Object.keys(statusCounts),
    datasets: [{
      data: Object.values(statusCounts),
      backgroundColor: [
        'hsl(var(--chart-1))',
        'hsl(var(--chart-2))',
        'hsl(var(--chart-3))',
        'hsl(var(--chart-4))',
        'hsl(var(--chart-5))'
      ]
    }]
  },
  options: {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom'
      }
    }
  }
});