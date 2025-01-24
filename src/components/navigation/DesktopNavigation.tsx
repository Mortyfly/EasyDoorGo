import { LayoutGrid, Map, BarChart3, List, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DesktopNavigationProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function DesktopNavigation({ activeSection, onSectionChange }: DesktopNavigationProps) {
  const navItems = [
    { id: 'home', label: 'Accueil', icon: LayoutGrid },
    { id: 'map', label: 'Carte', icon: Map },
    { id: 'stats', label: 'Stats', icon: BarChart3 },
    { id: 'list', label: 'Liste', icon: List },
    { id: 'settings', label: 'Paramètres', icon: Settings },
  ];

  return (
    <div className="hidden sm:flex gap-2 mb-4">
      {navItems.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onSectionChange(id)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg transition-colors",
            activeSection === id
              ? "bg-primary text-primary-foreground"
              : "hover:bg-muted"
          )}
          data-section={id}
        >
          <Icon className="h-5 w-5" />
          <span className="font-medium">{label}</span>
        </button>
      ))}
    </div>
  );
}