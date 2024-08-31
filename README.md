# Worth Your Time? (WYT)
## Description
**Worth Your Time?** *(WYT)* est une extension de navigateur qui transforme les prix en temps de travail équivalent. Elle vous aide à évaluer le coût réel de vos achats en termes de temps de travail, vous permettant ainsi de prendre des décisions d'achat plus éclairées.
## Fonctionnalités
- Conversion automatique des prix en temps de travail sur les pages web
- Calcul personnalisé pour des prix spécifiques
- Support multilingue (actuellement en anglais et français)
- Mode sombre et suivi du thème système
- Interface utilisateur intuitive et responsive
## Installation
**Recommandée:**
- Installez directement depuis Mozilla Addons: https://addons.mozilla.org/en-US/firefox/addon/worth-your-time/

 **Manuelle:**
- Téléchargez le code source de l'extension
- Ouvrez Firefox et accédez à about:debugging#/runtime/this-firefox
- Cliquez sur "Charger un module complémentaire temporaire"
- Sélectionnez le fichier manifest.json dans le dossier de l'extension
## Utilisation
- Cliquez sur l'icône de l'extension dans la barre d'outils du navigateur pour ouvrir le popup
- Configurez votre taux horaire et vos heures de travail par jour, par exemple 20.- de l'heure et 9h par jour
- La conversion devrait se faire automatiquement sur la page
- Pour revenir à l'affichage initial, désactivez la conversion automatique avec le switch y relatif
- Pour calculer un prix spécifique qui n'apparait pas sur la page ou dont la conversion ne se fait pas automatiquement, utilisez le calculateur personnalisé et indiquez le prix à convertir
## Configuration
Vous pouvez personnaliser les paramètres suivants :
- Taux horaire
- Heures de travail par jour
- Activation/désactivation de la conversion automatique
- Langue (anglais ou français)
- Thème (clair, sombre, ou suivre le thème du système)
## Structure du projet
<pre>
worth-your-time/
│
├── manifest.json           # Fichier de configuration de l'extension
├── popup.html              # Interface utilisateur du popup
├── popup.js                # Logique du popup
├── content.js              # Script de contenu pour la conversion sur les pages web
├── background.js           # Script d'arrière-plan
├── locales.js              # Fichier de traductions
├── styles.css              # Styles CSS
└── icons/                  # Dossier contenant les icônes de l'extension
</pre>
## Développement
### Fichiers principaux
- **manifest.json:** Définit les métadonnées de l'extension, les permissions et les scripts.
- **popup.html:** Structure HTML du popup de l'extension.
- **popup.js:** Gère la logique du popup, y compris les interactions utilisateur et la mise à jour de l'interface.
- **content.js:** Responsable de la conversion des prix sur les pages web visitées.
- **background.js:** Gère les tâches en arrière-plan et la communication entre les différents scripts.
- **locales.js:** Contient les traductions pour l'internationalisation de l'extension.
### Fonctions clés
- **Popup class dans popup.js:** Gère l'interface utilisateur du popup et les interactions.
- **remplacerPrix() dans content.js:** Convertit les prix sur les pages web.
- **formatTemps():** Formate le temps de travail calculé en jours, heures et minutes.
## Contribution
Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou à soumettre une pull request pour des améliorations ou des corrections de bugs.
## Licence
GNU GPL v3: https://www.gnu.org/licenses/gpl-3.0.en.html
## Contact
Développé par AK1: https://aek.one/contact
Site web : https://delta-gate.one
