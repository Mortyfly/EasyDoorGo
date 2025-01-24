export function calculateProgress(doorsVisited: number, targetDoors: number): {
  percentage: number;
  rank: string;
  milestone?: {
    name: string;
    description: string;
    badge: string;
  };
} {
  const percentage = Math.min(100, (doorsVisited / targetDoors) * 100);
  
  // Déterminer le rang en fonction du pourcentage
  let rank = 'Début du parcours';
  
  if (percentage >= 100) rank = 'Maître des Portes';
  else if (percentage >= 90) rank = 'Légende de la poignée';
  else if (percentage >= 80) rank = 'Champion local';
  else if (percentage >= 70) rank = 'Stratège urbain';
  else if (percentage >= 60) rank = 'Conquérant des rues';
  else if (percentage >= 50) rank = 'Maître du quartier';
  else if (percentage >= 40) rank = 'Heurtoir aguerri';
  else if (percentage >= 30) rank = 'Collecteur d\'adresses';
  else if (percentage >= 20) rank = 'Explorateur de rue';
  else if (percentage >= 10) rank = 'Marcheur novice';
  else if (percentage >= 5) rank = 'Curieux';

  // Vérifier les jalons
  let milestone;
  if (percentage >= 100 && doorsVisited === targetDoors) {
    milestone = {
      name: 'Objectif atteint !',
      description: `Vous avez visité toutes les ${targetDoors} portes !`,
      badge: '🏆'
    };
  } else if (percentage >= 75 && doorsVisited === Math.floor(targetDoors * 0.75)) {
    milestone = {
      name: 'Dernier quart',
      description: 'Plus que 25% des portes à visiter !',
      badge: '🎯'
    };
  } else if (percentage >= 50 && doorsVisited === Math.floor(targetDoors * 0.5)) {
    milestone = {
      name: 'Mi-parcours',
      description: 'Vous êtes à la moitié de votre objectif !',
      badge: '⭐'
    };
  } else if (percentage >= 25 && doorsVisited === Math.floor(targetDoors * 0.25)) {
    milestone = {
      name: 'Premier quart',
      description: 'Déjà 25% des portes visitées !',
      badge: '🌟'
    };
  } else if (percentage >= 10 && doorsVisited === Math.floor(targetDoors * 0.1)) {
    milestone = {
      name: 'Bon début',
      description: '10% des portes visitées !',
      badge: '✨'
    };
  } else if (percentage >= 5 && doorsVisited === Math.floor(targetDoors * 0.05)) {
    milestone = {
      name: 'Premiers pas',
      description: '5% des portes visitées !',
      badge: '🎉'
    };
  }

  return { percentage, rank, milestone };
}

export function calculateSessionXp(
  doorsVisited: number,
  seriesCompleted: number
): number {
  // XP de base pour les portes visitées (5 XP par porte)
  const doorsXp = doorsVisited * 5;
  
  // XP bonus pour les séries complétées (25 XP par série)
  const seriesXp = seriesCompleted * 25;
  
  return doorsXp + seriesXp;
}