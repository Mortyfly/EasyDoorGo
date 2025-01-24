import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useTutorial } from './TutorialProvider';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  element?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  waitForAction?: boolean;
  nextOnClick?: boolean;
}

interface TutorialOverlayProps {
  step: TutorialStep;
}

export function TutorialOverlay({ step }: TutorialOverlayProps) {
  const { nextStep, skipTutorial, waitForAction } = useTutorial();
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [elementRect, setElementRect] = useState<DOMRect | null>(null);

  useEffect(() => {
    if (!step || !step.element) {
      // Pour les étapes centrées
      setPosition({
        top: window.innerHeight / 2 - 100,
        left: window.innerWidth / 2 - 150
      });
      return;
    }

    const positionTooltip = () => {
      const element = document.querySelector(step.element!);
      if (!element) return;

      const rect = element.getBoundingClientRect();
      setElementRect(rect);

      const tooltipWidth = 300;
      const tooltipHeight = 200;
      const margin = 20;
      const windowWidth = window.innerWidth;
      const windowHeight = window.innerHeight;

      let top = 0;
      let left = 0;

      if (step.position === 'center') {
        top = windowHeight / 2 - tooltipHeight / 2;
        left = windowWidth / 2 - tooltipWidth / 2;
      } else {
        switch (step.position) {
          case 'top':
            top = rect.top - tooltipHeight - margin;
            left = rect.left + (rect.width - tooltipWidth) / 2;
            break;
          case 'bottom':
            top = rect.bottom + margin;
            left = rect.left + (rect.width - tooltipWidth) / 2;
            break;
          case 'left':
            top = rect.top + (rect.height - tooltipHeight) / 2;
            left = rect.left - tooltipWidth - margin;
            break;
          case 'right':
            top = rect.top + (rect.height - tooltipHeight) / 2;
            left = rect.right + margin;
            break;
        }
      }

      // Ajuster la position pour éviter les débordements
      left = Math.max(margin, Math.min(left, windowWidth - tooltipWidth - margin));
      top = Math.max(margin, Math.min(top, windowHeight - tooltipHeight - margin));

      setPosition({ top, left });
    };

    positionTooltip();
    window.addEventListener('resize', positionTooltip);
    window.addEventListener('scroll', positionTooltip);

    return () => {
      window.removeEventListener('resize', positionTooltip);
      window.removeEventListener('scroll', positionTooltip);
    };
  }, [step]);

  if (!step) return null;

  return (
    <div className="fixed inset-0" style={{ zIndex: 1000, pointerEvents: 'none' }}>
      {/* Overlay sombre */}
      {step.element ? (
        <>
          {/* Overlay supérieur */}
          <div 
            className="absolute bg-black/50"
            style={{
              top: 0,
              left: 0,
              right: 0,
              height: elementRect ? elementRect.top - 4 : '100%',
              pointerEvents: step.waitForAction ? 'none' : 'auto'
            }}
          />

          {/* Overlay gauche */}
          {elementRect && (
            <div 
              className="absolute bg-black/50"
              style={{
                top: elementRect.top - 4,
                left: 0,
                width: elementRect.left - 4,
                height: elementRect.height + 8,
                pointerEvents: step.waitForAction ? 'none' : 'auto'
              }}
            />
          )}

          {/* Overlay droit */}
          {elementRect && (
            <div 
              className="absolute bg-black/50"
              style={{
                top: elementRect.top - 4,
                left: elementRect.right + 4,
                right: 0,
                height: elementRect.height + 8,
                pointerEvents: step.waitForAction ? 'none' : 'auto'
              }}
            />
          )}

          {/* Overlay inférieur */}
          {elementRect && (
            <div 
              className="absolute bg-black/50"
              style={{
                top: elementRect.bottom + 4,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: step.waitForAction ? 'none' : 'auto'
              }}
            />
          )}

          {/* Zone de mise en évidence */}
          <div
            className="absolute border-2 border-primary animate-pulse"
            style={{
              top: elementRect?.top ?? 0 - 4,
              left: elementRect?.left ?? 0 - 4,
              width: (elementRect?.width ?? 0) + 8,
              height: (elementRect?.height ?? 0) + 8,
              borderRadius: '8px',
              pointerEvents: 'none',
              zIndex: 1001
            }}
          />
        </>
      ) : (
        // Overlay complet pour les étapes centrées
        <div 
          className="absolute inset-0 bg-black/50"
          style={{ pointerEvents: 'auto' }}
        />
      )}

      {/* Tooltip */}
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className={`absolute bg-card border shadow-xl p-6 w-[300px] rounded-lg ${
            step.position === 'center' ? 'text-center' : ''
          }`}
          style={{
            top: position.top,
            left: position.left,
            pointerEvents: 'auto',
            zIndex: 1002
          }}
        >
          <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground mb-4">{step.content}</p>
          
          <div className={`flex ${step.position === 'center' ? 'justify-center' : 'justify-between'} gap-4`}>
            <Button variant="ghost" size="sm" onClick={skipTutorial}>
              Passer
            </Button>
            {(!waitForAction || step.nextOnClick) && (
              <Button size="sm" onClick={nextStep}>
                {step.id === 'tutorial-end' ? 'Terminer' : 'Suivant'}
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}