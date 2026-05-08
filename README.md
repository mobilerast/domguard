# DOMGuard

A small JavaScript library that detects modified DOM content and adds subtle visual markers when something changes.

## Features

- 🔍 **DevTools Detection** - Detects when browser developer tools are opened
- 🎯 **DOM Mutation Monitoring** - Tracks all changes to page content
- 🎨 **Subtle Visual Markers** - Applies hard-to-notice CSS changes when tampering detected
- 😠 **Debugger Trap Mode** - NEW! Continuously triggers debugger to prevent tampering
- 🏷️ **Visible Tampering Labels** - NEW! Adds obvious "MODIFIED" tags to altered content
- ⚡ **Lightweight** - No dependencies, only ~8KB minified
- 🔧 **Configurable** - Extensive customization options
- 🚀 **Easy Integration** - Simple API, works with any website

## Why Use This?

When users modify your website content using browser DevTools and take screenshots, it can be used to spread misinformation or forge content. DOMGuard adds nearly invisible markers (font adjustments, spacing changes) that prove the content was tampered with.

## Installation

### Option 1: Direct Script Tag

```html
<script src="domguard.js"></script>
<script>
  const guard = new DOMGuard({
    debug: true
  });
</script>
```

### Option 2: Auto-initialize

Add the `data-domguard` attribute to any element:

```html
<body data-domguard>
  <!-- Your content -->
</body>
<script src="domguard.js"></script>
```

## Usage

### Basic Usage

```javascript
// Initialize with default settings
const guard = new DOMGuard();
```

### Advanced Configuration

```javascript
const guard = new DOMGuard({
  // Custom visual markers to apply
  markers: [
    { property: 'fontSize', value: '0.98em' },
    { property: 'letterSpacing', value: '0.02em' },
    { property: 'lineHeight', value: '1.01' },
    { property: 'fontWeight', value: '401' }
  ],
  
  // Which elements to monitor
  watchElements: 'body *',
  
  // Callback when tampering detected
  onTamperDetected: (event) => {
    console.log('Tampering detected:', event);
    // Send to analytics, log to server, etc.
  },
  
  // Enable/disable devtools detection
  detectDevTools: true,
  
  // How often to check for devtools (ms)
  devToolsCheckInterval: 1000,
  
  // Enable/disable mutation monitoring
  detectMutations: true,
  
  // Which attributes to monitor for changes
  attributeFilter: ['class', 'style', 'id', 'src', 'href'],
  
  // Enable debug logging
  debug: true,
  
  // AGGRESSIVE MODES:
  
  // Debugger trap - continuously trigger debugger on tampering (very annoying!)
  debuggerTrap: false,
  
  // Show visible "MODIFIED" labels on tampered content
  showTamperedLabel: false
});
```

### Aggressive Protection Modes

DOMGuard includes two aggressive anti-tampering modes for maximum deterrence:

#### 1. Debugger Trap Mode

When enabled, continuously triggers the debugger whenever tampering is detected, making it extremely difficult to modify content:

```javascript
const guard = new DOMGuard({
  debuggerTrap: true  // Triggers debugger every 100ms when tampering detected
});
```

**Effect:** Users trying to modify content will be stuck in debugger pause mode. Very effective deterrent!

**Use case:** High-security content where you want to prevent any tampering attempts.

#### 2. Visible Tampering Labels

Adds bright, blinking "[MODIFIED]" labels to any tampered content:

```javascript
const guard = new DOMGuard({
  showTamperedLabel: true  // Adds visible yellow labels to modified content
});
```

**Effect:** Modified content gets obvious visual indicators, making fake screenshots easy to spot.

**Use case:** When you want tampered content to be immediately recognizable.

#### 3. Nuclear Mode (Both Combined)

For maximum protection, enable both modes:

```javascript
const guard = new DOMGuard({
  debuggerTrap: true,
  showTamperedLabel: true  // MAXIMUM PROTECTION
});
```

