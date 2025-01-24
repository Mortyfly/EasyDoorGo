import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface LevelUpPopupProps {
  isOpen: boolean;
  onClose: () => void;
  level: number;
  oldRank: string;
  newRank: string;
}

export function LevelUpPopup({
  isOpen,
  onClose,
  level,
  oldRank,
  newRank
}: LevelUpPopupProps) {
  useEffect(() => {
    if (isOpen) {
      // Configuration des confettis
      const startTime = Date.now();
      const duration = 3000;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval = setInterval(() => {
        const timeLeft = startTime + duration - Date.now();

        if (timeLeft <= 0) {
          clearInterval(interval);
          return;
        }

        const particleCount = 50 * (timeLeft / duration);

        // Confettis depuis les coins
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
      }, 250);

      return () => {
        clearInterval(interval);
        confetti.reset();
      };
    }
  }, [isOpen]);

  return (
    <Dialog 
      open={isOpen} 
      onOpenChange={() => {}}
    >
      <DialogContent 
        className="sm:max-w-md border-0 bg-transparent shadow-none p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>Niveau supérieur</DialogTitle>
        </VisuallyHidden>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ scale: 0.5, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.5, opacity: 0, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-gradient-to-br from-primary/90 to-primary p-6 rounded-lg shadow-2xl text-center text-white"
            >
              <div className="text-6xl mb-4 animate-bounce">🌟</div>
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Niveau supérieur !</h2>
                <div className="space-y-2">
                  <p className="text-xl">Niveau {level} atteint</p>
                  <p className="text-lg opacity-90">
                    Vous passez de <span className="font-semibold">{oldRank}</span> à <span className="font-semibold">{newRank}</span>
                  </p>
                </div>
                
                <Button
                  onClick={onClose}
                  className="mt-4 bg-white/20 hover:bg-white/30 text-white border-2 border-white/50 font-semibold text-lg px-8 py-2"
                >
                  Super !
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}