import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';
import { useEffect, useState } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';

const MOTIVATION_MESSAGES = [
  "Bien joué ! Une série de plus terminée, continuez sur votre lancée !",
  "Bravo ! 10 portes visitées, le succès se construit porte après porte.",
  "Excellente série ! Vous vous rapprochez de votre objectif.",
  "Vous avancez à grands pas ! Prêt(e) pour la prochaine série ?",
  "Super travail ! Encore quelques séries comme celle-ci et la ville sera conquise !",
  "Vous faites preuve d'une belle régularité, ne lâchez rien !",
  "Chaque série compte ! Vous êtes sur la bonne voie.",
  "Rythme parfait ! Vous êtes une machine à prospecter !",
  "Porte après porte, vous construisez votre victoire. Continuez !",
  "Encore 10 ! Vous avez l'énergie d'un conquérant.",
  "Série réussie ! Votre constance fait toute la différence.",
  "Vous progressez comme un(e) pro ! La prochaine série est à vous.",
  "Une série terminée, un pas de plus vers votre objectif final.",
  "Votre engagement est impressionnant ! Continuez sur cette lancée.",
  "Vous gagnez en puissance ! Les prochaines portes n'attendent que vous.",
  "C'est comme ça qu'on atteint ses objectifs ! Bravo pour cette série.",
  "Chaque effort compte, et vous êtes en train de tout donner.",
  "Magnifique série ! Vous avancez avec détermination.",
  "Restez dans ce rythme, vous faites un travail incroyable !",
  "Encore une série derrière vous, la victoire est proche !"
];

interface SeriesCompletionPopupProps {
  isOpen: boolean;
  onContinue: () => void;
  onPause: () => void;
}

export function SeriesCompletionPopup({
  isOpen,
  onContinue,
  onPause
}: SeriesCompletionPopupProps) {
  const [motivationMessage, setMotivationMessage] = useState<string>('');

  // Sélectionner un nouveau message uniquement lorsque la popup s'ouvre
  useEffect(() => {
    if (isOpen) {
      const randomIndex = Math.floor(Math.random() * MOTIVATION_MESSAGES.length);
      setMotivationMessage(MOTIVATION_MESSAGES[randomIndex]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Configuration des confettis
      const duration = 1500;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b']
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
          <DialogTitle>Série terminée</DialogTitle>
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
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="text-6xl mb-4">🎯</div>
                  <h2 className="text-2xl font-bold">Série terminée !</h2>
                  <p className="text-lg">{motivationMessage}</p>
                </div>
                
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={onContinue}
                    className="bg-white/20 hover:bg-white/30 text-white border-2 border-white/50"
                  >
                    Continuer sur ma lancée !
                  </Button>
                  <Button
                    onClick={onPause}
                    variant="outline"
                    className="bg-transparent hover:bg-white/10 text-white border-2 border-white/30"
                  >
                    Prendre une petite pause
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}