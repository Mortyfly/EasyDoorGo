import { HelpButton } from './HelpButton';

export function StatsHelp() {
  return (
    <HelpButton
      title="Analyse des statistiques"
      description="Comprenez la répartition et l'évolution de vos visites"
      content={
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-2">Graphique des statuts</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Le graphique montre la répartition des différents statuts</li>
              <li>Chaque couleur correspond à un statut spécifique</li>
              <li>Passez la souris sur une section pour voir les détails</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Filtres</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Filtrez par rue pour voir les statistiques spécifiques</li>
              <li>Le graphique se met à jour automatiquement</li>
              <li>Utilisez "Toutes les rues" pour une vue d'ensemble</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Interprétation</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Plus la section est grande, plus ce statut est fréquent</li>
              <li>Les pourcentages vous aident à identifier les tendances</li>
              <li>Utilisez ces données pour optimiser votre prospection</li>
            </ul>
          </section>
        </div>
      }
    />
  );
}