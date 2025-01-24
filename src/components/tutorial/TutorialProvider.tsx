import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { TutorialOverlay } from './TutorialOverlay';
import { useAuthContext } from '@/providers/AuthProvider';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  element?: string;
  position: 'top' | 'bottom' | 'left' | 'right' | 'center';
  waitForAction?: boolean;
  nextOnClick?: boolean;
}

interface TutorialContextType {
  currentStep: TutorialStep | null;
  nextStep: () => void;
  skipTutorial: () => void;
  restartTutorial: () => void;
  waitForAction: boolean;
}

const TutorialContext = createContext<TutorialContextType | null>(null);

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'welcome',
    title: 'Bienvenue sur EasyDoor',
    content: 'Je vais vous guider dans la prise en main de l\'application.',
    position: 'center'
  },
  {
    id: 'geolocation-disclaimer',
    title: 'Note importante',
    content: 'L\'application propose une fonction de géolocalisation pour faciliter la saisie des adresses. Cette fonctionnalité dépend de votre appareil et des conditions de réception GPS. Vérifiez toujours les informations suggérées avant de les valider.',
    position: 'center'
  },
  {
    id: 'city-selection',
    title: 'Sélection d\'une commune',
    content: 'Si vous avez déjà ajouté des communes, vous pouvez en sélectionner une ici. Sinon, passons à l\'ajout d\'une nouvelle commune.',
    element: '.city-selector',
    position: 'bottom'
  },
  {
    id: 'city-add',
    title: 'Ajouter une commune',
    content: 'Ajoutez une nouvelle commune en remplissant les champs. Vous pouvez utiliser le bouton de géolocalisation pour remplir automatiquement les champs.',
    element: '.city-add',
    position: 'bottom',
    waitForAction: true
  },
  {
    id: 'progress-overview',
    title: 'Vue d\'ensemble',
    content: 'Cette section affiche votre progression dans la ville. Vous pouvez définir un objectif de portes à visiter et suivre votre avancement.',
    element: '.progress-overview',
    position: 'bottom'
  },
  {
    id: 'start-session',
    title: 'Démarrer une session',
    content: 'Pour commencer à ajouter des adresses, vous devez d\'abord démarrer une session de prospection. Cliquez sur le bouton "Démarrer une session".',
    element: '.session-start',
    position: 'bottom',
    waitForAction: true
  },
  {
    id: 'session-timer',
    title: 'Durée de la session',
    content: 'Le chronomètre indique la durée de votre session en cours. Il se met en pause automatiquement si vous quittez l\'application.',
    element: '.session-timer',
    position: 'bottom'
  },
  {
    id: 'session-counters',
    title: 'Compteurs',
    content: 'Suivez votre progression avec le nombre de portes visitées et de séries complétées. Une série est un ensemble de 10 portes.',
    element: '.session-counters',
    position: 'bottom'
  },
  {
    id: 'series-progress',
    title: 'Progression de la série',
    content: 'Cette barre indique votre progression dans la série en cours. Chaque série de 10 portes complétée vous rapporte des points bonus !',
    element: '.series-progress',
    position: 'bottom'
  },
  {
    id: 'add-street',
    title: 'Ajouter une rue',
    content: 'Maintenant, ajoutez une rue dans laquelle vous allez prospecter. Vous pouvez utiliser le bouton de géolocalisation pour remplir automatiquement le nom de la rue.',
    element: '.street-selector',
    position: 'top',
    waitForAction: true
  },
  {
    id: 'add-address',
    title: 'Ajouter une adresse',
    content: 'Ajoutez votre première adresse. Vous pouvez utiliser le bouton de géolocalisation pour remplir automatiquement le numéro.',
    element: '.address-form',
    position: 'top',
    waitForAction: true
  },
  {
    id: 'tutorial-end',
    title: 'C\'est parti !',
    content: 'Vous êtes maintenant prêt à utiliser l\'application. Bonne prospection !',
    position: 'center'
  }
];

export function TutorialProvider({ children }: { children: ReactNode }) {
  const { user } = useAuthContext();
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isTutorialActive, setIsTutorialActive] = useState(false);
  const [waitForAction, setWaitForAction] = useState(false);

  useEffect(() => {
    const checkFirstLogin = async () => {
      if (!user) return;

      try {
        const tutorialRef = doc(db, 'users', user.uid, 'settings', 'tutorial');
        const tutorialDoc = await getDoc(tutorialRef);

        if (!tutorialDoc.exists()) {
          setIsTutorialActive(true);
          await setDoc(tutorialRef, {
            completed: false,
            completedAt: null
          });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification du tutoriel:', error);
      }
    };

    checkFirstLogin();
  }, [user]);

  useEffect(() => {
    if (!isTutorialActive) return;

    const currentStep = TUTORIAL_STEPS[currentStepIndex];
    if (currentStep) {
      setWaitForAction(!!currentStep.waitForAction);
    }
  }, [currentStepIndex, isTutorialActive]);

  const nextStep = () => {
    if (currentStepIndex < TUTORIAL_STEPS.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      completeTutorial();
    }
  };

  const skipTutorial = () => {
    completeTutorial();
  };

  const completeTutorial = async () => {
    setIsTutorialActive(false);
    if (user) {
      try {
        const tutorialRef = doc(db, 'users', user.uid, 'settings', 'tutorial');
        await setDoc(tutorialRef, {
          completed: true,
          completedAt: new Date()
        });
      } catch (error) {
        console.error('Erreur lors de la sauvegarde du tutoriel:', error);
      }
    }
  };

  const restartTutorial = () => {
    setCurrentStepIndex(0);
    setIsTutorialActive(true);
  };

  const value = {
    currentStep: isTutorialActive ? TUTORIAL_STEPS[currentStepIndex] : null,
    nextStep,
    skipTutorial,
    restartTutorial,
    waitForAction
  };

  return (
    <TutorialContext.Provider value={value}>
      {children}
      {isTutorialActive && TUTORIAL_STEPS[currentStepIndex] && (
        <TutorialOverlay step={TUTORIAL_STEPS[currentStepIndex]} />
      )}
    </TutorialContext.Provider>
  );
}

export function useTutorial() {
  const context = useContext(TutorialContext);
  if (!context) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
}