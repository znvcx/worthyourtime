const locales = window.locales;

let currentLocale = 'en'; // Anglais par défaut

document.addEventListener('DOMContentLoaded', () => {
  const popup = new Popup();
  popup.init();
});

function setLocale(locale) {
  currentLocale = locale;
}

function t(key) {
  return locales[currentLocale][key] || key;
}

// Fonctions utilitaires
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

function validateNumber(value, min, max, defaultValue) {
  const num = parseFloat(value);
  if (isNaN(num)) return defaultValue !== undefined ? defaultValue : min;
  if (num < min) return min;
  if (max !== undefined && num > max) return max;
  return num;
}

// Classe principale
class Popup {
  constructor() {
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
    this.loadOptions = this.loadOptions.bind(this);
    this.updateUI = this.updateUI.bind(this);
    this.loadOptions();
    this.setupEventListeners();
    this.setupSystemThemeListener();
    this.updateUI();
  }

  init() {
    this.loadOptions();
    this.initLanguage();
    this.updateUI();
    this.setupEventListeners();
  }

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

  showMainContent() {
    this.mainContent.style.display = 'block';
    this.settingsContent.style.display = 'none';
    this.aboutContent.style.display = 'none';
  }

  showSettingsContent() {
    this.mainContent.style.display = 'none';
    this.settingsContent.style.display = 'block';
    this.aboutContent.style.display = 'none';
  }

  showAboutContent() {
    this.mainContent.style.display = 'none';
    this.settingsContent.style.display = 'none';
    this.aboutContent.style.display = 'block';
  }

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
      this.updateUITheme(data.darkMode, data.useSystemTheme);
      this.updateUI();
    }).catch(error => {
      console.error('Error loading options:', error);
      this.afficherMessage(t('errorLoadingOptions'), true);
    });
  }

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

  validateInput(input, min, max, defaultValue) {
    const validValue = validateNumber(input.value, min, max, defaultValue);
    if (validValue !== parseFloat(input.value)) {
      input.value = validValue;
      this.afficherMessage(t('valueAdjustedTo', { value: validValue }), true);
    }
  }

  updateThemePreference() {
    const useSystemTheme = this.systemThemeCheckbox.checked;
    browser.storage.sync.set({ useSystemTheme })
      .then(() => {
        this.updateUITheme(this.darkModeToggle.checked, useSystemTheme);
        this.afficherMessage(t('themePreferencesSaved'));
      })
      .catch(error => this.afficherMessage(t('errorSavingTheme'), true));
  }

  updateDarkMode() {
    if (!this.systemThemeCheckbox.checked) {
      const isDarkMode = this.darkModeToggle.checked;
      browser.storage.sync.set({ darkMode: isDarkMode })
        .then(() => {
          this.applyTheme(isDarkMode);
          this.afficherMessage(t(isDarkMode ? 'darkModeEnabled' : 'darkModeDisabled'));
        })
        .catch(error => this.afficherMessage(t('errorSavingDarkMode'), true));
    }
  }

  updateUI() {
    this.updateUIText();
    this.updateUITheme();
    
    // Mise à jour des valeurs des champs
    this.tauxHoraireInput.value = this.tauxHoraire;
    this.heuresParJourInput.value = this.heuresParJour;
    this.conversionActiveInput.checked = this.conversionActive;
  }

  updateUIText() {
    document.getElementById('title').textContent = t('title');
    document.getElementById('description').textContent = t('description');
    document.getElementById('hourlyRateLabel').textContent = t('hourlyRate');
    document.getElementById('hoursPerDayLabel').textContent = t('hoursPerDay');
    document.getElementById('conversionActiveLabel').textContent = t('conversionActive');
    document.getElementById('sauvegarder').textContent = t('save');
    document.getElementById('customCalculationTitle').textContent = t('customCalculation');
    document.getElementById('prixPersonnalise').placeholder = t('price');
    document.getElementById('calculerTemps').textContent = t('calculateWorkTime');
    document.getElementById('openSettings').textContent = t('settings');
    document.getElementById('settingsTitle').textContent = t('settings');
    document.getElementById('followSystemThemeLabel').textContent = t('followSystemTheme');
    document.getElementById('darkModeLabel').textContent = t('darkMode');
    document.getElementById('backToMain').textContent = t('back');
    document.getElementById('openAbout').textContent = t('about');
    document.getElementById('aboutTitle').textContent = t('about');
    document.getElementById('aboutDescription').textContent = t('aboutDescription');
    document.getElementById('versionInfo').textContent = t('version') + ': ';
    document.getElementById('developerInfo').textContent = t('developedBy') + ': ';
    document.getElementById('websiteInfo').textContent = t('website') + ': ';
    document.getElementById('sources').textContent = t('sources') + ': ';
    document.getElementById('backFromAbout').textContent = t('back');
  
    // Mise à jour du sélecteur de langue
    this.initLanguage();
  }

  updateUITheme(isDarkMode, useSystemTheme) {
    if (useSystemTheme) {
      isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    document.body.classList.toggle('dark-mode', isDarkMode);
    this.darkModeToggle.disabled = useSystemTheme;
  }

  applyTheme(isDarkMode) {
    document.body.classList.toggle('dark-mode', isDarkMode);
  }

  afficherMessage(message, isError = false) {
    this.messageElement.textContent = message;
    this.messageElement.classList.toggle('error', isError);
    this.messageElement.classList.add('show');
    setTimeout(() => this.messageElement.classList.remove('show'), 3000);
  }

  initLanguage() {
    console.log('Initializing language selector');
    const languageSelect = document.getElementById('language-select');
    const languageLabel = document.getElementById('languageLabel');
    
    if (!languageSelect || !languageLabel) {
      console.error('Language select or label element not found');
      return;
    }
  
    languageLabel.textContent = t('language');
    
    // Vider le select avant d'ajouter les options
    languageSelect.innerHTML = '';
    
    Object.keys(locales).forEach(locale => {
      const option = document.createElement('option');
      option.value = locale;
      option.textContent = t(locale);
      languageSelect.appendChild(option);
    });
    
    languageSelect.value = currentLocale;
    languageSelect.addEventListener('change', (e) => this.changeLanguage(e.target.value));
  }

  changeLanguage(locale) {
    setLocale(locale);
    browser.storage.sync.set({ language: locale })
      .then(() => {
        this.updateUIText(); // Nouvelle méthode pour mettre à jour uniquement le texte
        this.afficherMessage(t('languageChanged'));
      })
      .catch(error => this.afficherMessage(t('errorChangingLanguage'), true));
  }

  setupSystemThemeListener() {
    if (window.matchMedia) {
      window.matchMedia('(prefers-color-scheme: dark)').addListener(() => {
        this.updateUITheme();
      });
    }
  }
}
