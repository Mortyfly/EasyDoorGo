import { Button } from "@/components/ui/button";
import { Moon, Sun, LogOut } from "lucide-react";
import { useThemeContext } from "@/providers/ThemeProvider";
import { auth } from '@/lib/firebase';
import { useToast } from "@/hooks/use-toast";
import { useGaming } from '@/lib/hooks/useGaming';
import { doc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuthContext } from '@/providers/AuthProvider';

export function Navbar() {
  const { darkMode, toggleDarkMode } = useThemeContext();
  const { toast } = useToast();
  const { activeSession } = useGaming();
  const { user } = useAuthContext();

  const handleLogout = async () => {
    try {
      if (user && activeSession) {
        // Terminer la session active avant la déconnexion
        const sessionsRef = collection(db, 'users', user.uid, 'sessions');
        const activeSessionQuery = query(
          sessionsRef,
          where('status', 'in', ['active', 'paused'])
        );

        const snapshot = await getDocs(activeSessionQuery);

        if (!snapshot.empty) {
          const batch = writeBatch(db);
          snapshot.docs.forEach(doc => {
            batch.update(doc.ref, {
              status: 'completed',
              endedAt: new Date()
            });
          });

          // Exécuter le batch avant la déconnexion
          await batch.commit();
        }
      }

      // Se déconnecter
      await auth.signOut();
      
      toast({
        title: "Déconnexion réussie",
        description: "À bientôt!"
      });
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      toast({
        title: "Erreur de déconnexion",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive"
      });
    }
  };

  return (
    <nav className="fixed top-0 w-full bg-gradient-to-r from-primary to-primary/80 p-4 shadow-md z-50">
      <div className="max-w-[1400px] w-full mx-auto px-4 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <img 
            src="https://i.goopics.net/my43z4.png" 
            alt="EasyDoorGo Logo" 
            className="h-10 w-10"
          />
          <span className="logo">EasyDoorGo</span>
        </a>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={toggleDarkMode}
            className="hover:bg-secondary/80"
          >
            {darkMode ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={handleLogout}
            className="hover:bg-secondary/80"
          >
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}