// Importation des traductions depuis le fichier locales.js
const locales = window.locales;

// Définition de la langue par défaut
let currentLocale = 'en'; // Anglais par défaut

// Attente du chargement complet du DOM avant d'initialiser l'extension
document.addEventListener('DOMContentLoaded', () => {
  const popup = new Popup();
  popup.init();
});

// Fonction pour définir la langue courante
function setLocale(locale) {
  currentLocale = locale;
}

// Fonction pour obtenir la traduction d'une clé dans la langue courante
function t(key) {
  return locales[currentLocale][key] || key;
}

// Fonctions utilitaires

/**
 * Formate le temps en jours, heures et minutes
 * @param {number} heures - Nombre total d'heures
 * @param {number} heuresParJour - Nombre d'heures de travail par jour
 * @return {string} Temps formaté
 */
function formatTemps(heures, heuresParJour) {
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
 * @param {number} defaultValue - Valeur par défaut si la valeur est invalide
 * @return {number} Valeur validée
 */
function validateNumber(value, min, max, defaultValue) {
  const num = parseFloat(value);
  if (isNaN(num)) return defaultValue !== undefined ? defaultValue : min;
  if (num < min) return min;
  if (max !== undefined && num > max) return max;
  return num;
}

/**
 * Classe principale gérant l'interface utilisateur du popup
 */
class Popup {
  /**
   * Initialise les éléments de l'interface et charge les options
   */
  constructor() {
    // Initialisation des éléments de l'interface
    this.tauxHoraireInput = document.getElementById('tauxHoraire');
    this.heuresParJourInput = document.getElementById('heuresParJour');
    this.conversionActiveInput = document.getElementById('conversionActive');
    this.prixPersonnaliseInput = document.getElementById('prixPersonnalise');
    this.resultatCalculElement = document.getElementById('resultatCalcul');
    this.darkModeToggle = document.getElementById('darkModeToggle');
    this.systemThemeCheckbox = document.getElementById('systemTheme');
    this.messageElement = document.getElementById('message');
    this.mainContent = document.getElementById('main-content');
    this.settingsContent = document.getElementById('settings-content');
    this.aboutContent = document.getElementById('about-content');
    this.openSettingsButton = document.getElementById('openSettings');
    this.backToMainButton = document.getElementById('backToMain');
    this.openAboutButton = document.getElementById('openAbout');
    this.backFromAboutButton = document.getElementById('backFromAbout');

    // Liaison des méthodes
    this.loadOptions = this.loadOptions.bind(this);
    this.updateUI = this.updateUI.bind(this);

    // Chargement initial des options et configuration de l'interface
    this.loadOptions();
    this.setupEventListeners();
    this.setupSystemThemeListener();
    this.updateUI();
  }

  /**
   * Initialise l'extension
   */
  init() {
    this.loadOptions();
    this.initLanguage();
    this.updateUI();
    this.setupEventListeners();
  }

  /**
   * Configure les écouteurs d'événements pour les éléments de l'interface
   */
  setupEventListeners() {
    document.getElementById('sauvegarder').addEventListener('click', () => this.saveOptions());
    document.getElementById('calculerTemps').addEventListener('click', () => this.calculerTemps());
    this.tauxHoraireInput.addEventListener('change', () => {
      this.validateInput(this.tauxHoraireInput, 0.01, undefined, 20);
      this.saveOptions();
    });
    this.heuresParJourInput.addEventListener('change', () => {
      this.validateInput(this.heuresParJourInput, 0.1, 24, 8);
      this.saveOptions();
    });
    this.conversionActiveInput.addEventListener('change', () => this.saveOptions());
    this.prixPersonnaliseInput.addEventListener('input', () => this.validateInput(this.prixPersonnaliseInput, 0.01));
    this.prixPersonnaliseInput.addEventListener('keypress', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault(); // Empêche le comportement par défaut de la touche Entrée
        this.calculerTemps();
      }
    });
    this.systemThemeCheckbox.addEventListener('change', () => this.updateThemePreference());
    this.darkModeToggle.addEventListener('change', () => this.updateDarkMode());
    this.openSettingsButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSettingsContent();
    });
    this.backToMainButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.showMainContent();
    });
    this.openAboutButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.showAboutContent();
    });
    this.backFromAboutButton.addEventListener('click', (e) => {
      e.preventDefault();
      this.showSettingsContent();
    });
  }

  /**
   * Affiche le contenu principal de l'extension
   */
  showMainContent() {
    this.mainContent.style.display = 'block';
    this.settingsContent.style.display = 'none';
    this.aboutContent.style.display = 'none';
  }

  /**
   * Affiche le contenu des paramètres de l'extension
   */
  showSettingsContent() {
    this.mainContent.style.display = 'none';
    this.settingsContent.style.display = 'block';
    this.aboutContent.style.display = 'none';
  }

  /**
   * Affiche le contenu "À propos" de l'extension
   */
  showAboutContent() {
    this.mainContent.style.display = 'none';
    this.settingsContent.style.display = 'none';
    this.aboutContent.style.display = 'block';
  }

  /**
   * Charge les options de l'extension depuis le stockage
   */
  loadOptions() {
    browser.storage.sync.get({
      tauxHoraire: 20,
      heuresParJour: 8,
      conversionActive: true,
      darkMode: false,
      useSystemTheme: false,
      language: 'en'
    }).then(data => {
      // Vérifiez que les éléments existent avant d'assigner les valeurs
      if (this.tauxHoraireInput) this.tauxHoraireInput.value = data.tauxHoraire;
      if (this.heuresParJourInput) this.heuresParJourInput.value = data.heuresParJour;
      if (this.conversionActiveInput) this.conversionActiveInput.checked = data.conversionActive;
      if (this.darkModeToggle) this.darkModeToggle.checked = data.darkMode;
      if (this.systemThemeCheckbox) this.systemThemeCheckbox.checked = data.useSystemTheme;
      
      // Stockez également les valeurs dans les propriétés de la classe
      this.tauxHoraire = data.tauxHoraire;
      this.heuresParJour = data.heuresParJour;
      this.conversionActive = data.conversionActive;
      this.darkMode = data.darkMode;
      this.useSystemTheme = data.useSystemTheme;
      
      setLocale(data.language);
      this.updateUITheme();
      this.updateUI();
    }).catch(error => {
      console.error('Error loading options:', error);
      this.afficherMessage(t('errorLoadingOptions'), true);
    });
  }

  /**
   * Sauvegarde les options de l'extension dans le stockage
   */
  saveOptions() {
    const tauxHoraire = validateNumber(this.tauxHoraireInput.value, 0.01, undefined, 20);
    const heuresParJour = validateNumber(this.heuresParJourInput.value, 0.1, 24, 8);
    const conversionActive = this.conversionActiveInput.checked;

    browser.storage.sync.set({ tauxHoraire, heuresParJour, conversionActive })
      .then(() => {
        this.afficherMessage(t('settingsSaved'));
        browser.tabs.query({active: true, currentWindow: true})
          .then(tabs => {
            if (tabs[0]) {
              browser.tabs.reload(tabs[0].id);
            }
          })
          .catch(error => console.error(t('errorReloadingPage'), error));
      })
      .catch(error => this.afficherMessage(t('errorSavingSettings'), true));
  }

  /**
   * Calcule le temps nécessaire pour un prix donné
   */
  calculerTemps() {
    const prix = validateNumber(this.prixPersonnaliseInput.value, 0.01);
    const tauxHoraire = validateNumber(this.tauxHoraireInput.value, 0.01);
    const heuresParJour = validateNumber(this.heuresParJourInput.value, 0.1, 24);

    if (tauxHoraire === 0.01) {
      this.afficherMessage(t('pleaseSetValidHourlyRate'), true);
      return;
    }

    const tempsEnHeures = prix / tauxHoraire;
    this.resultatCalculElement.textContent = formatTemps(tempsEnHeures, heuresParJour);
  }

  /**
   * Valide et ajuste une entrée de l'interface utilisateur
   * @param {HTMLInputElement} input - Élément d'entrée à valider
   * @param {number} min - Valeur minimale autorisée
   * @param {number} max - Valeur maximale autorisée (optionnelle)
   * @param {number} defaultValue - Valeur par défaut si la valeur est invalide
   */
  validateInput(input, min, max, defaultValue) {
    const validValue = validateNumber(input.value, min, max, defaultValue);
    if (validValue !== parseFloat(input.value)) {
      input.value = validValue;
      this.afficherMessage(t('valueAdjustedTo', { value: validValue }), true);
    }
  }

  /**
   * Met à jour les préférences de thème de l'extension
   */
  updateThemePreference() {
    const useSystemTheme = this.systemThemeCheckbox.checked;
    browser.storage.sync.set({ useSystemTheme })
      .then(() => {
        this.useSystemTheme = useSystemTheme;
        this.updateUITheme();
        this.afficherMessage(t('themePreferencesSaved'));
      })
      .catch(error => this.afficherMessage(t('errorSavingTheme'), true));
  }

  /**
   * Met à jour le mode sombre de l'extension
   */
  updateDarkMode() {
    if (!this.useSystemTheme) {
      const isDarkMode = this.darkModeToggle.checked;
      browser.storage.sync.set({ darkMode: isDarkMode })
        .then(() => {
          this.darkMode = isDarkMode;
          this.applyTheme(isDarkMode);
          this.afficherMessage(t(isDarkMode ? 'darkModeEnabled' : 'darkModeDisabled'));
        })
        .catch(error => this.afficherMessage(t('errorSavingDarkMode'), true));
    }
  }

  /**
   * Met à jour l'interface utilisateur de l'extension
   */
  updateUI() {
    this.updateUIText();
    this.updateUITheme();
    
    // Mise à jour des valeurs des champs
    this.tauxHoraireInput.value = this.tauxHoraire;
    this.heuresParJourInput.value = this.heuresParJour;
    this.conversionActiveInput.checked = this.conversionActive;
  }

  /**
   * Met à jour le texte de l'interface utilisateur
   */
  updateUIText() {
    const elements = {
      'title': 'title',
      'description': 'description',
      'hourlyRateLabel': 'hourlyRate',
      'hoursPerDayLabel': 'hoursPerDay',
      'conversionActiveLabel': 'conversionActive',
      'sauvegarder': 'save',
      'customCalculationTitle': 'customCalculation',
      'prixPersonnalise': 'price',
      'calculerTemps': 'calculateWorkTime',
      'openSettings': 'settings',
      'settingsTitle': 'settings',
      'followSystemThemeLabel': 'followSystemTheme',
      'darkModeLabel': 'darkMode',
      'backToMain': 'back',
      'openAbout': 'about',
      'aboutTitle': 'about',
      'aboutDescription': 'aboutDescription',
      'versionInfo': 'version',
      'developerInfo': 'developedBy',
      'websiteInfo': 'website',
      'sources': 'sources',
      'backToMain': 'back',
      'backFromAbout': 'back'
    };

    for (const [id, key] of Object.entries(elements)) {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = t(key);
      } else {
        console.warn(`Element with id '${id}' not found`);
      }
    }

    // Mise à jour du sélecteur de langue
    this.initLanguage();
  }

  /**
   * Met à jour le thème de l'interface utilisateur
   */
  updateUITheme() {
    let isDarkMode = this.darkMode;
    if (this.useSystemTheme) {
      isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    document.body.classList.toggle('dark-mode', isDarkMode);
    this.darkModeToggle.checked = isDarkMode;
    this.darkModeToggle.disabled = this.useSystemTheme;
    this.systemThemeCheckbox.checked = this.useSystemTheme;

    // Pas besoin de synchroniser ici, car c'est déjà fait dans updateThemePreference et updateDarkMode
  }

  /**
   * Applique le thème sombre à l'interface utilisateur
   * @param {boolean} isDarkMode - Indique si le mode sombre doit être activé ou non
   */
  applyTheme(isDarkMode) {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }

  /**
   * Affiche un message à l'utilisateur
   * @param {string} message - Message à afficher
   * @param {boolean} isError - Indique si le message est une erreur ou non
   */
  afficherMessage(message, isError = false) {
    this.messageElement.textContent = message;
    this.messageElement.classList.toggle('error', isError);
    this.messageElement.classList.add('show');
    setTimeout(() => this.messageElement.classList.remove('show'), 3000);
  }

  /**
   * Initialise le sélecteur de langue de l'extension
   */
  initLanguage() {
    console.log('Initializing language selector');
    const languageSelect = document.getElementById('language-select');
    const languageLabel = document.getElementById('languageLabel');
    
    if (!languageSelect || !languageLabel) {
      console.error('Language select or label element not found');
      return;
    }
  
    languageLabel.textContent = t('language');
    console.log('Language label updated:', t('language'));
    
    // Vider le select avant d'ajouter les options
    languageSelect.innerHTML = '';
    
    Object.keys(locales).forEach(locale => {
      const option = document.createElement('option');
      option.value = locale;
      option.textContent = locales[currentLocale][locale] || locale;
      languageSelect.appendChild(option);
      console.log(`Added language option: ${locale} - ${option.textContent}`);
    });
    
    languageSelect.value = currentLocale;
    console.log('Current language set to:', currentLocale);
    languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
  }

  /**
   * Change la langue de l'extension
   * @param {string} locale - Code de langue à utiliser
   */
  changeLanguage(locale) {
    setLocale(locale);
    browser.storage.sync.set({ language: locale })
      .then(() => {
        this.updateUIText(); // Nouvelle méthode pour mettre à jour uniquement le texte
        this.afficherMessage(t('languageChanged'));
      })
      .catch(error => this.afficherMessage(t('errorChangingLanguage'), true));
  }

  /**
   * Configure un écouteur pour les changements de thème système
   */
  setupSystemThemeListener() {
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addListener(() => {
        this.checkSystemTheme();
      });
    }
  }

  /**
   * Vérifie le thème système et met à jour l'interface utilisateur en conséquence
   */
  checkSystemTheme() {
    if (this.useSystemTheme) {
      const isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.updateUITheme();
    }
  }
}
