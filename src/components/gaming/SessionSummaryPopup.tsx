import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import confetti from 'canvas-confetti';
import { useEffect } from 'react';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { formatDuration } from '@/lib/utils/dateUtils';
import { Trophy, Clock, Target, Star } from 'lucide-react';

interface SessionSummaryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  session: {
    duration: number;
    doorsVisited: number;
    seriesCompleted: number;
    startedAt: Date;
  };
}

export function SessionSummaryPopup({
  isOpen,
  onClose,
  session
}: SessionSummaryPopupProps) {
  useEffect(() => {
    if (isOpen) {
      // Configuration des confettis
      const duration = 3000;
      const end = Date.now() + duration;

      const frame = () => {
        confetti({
          particleCount: 3,
          angle: 60,
          spread: 55,
          origin: { x: 0 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7']
        });
        confetti({
          particleCount: 3,
          angle: 120,
          spread: 55,
          origin: { x: 1 },
          colors: ['#22c55e', '#3b82f6', '#f59e0b', '#a855f7']
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };

      frame();
    }
  }, [isOpen]);

  // Calculer les statistiques
  const doorsPerHour = session.duration > 0 
    ? Math.round((session.doorsVisited / session.duration) * 3600)
    : 0;

  // Générer un message de félicitations personnalisé
  const getMessage = () => {
    if (session.seriesCompleted >= 5) {
      return "Performance exceptionnelle ! Vous êtes un véritable champion de la prospection !";
    } else if (session.seriesCompleted >= 3) {
      return "Excellent travail ! Votre constance est remarquable !";
    } else if (doorsPerHour >= 30) {
      return "Belle efficacité ! Vous maintenez un rythme soutenu !";
    } else {
      return "Bravo pour cette session ! Chaque porte compte !";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <VisuallyHidden>
          <DialogTitle>Résumé de la session</DialogTitle>
        </VisuallyHidden>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="space-y-6"
            >
              {/* Titre et message */}
              <div className="text-center space-y-2">
                <div className="flex justify-center gap-2 text-4xl mb-2">
                  🎉 🏆 ⭐
                </div>
                <h2 className="text-2xl font-bold">Session terminée !</h2>
                <p className="text-muted-foreground">{getMessage()}</p>
              </div>

              {/* Statistiques principales */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Clock className="h-5 w-5" />
                    <span className="font-medium">Durée</span>
                  </div>
                  <p className="text-2xl font-bold">{formatDuration(session.duration)}</p>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg space-y-1">
                  <div className="flex items-center gap-2 text-primary">
                    <Target className="h-5 w-5" />
                    <span className="font-medium">Portes visitées</span>
                  </div>
                  <p className="text-2xl font-bold">{session.doorsVisited}</p>
                </div>
              </div>

              {/* Statistiques détaillées */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Trophy className="h-5 w-5 text-primary" />
                    <span>Séries complétées</span>
                  </div>
                  <span className="font-bold">{session.seriesCompleted}</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-primary" />
                    <span>Portes par heure</span>
                  </div>
                  <span className="font-bold">{doorsPerHour}</span>
                </div>
              </div>

              {/* Bouton de fermeture */}
              <Button 
                onClick={onClose}
                className="w-full"
              >
                Fermer
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}