/**
 * Formate le temps en jours, heures et minutes
 * @param {number} heures - Nombre total d'heures
 * @param {number} heuresParJour - Nombre d'heures de travail par jour
 * @return {string} Temps formaté
 */
export function formatTemps(heures, heuresParJour) {
    const jours = Math.floor(heures / heuresParJour);
    const heuresRestantes = Math.floor(heures % heuresParJour);
    const minutes = Math.round((heures % 1) * 60);
    
    let resultat = '';
    if (jours > 0) resultat += `${jours}j `;
    if (heuresRestantes > 0 || (jours === 0 && minutes === 0)) resultat += `${heuresRestantes}h `;
    if (minutes > 0) resultat += `${minutes}m`;
    return resultat.trim();
}

/**
 * Valide et ajuste une valeur numérique dans une plage donnée
 * @param {string|number} value - Valeur à valider
 * @param {number} min - Valeur minimale autorisée
 * @param {number} max - Valeur maximale autorisée (optionnelle)
 * @return {number} Valeur validée
 */
export function validateNumber(value, min, max) {
    const num = parseFloat(value);
    if (isNaN(num)) return min;
    if (num < min) return min;
    if (max !== undefined && num > max) return max;
    return num;
}