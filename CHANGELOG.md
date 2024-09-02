# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.2.3] - 2023-09-02
### Added
- Added support for whitelist and blacklist modes.
- Added `displayVersion` method to display the extension version in the popup.
- Added event listeners for various UI elements in `setupEventListeners`.

### Changed
- Updated `README.md` to reflect recent changes.
- Refactored `loadOptions` to ensure elements exist before assigning values.
- Improved `updateUI` to call `updateUIText` and `updateUITheme`.

### Fixed
- Fixed issue with version number not displaying correctly in `popup.html`.
- Fixed issue with `remove-url` button not working correctly in `updateUrlListUI`.

## [1.2.2] - 2023-09-01
### Added
- Initial release with basic functionality.
- Added support for dark mode and system theme preference.
- Added URL list management with whitelist and blacklist modes.
- Added debug mode and aggressive mode toggles.

### Changed
- Updated UI to include settings and about sections.
- Improved price conversion logic in `content.js`.

### Fixed
- Fixed various UI bugs and improved overall stability.
