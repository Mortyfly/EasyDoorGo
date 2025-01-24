import { useEffect, useState } from 'react';
import { useAuthContext } from '@/providers/AuthProvider';
import { useThemeContext } from '@/providers/ThemeProvider';
import { useGamingInit } from '@/lib/hooks/useGamingInit';
import { Navbar } from './Navbar';
import { AuthSection } from './AuthSection';
import { MainContent } from './MainContent';
import { Footer } from './Footer';
import { LoadingSpinner } from './LoadingSpinner';
import { AchievementPopup } from './notifications/AchievementPopup';
import { LevelUpPopup } from './notifications/LevelUpPopup';

interface AchievementEvent {
  name: string;
  description: string;
  badge?: string;
  xpReward: number;
}

interface LevelUpEvent {
  level: number;
  rank: string;
  oldRank: string;
}

declare global {
  interface WindowEventMap {
    'achievementUnlocked': CustomEvent<AchievementEvent>;
    'levelUp': CustomEvent<LevelUpEvent>;
  }
}

export function AppContent() {
  const { user, loading: authLoading } = useAuthContext();
  const { loading: gamingLoading } = useGamingInit();
  const { darkMode } = useThemeContext();
  
  const [achievementPopup, setAchievementPopup] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    badge?: string;
    xpGained?: number;
  }>({
    isOpen: false,
    title: '',
    description: '',
  });

  const [levelUpPopup, setLevelUpPopup] = useState<{
    isOpen: boolean;
    level: number;
    oldRank: string;
    newRank: string;
  }>({
    isOpen: false,
    level: 1,
    oldRank: '',
    newRank: ''
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  useEffect(() => {
    const handleAchievement = (event: CustomEvent<AchievementEvent>) => {
      setAchievementPopup({
        isOpen: true,
        title: event.detail.name,
        description: event.detail.description,
        badge: event.detail.badge,
        xpGained: event.detail.xpReward
      });
    };

    const handleLevelUp = (event: CustomEvent<LevelUpEvent>) => {
      setLevelUpPopup({
        isOpen: true,
        level: event.detail.level,
        oldRank: event.detail.oldRank,
        newRank: event.detail.rank
      });
    };

    window.addEventListener('achievementUnlocked', handleAchievement);
    window.addEventListener('levelUp', handleLevelUp);

    return () => {
      window.removeEventListener('achievementUnlocked', handleAchievement);
      window.removeEventListener('levelUp', handleLevelUp);
    };
  }, []);

  if (authLoading || gamingLoading) return <LoadingSpinner />;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1">
        {!user ? <AuthSection /> : (
          <div className="container mx-auto px-4 py-20">
            <MainContent user={user} />
          </div>
        )}
      </main>
      <Footer />
      
      <AchievementPopup
        isOpen={achievementPopup.isOpen}
        onClose={() => setAchievementPopup(prev => ({ ...prev, isOpen: false }))}
        title={achievementPopup.title}
        description={achievementPopup.description}
        badge={achievementPopup.badge}
        xpGained={achievementPopup.xpGained}
      />
      
      <LevelUpPopup
        isOpen={levelUpPopup.isOpen}
        onClose={() => setLevelUpPopup(prev => ({ ...prev, isOpen: false }))}
        level={levelUpPopup.level}
        oldRank={levelUpPopup.oldRank}
        newRank={levelUpPopup.newRank}
      />
    </div>
  );
}