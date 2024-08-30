browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "convertirPrix") {
        const { prix, tauxHoraire, heuresParJour } = message;
        const tempsEnHeures = prix / tauxHoraire;
        const tempsFormate = formatTemps(tempsEnHeures, heuresParJour);
        sendResponse({ tempsFormate });
    }
    return true; // Indique que la réponse sera envoyée de manière asynchrone
});

function formatTemps(heures, heuresParJour) {
    const jours = Math.floor(heures / heuresParJour);
    const heuresRestantes = Math.floor(heures % heuresParJour);
    const minutes = Math.round((heures % 1) * 60);
    
    let resultat = '';
    if (jours > 0) resultat += jours + 'j ';
    if (heuresRestantes > 0 || (jours === 0 && minutes === 0)) resultat += heuresRestantes + 'h';
    if (minutes > 0) resultat += (resultat ? ' ' : '') + minutes + 'm';
    return resultat.trim();
}