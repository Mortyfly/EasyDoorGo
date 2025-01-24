// Point d'entrée de l'application
document.addEventListener('DOMContentLoaded', () => {
  // Initialisation des gestionnaires
  const auth = new Auth();
  const map = new MapManager();
  const data = new DataManager();

  // Configuration du mode sombre
  const toggleModeBtn = document.getElementById('toggleModeBtn');
  toggleModeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    toggleModeBtn.innerHTML = document.body.classList.contains('dark-mode') 
      ? '<i class="fas fa-sun"></i>' 
      : '<i class="fas fa-moon"></i>';
  });

  // ... autres initialisations ...
});