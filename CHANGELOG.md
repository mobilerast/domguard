# Changelog

All notable changes to DOMGuard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-05-08

### Added
- **Debugger Trap Mode** - New `debuggerTrap` option that continuously triggers debugger when tampering is detected, making content modification extremely difficult
- **Visible Tampering Labels** - New `showTamperedLabel` option that adds bright, blinking "[MODIFIED]" labels to tampered content
- `activateDebuggerTrap()` method to manually enable debugger trap
- `deactivateDebuggerTrap()` method to disable debugger trap
- `addTamperedLabel()` method to add visible modification indicators
- Blink animation CSS for visible labels
- New aggressive protection example page (`example-aggressive.html`)
- Three protection modes: Debugger Trap, Visible Labels, and Nuclear (both combined)

### Changed
- Enhanced `destroy()` method to also clear debugger trap interval
- Updated documentation with aggressive mode examples
- Added two new features to main feature list

### Security Notes
- Debugger trap triggers every 100ms when tampering detected
- Visible labels are styled to be obvious and hard to remove
- Nuclear mode combines both features for maximum protection

## [1.0.0] - 2026-05-08

### Added
- Initial release of DOMGuard
- DevTools detection using multiple methods (debugger timing, console detection, window size)
- DOM mutation monitoring using MutationObserver API
- Automatic visual marker application on tampering detection
- Configurable marker options (fontSize, letterSpacing, lineHeight, fontWeight, wordSpacing)
- Element snapshot system for tamper verification
- Callback support for custom tampering handlers
- Auto-initialization via data attributes
- Debug logging mode
- Methods: `forceMarkAll()`, `isElementTampered()`, `getTamperedElements()`, `destroy()`
- Comprehensive documentation and examples
- Basic and Advanced HTML examples
- MIT License

### Security Notes
- Multiple DevTools detection strategies for redundancy
- Subtle visual markers hard to detect by casual observers
- Randomized marker selection to prevent circumvention
- Parent element marking for broader coverage
