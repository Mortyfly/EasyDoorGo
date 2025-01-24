import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, Edit2, Clock, Calendar, ChevronDown } from 'lucide-react';
import { useAuthContext } from '@/providers/AuthProvider';
import { City } from '@/lib/types/city';
import { calculateProgress } from '@/lib/utils/gamingUtils';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cityService } from '@/lib/firebase/services/cityService';
import { useToast } from '@/hooks/use-toast';
import { collection, query, where, getDocs, Timestamp, onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { formatDuration, formatDate } from '@/lib/utils/dateUtils';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { motion, AnimatePresence } from "framer-motion";

interface GamingOverviewProps {
  currentCity: City | null;
  totalDoorsVisited: number;
}

interface SessionHistory {
  id: string;
  startedAt: Date;
  endedAt: Date;
  doorsVisited: number;
  seriesCompleted: number;
  duration: number;
}

export function GamingOverview({ currentCity, totalDoorsVisited }: GamingOverviewProps) {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [newTarget, setNewTarget] = useState('1000');
  const [sessionHistory, setSessionHistory] = useState<SessionHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<{
    percentage: number;
    rank: string;
    milestone?: {
      name: string;
      description: string;
      badge: string;
    };
  }>({ percentage: 0, rank: 'Début du parcours' });
  const [isProgressOpen, setIsProgressOpen] = useState(true);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [cityData, setCityData] = useState<City | null>(null);

  const loadSessionHistory = useCallback(async () => {
    if (!user || !currentCity) return;

    try {
      setLoading(true);
      const sessionsRef = collection(db, 'users', user.uid, 'sessions');
      
      const q = query(
        sessionsRef,
        where('cityId', '==', currentCity.id),
        where('status', '==', 'completed')
      );
      
      const snapshot = await getDocs(q);
      const history = snapshot.docs
        .map(doc => {
          const data = doc.data();
          
          const getDate = (timestamp: any): Date => {
            if (timestamp instanceof Timestamp) {
              return timestamp.toDate();
            }
            if (timestamp && timestamp.seconds) {
              return new Date(timestamp.seconds * 1000);
            }
            return new Date(timestamp || Date.now());
          };

          const startedAt = getDate(data.startedAt);
          const endedAt = getDate(data.endedAt);
          const duration = Math.max(0, 
            Math.floor((endedAt.getTime() - startedAt.getTime()) / 1000) - 
            (data.totalPauseDuration || 0)
          );
          
          return {
            id: doc.id,
            startedAt,
            endedAt,
            doorsVisited: data.doorsVisited || 0,
            seriesCompleted: data.seriesCompleted || 0,
            duration
          };
        })
        .sort((a, b) => b.endedAt.getTime() - a.endedAt.getTime())
        .slice(0, 10);
      
      setSessionHistory(history);
    } catch (error) {
      console.error('Erreur lors du chargement de l\'historique:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger l'historique des sessions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [user, currentCity, toast]);

  useEffect(() => {
    if (!user || !currentCity) return;

    const sessionsRef = collection(db, 'users', user.uid, 'sessions');
    const unsubscribe = onSnapshot(
      query(sessionsRef, where('cityId', '==', currentCity.id)),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'modified') {
            const data = change.doc.data();
            if (data.status === 'completed') {
              loadSessionHistory();
            }
          }
        });
      }
    );

    return () => unsubscribe();
  }, [user, currentCity, loadSessionHistory]);

  useEffect(() => {
    loadSessionHistory();
  }, [loadSessionHistory]);

  useEffect(() => {
    if (!user || !currentCity) return;

    const cityRef = doc(db, 'users', user.uid, 'cities', currentCity.id);
    const unsubscribe = onSnapshot(cityRef, (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCityData({
          ...currentCity,
          ...data,
          targetDoors: data.targetDoors || 1000,
          createdAt: data.createdAt?.toDate() || new Date()
        });
      }
    });

    return () => unsubscribe();
  }, [user, currentCity]);

  useEffect(() => {
    if (cityData) {
      const newProgress = calculateProgress(totalDoorsVisited, cityData.targetDoors || 1000);
      setProgress(newProgress);
      setNewTarget(cityData.targetDoors?.toString() || '1000');

      if (newProgress.milestone && 
          (!progress.milestone || 
           progress.milestone.name !== newProgress.milestone.name)) {
        window.dispatchEvent(new CustomEvent('achievementUnlocked', {
          detail: {
            name: newProgress.milestone.name,
            description: newProgress.milestone.description,
            badge: newProgress.milestone.badge
          }
        }));
      }
    }
  }, [cityData, totalDoorsVisited]);

  const handleUpdateTarget = async () => {
    if (!user || !currentCity) return;

    const targetNumber = parseInt(newTarget, 10);
    if (isNaN(targetNumber) || targetNumber < 1) {
      toast({
        title: "Erreur",
        description: "L'objectif doit être un nombre positif",
        variant: "destructive"
      });
      return;
    }

    try {
      await cityService.updateCity(user.uid, currentCity.id, {
        ...currentCity,
        targetDoors: targetNumber
      });
      
      setIsEditingTarget(false);
      toast({
        title: "Objectif mis à jour",
        description: `Nouvel objectif : ${targetNumber} portes`
      });
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'objectif:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour l'objectif",
        variant: "destructive"
      });
    }
  };

  if (!currentCity) return null;

  return (
    <div className="space-y-6">
      <Collapsible open={isProgressOpen} onOpenChange={setIsProgressOpen}>
        <Card className="progress-overview">
          <CardHeader>
            <CollapsibleTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex justify-between items-center"
              >
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Progression - {currentCity?.name}
                </CardTitle>
                <ChevronDown
                  className={`h-5 w-5 transition-transform ${isProgressOpen ? 'rotate-180' : ''}`}
                />
              </Button>
            </CollapsibleTrigger>
          </CardHeader>
          <CollapsibleContent>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                    <span className="text-xl sm:text-2xl font-bold">{progress.rank}</span>
                    <span className="text-xl sm:text-2xl font-bold text-primary">
                      {Math.round(progress.percentage)}%
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setIsEditingTarget(true)}
                    className="flex items-center gap-2 w-full sm:w-auto justify-center"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span>Objectif : {cityData?.targetDoors || 1000}</span>
                  </Button>
                </div>
                <Progress 
                  value={progress.percentage}
                  className="h-2" 
                />
                <div className="flex flex-col sm:flex-row justify-between text-sm text-muted-foreground gap-1">
                  <span>{totalDoorsVisited} portes visitées</span>
                  <span>{totalDoorsVisited} / {cityData?.targetDoors || 1000} portes</span>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {sessionHistory.length > 0 && (
        <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
          <Card>
            <CardHeader>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full flex justify-between items-center"
                >
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Historique des sessions
                  </CardTitle>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${isHistoryOpen ? 'rotate-180' : ''}`}
                  />
                </Button>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent>
                <AnimatePresence>
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-4"
                    >
                      {sessionHistory.map(session => (
                        <motion.div
                          key={session.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          className="flex items-center justify-between p-4 rounded-lg bg-muted/50"
                        >
                          <div className="space-y-1">
                            <p className="font-medium">{formatDate(session.startedAt)}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {formatDuration(session.duration)}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target className="h-4 w-4" />
                                {session.doorsVisited} portes
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{session.seriesCompleted} séries</p>
                            <p className="text-sm text-muted-foreground">
                              {session.duration > 0 ? Math.round(session.doorsVisited / (session.duration / 3600)) : 0} portes/heure
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      )}

      <Dialog open={isEditingTarget} onOpenChange={setIsEditingTarget}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'objectif</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-2">
              <Label htmlFor="target">Nombre de portes à visiter</Label>
              <Input
                id="target"
                type="number"
                min="1"
                value={newTarget}
                onChange={(e) => setNewTarget(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditingTarget(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateTarget}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}