import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trophy, Clock, Play, Pause, StopCircle, ChevronDown } from 'lucide-react';
import { useGaming } from '@/lib/hooks/useGaming';
import { City } from '@/lib/types/city';
import { formatDuration } from '@/lib/utils/dateUtils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SessionSummaryPopup } from './SessionSummaryPopup';
import { useTutorial } from '@/components/tutorial/TutorialProvider';

interface GamingSessionProps {
  city: City;
}

export function GamingSession({ city }: GamingSessionProps) {
  const { activeSession, startSession, updateSession, checkAchievements } = useGaming();
  const { nextStep } = useTutorial();
  const [sessionDuration, setSessionDuration] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(true);
  const [showSummaryPopup, setShowSummaryPopup] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<{
    duration: number;
    doorsVisited: number;
    seriesCompleted: number;
    startedAt: Date;
  } | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (!activeSession) {
      setSessionDuration(0);
      return;
    }

    const calculateDuration = () => {
      const now = Date.now();
      const start = activeSession.startedAt.getTime();
      let totalPauseDuration = activeSession.totalPauseDuration * 1000;

      if (activeSession.status === 'paused' && activeSession.pauseStartedAt) {
        const currentPauseDuration = now - activeSession.pauseStartedAt.getTime();
        totalPauseDuration += currentPauseDuration;
      }

      const duration = Math.floor((now - start - totalPauseDuration) / 1000);
      return Math.max(0, duration);
    };

    if (activeSession.status === 'active') {
      timerRef.current = setInterval(() => {
        setSessionDuration(calculateDuration());
      }, 1000);

      setSessionDuration(calculateDuration());
    } else {
      setSessionDuration(calculateDuration());
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeSession]);

  const handleStartSession = async () => {
    await startSession(city.id);
    // Déclencher l'événement personnalisé pour le tutoriel
    window.dispatchEvent(new CustomEvent('session-started'));
    // Passer à l'étape suivante du tutoriel
    nextStep();
  };

  const handlePauseSession = async () => {
    if (!activeSession) return;

    const newStatus = activeSession.status === 'paused' ? 'active' : 'paused';
    await updateSession(activeSession.id, { status: newStatus });
  };

  const handleEndSession = async () => {
    if (!activeSession) return;

    // Calculer les statistiques de la session
    const duration = Math.floor(sessionDuration);
    const summary = {
      duration,
      doorsVisited: activeSession.doorsVisited,
      seriesCompleted: activeSession.seriesCompleted,
      startedAt: activeSession.startedAt
    };

    // Mettre à jour le state pour la popup
    setSessionSummary(summary);
    setShowSummaryPopup(true);

    // Terminer la session
    await updateSession(activeSession.id, { 
      status: 'completed',
      endedAt: new Date()
    });
    await checkAchievements();
  };

  const seriesProgress = activeSession ? (activeSession.currentSeriesDoors / 10) * 100 : 0;

  return (
    <>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <Card>
          <CardHeader>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center"
              >
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5" />
                  Session de jeu - {city.name}
                </CardTitle>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {!activeSession ? (
                <Button 
                  onClick={handleStartSession}
                  className="w-full session-start"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Démarrer une session
                </Button>
              ) : (
                <>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 session-timer">
                      <Clock className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Durée</p>
                        <p className="text-2xl font-bold">{formatDuration(sessionDuration)}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50 session-counters">
                      <Trophy className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Portes visitées</p>
                        <p className="text-2xl font-bold">{activeSession.doorsVisited}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-4 rounded-lg bg-muted/50">
                      <Trophy className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm font-medium">Séries complétées</p>
                        <p className="text-2xl font-bold">{activeSession.seriesCompleted}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 series-progress">
                    <div className="flex justify-between text-sm">
                      <span>Série en cours</span>
                      <span>{activeSession.currentSeriesDoors}/10 portes</span>
                    </div>
                    <Progress value={seriesProgress} className="h-2" />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handlePauseSession}
                      variant={activeSession.status === 'paused' ? 'default' : 'outline'}
                      className="flex-1"
                    >
                      {activeSession.status === 'paused' ? (
                        <>
                          <Play className="h-4 w-4 mr-2" />
                          Reprendre
                        </>
                      ) : (
                        <>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={handleEndSession}
                      variant="destructive"
                      className="flex-1"
                    >
                      <StopCircle className="h-4 w-4 mr-2" />
                      Terminer
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>
      {sessionSummary && (
        <SessionSummaryPopup
          isOpen={showSummaryPopup}
          onClose={() => setShowSummaryPopup(false)}
          session={sessionSummary}
        />
      )}
    </>
  );
}