import { formatTemps } from './utils.js';

/**
 * Écoute les messages envoyés par l'extension
 */
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "convertirPrix") {
        const { prix, tauxHoraire, heuresParJour } = message;
        const tempsEnHeures = prix / tauxHoraire;
        const tempsFormate = formatTemps(tempsEnHeures, heuresParJour);
        sendResponse({ tempsFormate });
    }
    return true; // Indique que la réponse sera envoyée de manière asynchrone
});