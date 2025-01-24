import { useEffect, useRef, useState } from 'react';
import { Chart, ChartConfiguration } from 'chart.js/auto';
import { Address } from '@/lib/types/address';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useStatusSettings } from '@/lib/hooks/useStatusSettings';

interface StatusChartProps {
  addresses: Address[];
}

export function StatusChart({ addresses }: StatusChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);
  const { statuses } = useStatusSettings();
  const [selectedStreet, setSelectedStreet] = useState<string>('all');

  // Obtenir la liste unique des rues
  const streets = [...new Set(addresses.map(a => a.streetName))].sort();

  // Filtrer les adresses en fonction de la rue sélectionnée
  const filteredAddresses = selectedStreet === 'all' 
    ? addresses 
    : addresses.filter(a => a.streetName === selectedStreet);

  useEffect(() => {
    if (!chartRef.current) return;

    const statusCounts = filteredAddresses.reduce((acc, addr) => {
      acc[addr.status] = (acc[addr.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Récupérer les couleurs des statuts
    const statusColors = Object.keys(statusCounts).map(statusName => {
      const status = statuses.find(s => s.name === statusName);
      return status?.color || '#000000';
    });

    const config: ChartConfiguration = {
      type: 'pie',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: statusColors,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        aspectRatio: 1.5,
        plugins: {
          legend: {
            position: 'bottom',
            align: 'center',
            labels: {
              boxWidth: 15,
              padding: 15,
              font: {
                size: 11
              }
            }
          },
          title: {
            display: true,
            text: selectedStreet === 'all' 
              ? 'Répartition des statuts - Toutes les rues' 
              : `Répartition des statuts - ${selectedStreet}`,
            font: {
              size: 16,
              weight: 'normal'
            },
            padding: {
              bottom: 20
            }
          }
        },
        layout: {
          padding: {
            bottom: 10
          }
        }
      }
    };

    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    chartInstance.current = new Chart(chartRef.current, config);

    return () => {
      chartInstance.current?.destroy();
    };
  }, [filteredAddresses, statuses, selectedStreet]);

  return (
    <Card className="w-full max-w-full">
      <CardHeader className="space-y-4">
        <CardTitle className="text-lg">Statistiques</CardTitle>
        <div className="space-y-2">
          <Label htmlFor="street-filter">Filtrer par rue</Label>
          <Select value={selectedStreet} onValueChange={setSelectedStreet}>
            <SelectTrigger id="street-filter" className="bg-background">
              <SelectValue placeholder="Toutes les rues" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les rues</SelectItem>
              {streets.map((street) => (
                <SelectItem key={`stats-street-${street}`} value={street}>
                  {street}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-2">
        <div className="relative w-full" style={{ maxHeight: '60vh' }}>
          <canvas ref={chartRef} />
        </div>
      </CardContent>
    </Card>
  );
}