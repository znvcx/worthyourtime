logDebug("Script de contenu chargé");

// Informer le background script que le content script est prêt
browser.runtime.sendMessage({ action: "contentScriptReady" }).then(response => {
        logDebug("Informé background script que content script est prêt :", response.status);
    })
    .catch(error => {
        logDebug("Erreur lors de l'information au background script que content script est prêt :", error);
    });

let prixOriginaux = new Map();
let conversionActive = true;
let tauxHoraire, heuresParJour;
let aggressiveMode = false;
let urlList = [];
let isBlacklistMode = true;

/**
 * Initialise l'extension en chargeant les options et en configurant les écouteurs d'événements
 */
function initialiserExtension() {
    logDebug("Initialisation de l'extension");
    browser.storage.sync.get(['tauxHoraire', 'heuresParJour', 'conversionActive', 'debugMode', 'aggressiveMode', 'urlList', 'isBlacklistMode']).then(data => {
        logDebug("Données récupérées", data);
        conversionActive = data.conversionActive !== undefined ? data.conversionActive : true;
        tauxHoraire = data.tauxHoraire || 20;
        heuresParJour = data.heuresParJour || 8.5;
        debugMode = data.debugMode || false;
        aggressiveMode = data.aggressiveMode || false;
        urlList = data.urlList || [];
        isBlacklistMode = data.isBlacklistMode !== undefined ? data.isBlacklistMode : true;
        setDebugMode(debugMode);
        logDebug(`Mode agressif : ${aggressiveMode ? 'activé' : 'désactivé'}`);
        if (shouldApplyConversion()) {
            mettreAJourPrixConvertis();
        }
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
    
    const regexAgressif = /(?<!\d)(?:([₿₽₺₩₴₦₱₭₫៛₪₨]|[A-Z]{3}|\$|€|£|¥)\s*)?(\d{1,3}(?:[.,\s']\d{3})*(?:[.,]\d{2})?)\s*(?:([₿₽₺₩₴₦₱₭₫៛₪₨]|[A-Z]{3}|\$|€|£|¥)|\.–|\.-)?(?!\d)/g;
    const regexDoux = /(?<!\d)(?:([₿₽₺₩₴₦₱₭₫៛₪₨$€£¥]|[A-Z]{3})\s*(\d{1,3}(?:[ '\u00A0]\d{3})*(?:[.,]\d{2})?)|(\d{1,3}(?:[ '\u00A0]\d{3})*(?:[.,]\d{2})?)\s*([₿₽₺₩₴₦₱₭₫៛₪₨$€£¥]|[A-Z]{3})|(\d{1,3}(?:[ '\u00A0]\d{3})*(?:[.,]\d{2})?(?:\.–|\.-)))(?!\d)/g;
    
    const regex = aggressiveMode ? regexAgressif : regexDoux;
    logDebug(`Mode utilisé pour la regex : ${aggressiveMode ? 'agressif' : 'doux'}`);

    function convertirPrix(match, deviseAvant, prixAvecDeviseAvant, prixSansDevise, deviseApres) {
        logDebug(`Match trouvé : ${match}`);
        const prix = prixAvecDeviseAvant || prixSansDevise;
        if (!prix) {
            logDebug("Prix non trouvé dans le match:", match);
            return match;
        }
        const prixNumerique = parseFloat(prix.replace(/[^\d.,]/g, '').replace(',', '.'));
        const tempsEnHeures = prixNumerique / tauxHoraire;
        const tempsFormate = formatTemps(tempsEnHeures, heuresParJour);
        logDebug(`Conversion : ${prixNumerique} -> ${tempsFormate}`);
        return `${tempsFormate} (${match})`;
    }

    function remplacerPrixDansElement(element) {
        if (element.nodeType === Node.TEXT_NODE) {
            const texteOriginal = element.textContent;
            const nouveauTexte = texteOriginal.replace(regex, convertirPrix);
            if (texteOriginal !== nouveauTexte) {
                element.textContent = nouveauTexte;
                logDebug(`Texte remplacé : "${texteOriginal}" -> "${nouveauTexte}"`);
            }
        } else if (element.nodeType === Node.ELEMENT_NODE) {
            if (element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
                Array.from(element.childNodes).forEach(remplacerPrixDansElement);
            }
        }
    }

    remplacerPrixDansElement(document.body);
    logDebug("Conversions des prix terminées");
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

function shouldApplyConversion() {
  const currentUrl = window.location.hostname;
  const extensionUrl = browser.runtime.getURL('');

  logDebug(`URL actuelle : ${currentUrl}`);
  logDebug(`URL de l'extension : ${extensionUrl}`);
  logDebug(`isBlacklistMode : ${isBlacklistMode}`);
  logDebug(`urlList : ${JSON.stringify(urlList)}`);

  // pas de conversion sur la page de l'extension
  if (extensionUrl.includes(currentUrl)) {
    logDebug("URL de l'extension, pas de conversion");
    return false;
  }

  if (isBlacklistMode) {
    // si en mode blacklist, on ne convertit pas les prix des urls blacklistées
    const shouldApply = !urlList.includes(currentUrl);
    logDebug(`Mode liste noire, conversion : ${shouldApply}`);
    return shouldApply;
  } else {
    // si mode whitelist, on convertit les prix des urls whitelistées
    const shouldApply = urlList.includes(currentUrl);
    logDebug(`Mode liste blanche, conversion : ${shouldApply}`);
    return shouldApply;
  }
}

// Initialiser l'extension 
initialiserExtension();

// écouter les messages du background pour appliquer les changements
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    logDebug("Message reçu", message);
    if (message.action === "appliquerChangements") {
      browser.storage.sync.get(['tauxHoraire', 'heuresParJour', 'conversionActive', 'debugMode', 'aggressiveMode', 'urlList', 'isBlacklistMode']).then(data => {
        logDebug("Nouvelles données reçues", data);
        conversionActive = data.conversionActive;
        tauxHoraire = data.tauxHoraire;
        heuresParJour = data.heuresParJour;
        debugMode = data.debugMode;
        aggressiveMode = data.aggressiveMode;
        urlList = data.urlList || [];
        isBlacklistMode = data.isBlacklistMode;
        setDebugMode(debugMode);
        logDebug(`Mode agressif : ${aggressiveMode ? 'activé' : 'désactivé'}`);
        if (shouldApplyConversion() && conversionActive) {
          mettreAJourPrixConvertis();
        } else {
          restaurerPrixOriginaux();
        }
      });
    }
  });

/**
 * Met à jour toutes les conversions de prix sur la page
 */
function mettreAJourToutesLesConversions() {
    logDebug("Mise à jour de toutes les conversions");
  
    browser.storage.sync.get(['tauxHoraire', 'heuresParJour', 'conversionActive']).then(options => {
      if (!options.conversionActive) {
        logDebug("La conversion n'est pas active, suppression des conversions existantes");
        supprimerToutesLesConversions();
        return;
      }
  
      const tauxHoraire = options.tauxHoraire;
      const heuresParJour = options.heuresParJour;
  
      logDebug(`Taux horaire : ${tauxHoraire}, Heures par jour : ${heuresParJour}`);
  
      // Logique pour mettre à jour ou afficher les conversions
      const elementsPrix = document.querySelectorAll('.prix'); // Ajustez ce sélecteur selon votre structure HTML
      logDebug(`Nombre d'éléments de prix trouvés : ${elementsPrix.length}`);
  
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
  
          logDebug(`Prix converti : ${prix} -> ${tempsEquivalent}`);
  
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
    }).catch(error => {
      console.error("Erreur lors de la récupération des options pour la conversion :", error);
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
      mettreAJourToutesLesConversions();
  }
});