**Warning:** Very aggressive! Use with caution.
```

## API Methods

### `guard.forceMarkAll()`
Immediately apply markers to all watched elements (nuclear option).

```javascript
guard.forceMarkAll();
```

### `guard.isElementTampered(element)`
Check if a specific element has been tampered with.

```javascript
const element = document.querySelector('#important-content');
if (guard.isElementTampered(element)) {
  console.log('This element was modified!');
}
```

### `guard.getTamperedElements()`
Get an array of all elements that have been tampered with.

```javascript
const tampered = guard.getTamperedElements();
console.log(`${tampered.length} elements were modified`);
```

### `guard.destroy()`
Stop monitoring and remove all markers.

```javascript
guard.destroy();
```

## How It Works

### 1. DevTools Detection
The library uses multiple techniques to detect if developer tools are open:
- **Debugger timing**: Measures time taken by debugger statements
- **Console detection**: Monitors console API access
- **Window size detection**: Checks for size discrepancies

### 2. DOM Mutation Monitoring
Uses the MutationObserver API to track:
- Text content changes
- Attribute modifications
- Added/removed elements
- HTML structure changes

### 3. Visual Markers
When tampering is detected, applies subtle CSS changes:
- Tiny font size adjustments (0.98em)
- Letter spacing changes (0.02em)
- Line height variations (1.01)
- Font weight tweaks (401 instead of 400)
- Word spacing adjustments (0.5px)
- Nearly invisible borders

These changes are:
- ✅ Invisible to casual observers
- ✅ Detectable in screenshot forensics
- ✅ Randomized to prevent circumvention
- ✅ Applied with `!important` to resist removal

## Examples

### Example 1: Basic Protection

```html
<!DOCTYPE html>
<html>
<head>
  <title>Protected Content</title>
  <script src="domguard.js"></script>
</head>
<body>
  <h1>Important News Article</h1>
  <p>This content is protected from tampering...</p>
  
  <script>
    new DOMGuard({ debug: true });
  </script>
</body>
</html>
```

### Example 2: Server Logging

```javascript
const guard = new DOMGuard({
  onTamperDetected: async (event) => {
    // Log to your server
    await fetch('/api/log-tampering', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: event.type,
        timestamp: Date.now(),
        userAgent: navigator.userAgent
      })
    });
    
    // Show warning to user
    alert('Content modification detected!');
  }
});
```

### Example 3: Specific Content Protection

```javascript
// Only protect important content
const guard = new DOMGuard({
  watchElements: '.protected-content, [data-sensitive]',
  markers: [
    { property: 'fontSize', value: '0.99em' },
    { property: 'opacity', value: '0.999' }
  ]
});
```

### Example 4: Aggressive Anti-Tampering

```javascript
// Protect financial data with aggressive measures
const guard = new DOMGuard({
  debuggerTrap: true,        // Trigger debugger on tampering
  showTamperedLabel: true,   // Show visible labels
  onTamperDetected: (event) => {
    // Log to server
    fetch('/api/security-alert', {
      method: 'POST',
      body: JSON.stringify(event)
    });
    
    // Alert user
    alert('⚠️ SECURITY ALERT: Unauthorized modification detected!');
  }
});
```

## Browser Support

- ✅ Chrome/Edge 51+
- ✅ Firefox 14+
- ✅ Safari 10+
- ✅ Opera 38+

Requires MutationObserver API support.

## Limitations

- Users can still take screenshots of original content before tampering
- Determined users can disable JavaScript
- Visual markers can be removed if detected
- Some browser extensions may interfere

## Best Practices

1. **Combine with other security measures** - This is not a silver bullet
2. **Log tampering events** - Track suspicious activity server-side
3. **Use subtle markers** - Don't make them too obvious
4. **Educate users** - Add watermarks or timestamps to screenshots
5. **Regular monitoring** - Review tampered element reports

## License

MIT License - Free to use in personal and commercial projects.

## Contributing

Contributions welcome! Please submit issues and pull requests.

## Security Note

This library is a deterrent, not absolute protection. Sophisticated users can bypass these checks. Use as part of a comprehensive security strategy.
