import { LayoutGrid, Map, BarChart3, List, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function MobileNavigation({ activeSection, onSectionChange }: MobileNavigationProps) {
  const navItems = [
    { id: 'home', label: 'Accueil', icon: LayoutGrid },
    { id: 'map', label: 'Carte', icon: Map },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'list', label: 'Liste', icon: List },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-t z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => onSectionChange(id)}
            className={cn(
              "flex flex-col items-center justify-center flex-1 h-full px-2 gap-1 transition-colors",
              activeSection === id
                ? "text-primary"
                : "text-muted-foreground hover:text-primary"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}