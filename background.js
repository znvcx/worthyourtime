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
    } else if (message.action === "contentScriptReady") {
        logDebug("Content script is ready");
    } else if (message.action === "resizePopup") {
        browser.windows.getCurrent().then((windowInfo) => {
            browser.windows.update(windowInfo.id, {
                width: width + 20, 
                height: height + 40 
            });
        });
    } else if (message.action === "resize") {
        browser.windows.getCurrent().then((windowInfo) => {
            browser.windows.update(windowInfo.id, {
                height: message.height
            }).catch(error => console.error("Erreur lors du redimensionnement:", error));
        });
    }
    return true; // Indique que la réponse sera envoyée de manière asynchrone
});