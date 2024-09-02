# Worth Your Time? (WYT)

## Description
**Worth Your Time?** *(WYT)* is a browser extension that converts prices into equivalent work time. It helps you evaluate the real cost of your purchases in terms of work time, allowing you to make more informed buying decisions.

## Features
- Automatic conversion of prices into work time on web pages
- Custom calculation for specific prices
- Multilingual support (currently in English and French)
- Dark mode and system theme support
- Intuitive and responsive user interface
- Debug mode to display debugging information in the console
- Whitelist and blacklist modes for URL management

## Installation
**Recommended:**
- Install directly from Mozilla Addons: https://addons.mozilla.org/en-US/firefox/addon/worth-your-time/

**Manual:**
- Download the extension's source code
- Open Firefox and go to about:debugging#/runtime/this-firefox
- Click on "Load Temporary Add-on"
- Select the manifest.json file in the extension folder

## Usage
- Click on the extension icon in the browser toolbar to open the popup
- Configure your hourly rate and working hours per day, for example, $20 per hour and 9 hours per day
- The conversion should happen automatically on the page
- To revert to the original display, disable the automatic conversion with the related switch
- To calculate a specific price that does not appear on the page or is not automatically converted, use the custom calculator and enter the price to convert

## Configuration
You can customize the following settings:
- Hourly rate
- Working hours per day
- Enable/disable automatic conversion
- Language (English or French)
- Theme (light, dark, or follow system theme)
- Aggressive mode: Choose between aggressive mode (converts more prices but may affect page layout) and gentle mode (more conservative, preserves visual integrity of websites)
- Debug mode: Enable or disable debug mode to display debugging information in the console
- Whitelist mode: Convert prices only on URLs in the whitelist
- Blacklist mode: Convert prices on all URLs except those in the blacklist

## Debug Mode
Debug mode allows you to display debugging information in the browser console. This can be useful for diagnosing issues or understanding the internal workings of the extension.

### Enable or disable Debug Mode
1. Open the extension popup by clicking on the extension icon in the browser toolbar.
2. Go to the settings by clicking on the settings icon.
3. Enable or disable the "Debug mode" switch.
4. Debugging information will be displayed in the browser console.

## Aggressive Mode
Aggressive mode allows you to choose between two price conversion strategies:

1. **Aggressive Mode (default: off)**: This mode attempts to convert more prices on web pages. It may catch more prices, but it could potentially affect the layout of some websites.

2. **Gentle Mode**: This is a more conservative approach. It converts fewer prices but is less likely to interfere with the website's visual layout.

### Enable or disable Aggressive Mode
1. Open the extension popup by clicking on the extension icon in the browser toolbar.
2. Go to the settings by clicking on the settings icon.
3. Enable or disable the "Aggressive mode" switch.
4. The changes will be applied immediately to the current page and all future pages.

Choose the mode that best suits your needs and browsing experience.

## Whitelist and Blacklist Modes
Whitelist and blacklist modes allow you to control on which URLs the price conversion should occur.

### Whitelist Mode
In whitelist mode, the extension will only convert prices on the URLs listed in the whitelist.

### Blacklist Mode
In blacklist mode, the extension will convert prices on all URLs except those listed in the blacklist.

### Manage Whitelist and Blacklist
1. Open the extension popup by clicking on the extension icon in the browser toolbar.
2. Go to the lists management by clicking on the lists management icon.
3. Add or remove URLs from the whitelist or blacklist as needed.

## Project Structure
<pre>
worth-your-time/
│
├── manifest.json           # Extension configuration file
├── popup.html              # Popup user interface
├── popup.js                # Popup logic
├── content.js              # Content script for conversion on web pages
├── background.js           # Background script
├── locales.js              # Translations file
├── styles.css              # CSS styles
├── loader.js               # Dynamic module loader script
└── icons/                  # Folder containing extension icons
</pre>

## Development
### Main Files
- **manifest.json:** Defines the extension's metadata, permissions, and scripts.
- **popup.html:** HTML structure of the extension's popup.
- **popup.js:** Manages the popup logic, including user interactions and interface updates.
- **content.js:** Responsible for converting prices on visited web pages.
- **background.js:** Manages background tasks and communication between different scripts.
- **locales.js:** Contains translations for the extension's internationalization.
- **loader.js:** Dynamically loads ES6 modules.

### Key Functions
- **Popup class in popup.js:** Manages the popup user interface and interactions.
- **remplacerPrix() in content.js:** Converts prices on web pages, using either aggressive or gentle mode depending on user settings.
- **formatTemps():** Formats the calculated work time into days, hours, and minutes.
- **logDebug():** Displays debugging information in the console if debug mode is enabled.
- **setDebugMode():** Enables or disables debug mode.

## Contribution
Contributions are welcome! Feel free to open an issue or submit a pull request for improvements or bug fixes.

## License
GNU GPL v3: https://www.gnu.org/licenses/gpl-3.0.en.html

## Contact
Developed by AK1: https://aek.one/contact
Website: https://delta-gate.one