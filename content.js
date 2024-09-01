import { logDebug, setDebugMode, formatTemps, validateNumber } from './utils.js';

logDebug("Script de contenu chargé");

let prixOriginaux = new Map();
let conversionActive = true;
let tauxHoraire, heuresParJour;
let debugMode = false;

/**
 * Initialise l'extension en chargeant les options et en configurant les écouteurs d'événements
 */
function initialiserExtension() {
    logDebug("Initialisation de l'extension");
    browser.storage.sync.get(['tauxHoraire', 'heuresParJour', 'conversionActive', 'debugMode']).then(data => {
        logDebug("Données récupérées", data);
        conversionActive = data.conversionActive !== undefined ? data.conversionActive : true;
        tauxHoraire = data.tauxHoraire || 20;
        heuresParJour = data.heuresParJour || 8.5;
        debugMode = data.debugMode || false;
        setDebugMode(debugMode);
        mettreAJourPrixConvertis();
    }).catch(error => {
        console.error("Erreur lors de la récupération des paramètres :", error);
    });
}

/**
 * Met à jour les prix convertis sur la page
 */
function mettreAJourPrixConvertis() {
    logDebug("Mise à jour des prix convertis");
    restaurerPrixOriginaux();
    if (conversionActive) {
        remplacerPrix();
    }
}

/**
 * Remplace les prix par leur équivalent en temps de travail
 */
function remplacerPrix() {
    logDebug("Remplacement des prix");
    
    // Expression régulière pour détecter les prix
    const regex = /(?<!\d)(?:([₿₽₺₩₴₦₱₭₫៛₪₨]|[A-Z]{3}|\$|€|£|¥)\s*)?(\d{1,3}(?:[ '\u00A0]\d{3})*(?:[.,]\d{1,2})?)\s*(?:([₿₽₺₩₴₦₱₭₫៛₪₨]|[A-Z]{3}|\$|€|£|¥)|\.–|\.-)?(?!\d)/g;

    function convertirPrix(match, deviseBefore, prix, deviseAfter) {
        if (!prix) {
            logDebug("Prix non trouvé dans le match:", match);
            return match;
        }
        const devise = deviseBefore || deviseAfter;
        // Vérifier si le match est vraiment un prix
        if (!devise && !match.includes('.–') && !match.includes('.-')) {
            return match; // Ce n'est probablement pas un prix, on ne le convertit pas
        }
        const prixNumerique = parseFloat(prix.replace(/[' \u00A0]/g, '').replace(',', '.'));
        const tempsEnHeures = prixNumerique / tauxHoraire;
        const tempsFormate = formatTemps(tempsEnHeures, heuresParJour);
        return `${tempsFormate} (${match})`;
    }

    function remplacerPrixDansElement(element) {
        if (element.childNodes.length === 0) {
            if (element.textContent && regex.test(element.textContent)) {
                const texteOriginal = element.textContent;
                const nouveauTexte = texteOriginal.replace(regex, convertirPrix);
                if (texteOriginal !== nouveauTexte) {
                    const newElement = document.createElement('span');
                    newElement.textContent = nouveauTexte;
                    element.parentNode.replaceChild(newElement, element);
                }
            }
        } else {
            Array.from(element.childNodes).forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    if (regex.test(child.textContent)) {
                        const nouveauTexte = child.textContent.replace(regex, convertirPrix);
                        if (child.textContent !== nouveauTexte) {
                            const span = document.createElement('span');
                            span.textContent = nouveauTexte;
                            child.parentNode.replaceChild(span, child);
                        }
                    }
                } else if (child.nodeType === Node.ELEMENT_NODE) {
                    remplacerPrixDansElement(child);
                }
            });
        }
    }

    remplacerPrixDansElement(document.body);
}

/**
 * Restaure les prix originaux sur la page
 */
function restaurerPrixOriginaux() {
    logDebug("Restauration des prix originaux");
    document.querySelectorAll('[data-prix-id]').forEach(element => {
        const id = element.getAttribute('data-prix-id');
        const prixOriginal = prixOriginaux.get(id);
        if (prixOriginal) {
            const tempDiv = document.createElement('div');
            tempDiv.textContent = prixOriginal;
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
            while (tempDiv.firstChild) {
                element.appendChild(tempDiv.firstChild);
            }
            element.removeAttribute('data-prix-id');
        }
    });
    prixOriginaux.clear();
}

// Initialiser l'extension 
initialiserExtension();

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    logDebug("Message reçu", message);
    if (message.action === "appliquerChangements") {
        browser.storage.sync.get(['tauxHoraire', 'heuresParJour', 'conversionActive', 'debugMode']).then(data => {
            logDebug("Nouvelles données reçues", data);
            conversionActive = data.conversionActive;
            tauxHoraire = data.tauxHoraire;
            heuresParJour = data.heuresParJour;
            debugMode = data.debugMode;
            setDebugMode(debugMode);
            mettreAJourPrixConvertis();
        });
    }
});


/**
 * Met à jour toutes les conversions de prix sur la page
 * @param {boolean} conversionActive - Indique si la conversion est active
 */
function mettreAJourToutesLesConversions(conversionActive) {
  if (!conversionActive) {
      // Supprimer toutes les conversions affichées
      supprimerToutesLesConversions();
      return;
  }

  // Logique pour mettre à jour ou afficher les conversions
  // Cela dépendra de la façon dont vous avez implémenté les conversions initialement
  browser.storage.sync.get(['tauxHoraire', 'heuresParJour', 'conversionActive']).then(options => {
      if (!options.conversionActive) {
          // Si la conversion n'est pas active, supprimer toutes les conversions existantes
          supprimerToutesLesConversions();
          return;
      }
  
      const tauxHoraire = options.tauxHoraire;
      const heuresParJour = options.heuresParJour;
  
      // Sélectionner tous les éléments de prix sur la page
      const elementsPrix = document.querySelectorAll('.prix'); // Ajustez ce sélecteur selon votre structure HTML
  
      elementsPrix.forEach(element => {
          // Extraire le prix de l'élément
          const prixTexte = element.textContent.trim().replace(/[^\d.,]/g, '');
          const prix = parseFloat(prixTexte.replace(',', '.'));
  
          if (!isNaN(prix)) {
              // Calculer le temps équivalent
              const heuresTravail = prix / tauxHoraire;
              const joursTravail = heuresTravail / heuresParJour;
  
              // Formater le résultat
              let tempsEquivalent = '';
              if (joursTravail >= 1) {
                  tempsEquivalent = `${joursTravail.toFixed(1)} jours`;
              } else {
                  tempsEquivalent = `${heuresTravail.toFixed(1)} heures`;
              }
  
              // Mettre à jour ou créer l'élément de conversion
              let conversionElement = element.nextElementSibling;
              if (!conversionElement || !conversionElement.classList.contains('conversion-temps')) {
                  conversionElement = document.createElement('span');
                  conversionElement.classList.add('conversion-temps');
                  element.parentNode.insertBefore(conversionElement, element.nextSibling);
              }
              conversionElement.textContent = `(${tempsEquivalent})`;
          }
      });
  });
}

/**
* Supprime toutes les conversions de prix de la page
*/
function supprimerToutesLesConversions() {
  const conversions = document.querySelectorAll('.conversion-temps');
  conversions.forEach(element => element.remove());
}

// Exécuter la mise à jour initiale
mettreAJourToutesLesConversions();

// Écouter les messages pour les mises à jour futures
browser.runtime.onMessage.addListener((message) => {
  if (message.action === "mettreAJourConversions") {
      mettreAJourToutesLesConversions(message.conversionActive);
  }
});