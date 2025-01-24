import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

interface AchievementPopupProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description: string;
  badge?: string;
}

export function AchievementPopup({
  isOpen,
  onClose,
  title,
  description,
  badge
}: AchievementPopupProps) {
  useEffect(() => {
    if (isOpen) {
      const duration = 2000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 2,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        });
        confetti({
          particleCount: 2,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#FFD700', '#FFA500', '#FF6347']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent 
        className="sm:max-w-md border-0 bg-transparent shadow-none p-0"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <VisuallyHidden>
          <DialogTitle>Succès débloqué</DialogTitle>
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold">🎉 Succès débloqué !</h2>
                  {badge && (
                    <div className="text-6xl mb-4 animate-bounce">{badge}</div>
                  )}
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="text-lg opacity-90">{description}</p>
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