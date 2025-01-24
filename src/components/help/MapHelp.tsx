import { HelpButton } from './HelpButton';

export function MapHelp() {
  return (
    <HelpButton
      title="Utilisation de la carte"
      description="Visualisez et gérez vos adresses sur la carte interactive"
      content={
        <div className="space-y-4">
          <section>
            <h3 className="text-lg font-semibold mb-2">Visualisation des adresses</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Chaque marqueur sur la carte représente une adresse visitée</li>
              <li>La couleur du marqueur correspond au statut de l'adresse</li>
              <li>Cliquez sur un marqueur pour voir les détails de l'adresse</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Navigation</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utilisez la molette de la souris pour zoomer/dézoomer</li>
              <li>Cliquez et maintenez pour déplacer la carte</li>
              <li>Double-cliquez pour zoomer sur un point précis</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold mb-2">Astuces</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Les contrôles de zoom sont disponibles en haut à droite</li>
              <li>La carte se centre automatiquement sur votre commune</li>
              <li>Les marqueurs sont regroupés automatiquement quand vous dézoomez</li>
            </ul>
          </section>
        </div>
      }
    />
  );
}