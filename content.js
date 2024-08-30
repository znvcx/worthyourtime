  // Worth Your Time? (WYT) - Convertit les prix en temps de travail
  console.log("WYT: Script de contenu chargé");

  let prixOriginaux = new Map();
  let conversionActive = true;
  let tauxHoraire, heuresParJour;
  
  function initialiserExtension() {
      console.log("WYT: Initialisation de l'extension");
      browser.storage.sync.get(['tauxHoraire', 'heuresParJour', 'conversionActive']).then(data => {
          console.log("WYT: Données récupérées", data);
          conversionActive = data.conversionActive !== undefined ? data.conversionActive : true;
          tauxHoraire = data.tauxHoraire || 20;
          heuresParJour = data.heuresParJour || 8.5;
          mettreAJourPrixConvertis();
      }).catch(error => {
          console.error("WYT: Erreur lors de la récupération des paramètres :", error);
      });
  }
  
  function mettreAJourPrixConvertis() {
      console.log("WYT: Mise à jour des prix convertis");
      restaurerPrixOriginaux();
      if (conversionActive) {
          remplacerPrix();
      }
  }
  
  function remplacerPrix() {
    console.log("WYT: Remplacement des prix");
    // Mise à jour de l'expression régulière pour être plus spécifique aux prix
    const regex = /(?<!\d)(?:([₿₽₺₩₴₦₱₭₫៛₪₨]|[A-Z]{3}|\$|€|£|¥)\s*)?(\d{1,3}(?:[ '\u00A0]\d{3})*(?:[.,]\d{1,2})?)\s*(?:([₿₽₺₩₴₦₱₭₫៛₪₨]|[A-Z]{3}|\$|€|£|¥)|\.–|\.-)?(?!\d)/g;

    function convertirPrix(match, deviseBefore, prix, deviseAfter) {
        if (!prix) {
            console.warn("WYT: Prix non trouvé dans le match:", match);
            return match;
        }
        const devise = deviseBefore || deviseAfter;
        // Vérifier si le match est vraiment un prix
        if (!devise && !match.includes('.–') && !match.includes('.-')) {
            return match; // Ce n'est probablement pas un prix, on ne le convertit pas
        }
        const prixNumerique = parseFloat(prix.replace(/[' \u00A0]/g, '').replace(',', '.'));
        const tempsEnHeures = prixNumerique / tauxHoraire;
        const tempsFormate = formatTemps(tempsEnHeures);
        return `${tempsFormate} <small style="font-size: 0.8em; color: #666;">(${match})</small>`;
    }

    function remplacerPrixDansElement(element) {
        if (element.childNodes.length === 0) {
            if (element.textContent && regex.test(element.textContent)) {
                const texteOriginal = element.textContent;
                const nouveauTexte = texteOriginal.replace(regex, convertirPrix);
                if (texteOriginal !== nouveauTexte) {
                    element.innerHTML = nouveauTexte;
                }
            }
        } else {
            Array.from(element.childNodes).forEach(child => {
                if (child.nodeType === Node.TEXT_NODE) {
                    if (regex.test(child.textContent)) {
                        const nouveauTexte = child.textContent.replace(regex, convertirPrix);
                        if (child.textContent !== nouveauTexte) {
                            const span = document.createElement('span');
                            span.innerHTML = nouveauTexte;
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
  
  function formatTemps(heures) {
        const jours = Math.floor(heures / heuresParJour);
        const heuresRestantes = Math.floor(heures % heuresParJour);
        const minutes = Math.round((heures % 1) * 60);
        
        let resultat = '';
        if (jours > 0) resultat += jours + 'j ';
        if (heuresRestantes > 0 || (jours === 0 && minutes === 0)) resultat += heuresRestantes + 'h';
        if (minutes > 0) resultat += (resultat ? ' ' : '') + minutes + 'm';
        return resultat.trim();
    }
  
  function restaurerPrixOriginaux() {
      console.log("WYT: Restauration des prix originaux");
      document.querySelectorAll('[data-prix-id]').forEach(element => {
          const id = element.getAttribute('data-prix-id');
          const prixOriginal = prixOriginaux.get(id);
          if (prixOriginal) {
              element.outerHTML = prixOriginal;
          }
      });
      prixOriginaux.clear();
  }
  
  initialiserExtension();
  
  browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log("WYT: Message reçu", message);
      if (message.action === "appliquerChangements") {
          browser.storage.sync.get(['tauxHoraire', 'heuresParJour', 'conversionActive']).then(data => {
              console.log("WYT: Nouvelles données reçues", data);
              conversionActive = data.conversionActive;
              tauxHoraire = data.tauxHoraire;
              heuresParJour = data.heuresParJour;
              mettreAJourPrixConvertis();
          });
      }
  });




browser.runtime.onMessage.addListener((message) => {
    if (message.action === "mettreAJourConversions") {
      mettreAJourToutesLesConversions(message.conversionActive);
    }
  });
  
  function mettreAJourToutesLesConversions(conversionActive) {
    if (!conversionActive) {
      // Supprimer toutes les conversions affichées
      supprimerToutesLesConversions();
      return;
    }

    // Logique pour mettre à jour ou afficher les conversions
    // Cela dépendra de la façon dont vous avez implémenté les conversions initialement
    function mettreAJourToutesLesConversions() {
        // Récupérer les options sauvegardées
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
      
          elementsPrice.forEach(element => {
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
      
      function supprimerToutesLesConversions() {
        const conversions = document.querySelectorAll('.conversion-temps');
        conversions.forEach(element => element.remove());
      }
  }
  
  // Exécuter la mise à jour initiale
  mettreAJourToutesLesConversions();

  // Écouter les messages pour les mises à jour futures
  browser.runtime.onMessage.addListener((message) => {
    if (message.action === "mettreAJourConversions") {
      mettreAJourToutesLesConversions(message.conversionActive);
    }
  });
