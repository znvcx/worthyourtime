(async () => {
    try {
        const utilsUrl = browser.runtime.getURL('utils.js');
        const localesUrl = browser.runtime.getURL('locales.js');
        const contentUrl = browser.runtime.getURL('content.js');
        const popupUrl = browser.runtime.getURL('popup.js');

        await import(utilsUrl);
        await import(contentUrl);
        await import(localesUrl);
        await import(popupUrl);
    } catch (error) {
        console.error('Error loading dynamically imported module:', error);
    }
})();