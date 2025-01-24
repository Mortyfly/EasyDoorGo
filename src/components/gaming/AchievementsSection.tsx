import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { ChevronDown, Trophy, Lock } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { Achievement } from '@/lib/types/gaming';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/providers/AuthProvider';
import { LoadingSpinner } from '../LoadingSpinner';
import { achievementService } from '@/lib/firebase/services/achievementService';

interface AchievementWithProgress extends Achievement {
  unlocked: boolean;
  progress: number;
  maxProgress: number;
}

export function AchievementsSection() {
  const { user } = useAuthContext();
  const [isExpanded, setIsExpanded] = useState(false);
  const [achievements, setAchievements] = useState<AchievementWithProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const loadAchievements = async () => {
      try {
        setLoading(true);
        
        // Charger tous les succès disponibles
        const allAchievements = await achievementService.getAchievements();

        // Charger les succès débloqués par l'utilisateur
        const userAchievementsRef = collection(db, 'users', user.uid, 'achievements');
        const userAchievementsSnap = await getDocs(userAchievementsRef);
        const unlockedAchievements = new Set(
          userAchievementsSnap.docs.map(doc => doc.data().achievementId)
        );

        // Charger la session active pour la progression
        const sessionsRef = collection(db, 'users', user.uid, 'sessions');
        const activeSessionQuery = query(
          sessionsRef,
          where('status', 'in', ['active', 'paused'])
        );
        const activeSessionSnap = await getDocs(activeSessionQuery);
        const sessionData = activeSessionSnap.empty ? null : activeSessionSnap.docs[0].data();

        // Calculer la progression pour chaque succès
        const achievementsWithProgress = allAchievements.map(achievement => {
          const unlocked = unlockedAchievements.has(achievement.id);
          let progress = 0;
          let maxProgress = 0;

          if (!unlocked && sessionData) {
            const conditions = achievement.conditions;
            if (conditions.doorsVisited) {
              progress = Math.min(sessionData.doorsVisited || 0, conditions.doorsVisited);
              maxProgress = conditions.doorsVisited;
            }
            else if (conditions.seriesCompleted) {
              progress = Math.min(sessionData.seriesCompleted || 0, conditions.seriesCompleted);
              maxProgress = conditions.seriesCompleted;
            }
            else if (conditions.consecutiveSeries) {
              progress = Math.min(sessionData.consecutiveSeries || 0, conditions.consecutiveSeries);
              maxProgress = conditions.consecutiveSeries;
            }
            else if (conditions.seriesWithoutPause) {
              progress = Math.min(sessionData.seriesWithoutPause || 0, conditions.seriesWithoutPause);
              maxProgress = conditions.seriesWithoutPause;
            }
            else if (conditions.uniqueStreets) {
              progress = Math.min(sessionData.uniqueStreets?.length || 0, conditions.uniqueStreets);
              maxProgress = conditions.uniqueStreets;
            }
          }

          return {
            ...achievement,
            unlocked,
            progress,
            maxProgress
          };
        });

        // Trier les succès : débloqués en dernier
        achievementsWithProgress.sort((a, b) => {
          if (a.unlocked === b.unlocked) {
            return a.category.localeCompare(b.category);
          }
          return a.unlocked ? 1 : -1;
        });

        setAchievements(achievementsWithProgress);
      } catch (error) {
        console.error('Erreur lors du chargement des succès:', error);
      } finally {
        setLoading(false);
      }
    };

    loadAchievements();
  }, [user]);

  if (loading) return <LoadingSpinner />;

  return (
    <Card>
      <CardHeader>
        <Button
          variant="ghost"
          className="w-full flex justify-between items-center"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5" />
            Succès ({achievements.filter(a => a.unlocked).length}/{achievements.length})
          </CardTitle>
          <ChevronDown
            className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          />
        </Button>
      </CardHeader>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <CardContent className="space-y-4">
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`p-4 rounded-lg ${
                    achievement.unlocked
                      ? 'bg-primary/10 border border-primary/20'
                      : 'bg-muted/50 border border-muted'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        {achievement.badge && (
                          <span className="text-xl">{achievement.badge}</span>
                        )}
                        {!achievement.badge && (
                          achievement.unlocked ? (
                            <Trophy className="h-5 w-5 text-primary" />
                          ) : (
                            <Lock className="h-5 w-5 text-muted-foreground" />
                          )
                        )}
                        <h3 className={`font-semibold ${
                          achievement.unlocked ? 'text-primary' : ''
                        }`}>
                          {achievement.name}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {achievement.description}
                      </p>
                      {achievement.xpReward && (
                        <p className="text-sm font-medium text-yellow-500">
                          +{achievement.xpReward} XP
                        </p>
                      )}
                    </div>
                    {!achievement.unlocked && achievement.maxProgress > 0 && (
                      <div className="w-32 space-y-1">
                        <Progress 
                          value={(achievement.progress / achievement.maxProgress) * 100} 
                          className="h-2" 
                        />
                        <p className="text-xs text-center text-muted-foreground">
                          {achievement.progress}/{achievement.maxProgress}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}