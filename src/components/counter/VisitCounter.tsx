import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Plus, Minus, RotateCcw } from 'lucide-react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

export function VisitCounter() {
  const [isVisible, setIsVisible] = useState(false);
  const [count, setCount] = useLocalStorage('visitCount', 0);

  const increment = () => setCount(count + 1);
  const decrement = () => count > 0 && setCount(count - 1);
  const reset = () => setCount(0);

  return (
    <div className="w-full max-w-full px-2">
      <Button 
        variant="outline" 
        onClick={() => setIsVisible(!isVisible)}
        className="w-full mb-4"
      >
        {isVisible ? 'Masquer' : 'Afficher'} le Compteur
      </Button>

      {isVisible && (
        <Card className="w-full">
          <CardHeader className="px-4 py-3">
            <CardTitle className="text-lg">Compteur de visites</CardTitle>
          </CardHeader>
          <CardContent className="px-4 py-3 space-y-4">
            <div className="text-4xl font-bold text-center">{count}</div>
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={increment} variant="default" className="w-full">
                <Plus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Incrémenter</span>
              </Button>
              <Button onClick={decrement} variant="secondary" className="w-full">
                <Minus className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Décrémenter</span>
              </Button>
              <Button onClick={reset} variant="destructive" className="w-full">
                <RotateCcw className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Réinitialiser</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}