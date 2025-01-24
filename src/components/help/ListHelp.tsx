import { HelpButton } from './HelpButton';

export function ListHelp() {
  return (
    <HelpButton
      title="Gestion des adresses"
      description="Recherchez, filtrez et modifiez vos adresses facilement"
      content={
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-2">Filtres et recherche</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utilisez la barre de recherche pour trouver une adresse spécifique</li>
              <li>Filtrez par rue ou par statut pour affiner la liste</li>
              <li>Triez les colonnes en cliquant sur leur en-tête</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Actions disponibles</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Modifiez une adresse en cliquant sur l'icône de crayon</li>
              <li>Supprimez une adresse avec l'icône de corbeille</li>
              <li>Consultez les informations additionnelles avec l'icône d'info</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Astuces</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>La liste se met à jour automatiquement</li>
              <li>Les modifications sont sauvegardées instantanément</li>
              <li>Utilisez les filtres combinés pour une recherche précise</li>
            </ul>
          </section>
        </div>
      }
    />
  );
}