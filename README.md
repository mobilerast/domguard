# DOMGuard

A lightweight JavaScript library that detects when someone modifies your website content using browser developer tools and automatically adds visual markers to prevent fraudulent screenshots.

If you find this project useful, please consider giving it a star on GitHub. It helps others discover the project and motivates continued development.

## What Does It Do?

Have you ever worried about someone editing your website content in their browser, taking a screenshot, and passing it off as legitimate? This happens more often than you might think with financial data, testimonials, news articles, and reviews.

DOMGuard solves this problem by:

1. **Monitoring for changes** - Watches your page content in real-time for any modifications
2. **Detecting developer tools** - Knows when someone opens browser DevTools
3. **Applying markers** - Automatically adds subtle visual indicators when content is tampered with
4. **Preventing misuse** - Makes it easy to prove a screenshot has been doctored

## Key Features

**DevTools Detection**  
Detects when browser developer tools are opened using multiple detection methods.

**Real-Time DOM Monitoring**  
Tracks all changes to your page content including text modifications, attribute changes, and structural alterations.

**Subtle Visual Markers**  
Applies barely noticeable CSS changes (font size, spacing, line height) that prove tampering.

**Debugger Trap Mode** (New)  
Continuously triggers the debugger when tampering is detected, making content modification extremely difficult.

**Visible Tampering Labels** (New)  
Adds obvious "MODIFIED" tags to altered content that are impossible to miss in screenshots.

**Lightweight & Fast**  
No external dependencies. Only around 8KB minified.

**Highly Configurable**  
Extensive customization options with callback support.

**Simple Integration**  
Works with any website. Just include the script and initialize.

## Why This Matters

In today's digital world, fake screenshots can damage reputations, spread misinformation, and even be used for fraud. Someone could:

- Modify a bank balance and claim they have more money
- Change a negative review to a positive one
- Alter a news headline to spread false information
- Edit financial reports to mislead investors

DOMGuard helps protect against these scenarios by ensuring modified content leaves evidence behind.

## Installation

### Method 1: Direct Script Tag

The simplest way to use DOMGuard is to include it directly in your HTML:

```html
<script src="domguard.js"></script>
<script>
  const guard = new DOMGuard({
    debug: true
  });
</script>
```

### Method 2: Auto-Initialize

For even simpler setup, add the `data-domguard` attribute to any element and the library will initialize automatically:

```html
<body data-domguard>
  <!-- Your content -->
</body>
<script src="domguard.js"></script>
```

## Getting Started

### Basic Usage

The most basic implementation requires just one line:

```javascript
// Initialize with default settings
const guard = new DOMGuard();
```

This will start monitoring your entire page with default protection settings.

### Complete Configuration Options

For more control, you can customize how DOMGuard works:

```javascript
const guard = new DOMGuard({
  // Custom visual markers to apply when tampering is detected
  markers: [
    { property: 'fontSize', value: '0.98em' },
    { property: 'letterSpacing', value: '0.02em' },
    { property: 'lineHeight', value: '1.01' },
    { property: 'fontWeight', value: '401' }
  ],
  
  // CSS selector for which elements to monitor (default: all elements)
  watchElements: 'body *',
  
  // Callback function when tampering is detected
  onTamperDetected: (event) => {
    console.log('Tampering detected:', event);
    // You can send this to your analytics, log to server, etc.
  },
  
  // Enable or disable developer tools detection
  detectDevTools: true,
  
  // How frequently to check for developer tools (in milliseconds)
  devToolsCheckInterval: 1000,
  
  // Enable or disable mutation monitoring
  detectMutations: true,
  
  // Which HTML attributes to monitor for changes
  attributeFilter: ['class', 'style', 'id', 'src', 'href'],
  
  // Enable console logging for debugging
  debug: true,
  
  // AGGRESSIVE PROTECTION MODES:
  
  // Continuously trigger debugger when tampering detected (makes editing very difficult)
  debuggerTrap: false,
  
  // Show visible "MODIFIED" labels on tampered content
  showTamperedLabel: false
});
```

## Protection Modes

DOMGuard offers different levels of protection depending on your needs:

### Mode 1: Subtle Markers (Default)

This is the default mode that works silently in the background. When tampering is detected, it applies barely noticeable CSS changes like tiny font size adjustments or letter spacing modifications. These changes are invisible to the naked eye but can be detected through forensic analysis of screenshots.

Best for: General protection where you want evidence of tampering without alerting the user.

### Mode 2: Debugger Trap

This aggressive mode continuously triggers the browser debugger when tampering is detected, making it extremely frustrating to modify content:

```javascript
const guard = new DOMGuard({
  debuggerTrap: true  // Triggers debugger every 100ms when tampering detected
});
```

**What happens:** Anyone trying to modify content will be stuck in debugger pause mode repeatedly. This makes editing nearly impossible and very annoying.

**When to use:** High-security content where you want to actively prevent any tampering attempts. Good for financial dashboards, legal documents, or critical business data.

**Caution:** This will also make legitimate developer tools usage difficult, so only enable it when necessary.

### Mode 3: Visible Tampering Labels

This mode adds bright, blinking "MODIFIED" labels to any content that has been changed:

```javascript
const guard = new DOMGuard({
  showTamperedLabel: true  // Adds visible yellow labels to modified content
});
```

**What happens:** Modified content immediately gets an obvious visual indicator that blinks to draw attention. Anyone looking at a screenshot can instantly tell it was tampered with.

**When to use:** User-facing content where you want tampering to be immediately obvious. Great for testimonials, reviews, ratings, or any content that might be doctored for social proof.

### Mode 4: Maximum Protection (Nuclear Mode)

For the highest level of protection, combine both aggressive modes:

```javascript
const guard = new DOMGuard({
  debuggerTrap: true,
  showTamperedLabel: true  // Both modes active
});
```

**Warning:** This is very aggressive and will significantly interfere with normal browser usage. Only use this for extremely sensitive content that absolutely must not be tampered with.

## API Reference

### forceMarkAll()

Immediately apply markers to all watched elements on the page.

```javascript
guard.forceMarkAll();
```

Use this when you want to proactively mark all content, even if no tampering has been detected yet.

### isElementTampered(element)

Check if a specific element has been modified.

```javascript
const element = document.querySelector('#important-content');
if (guard.isElementTampered(element)) {
  console.log('This element was modified!');
}
```

Returns `true` if the element's content or attributes have changed from the original snapshot.

### getTamperedElements()

Get an array of all elements that have been tampered with.

```javascript
const tampered = guard.getTamperedElements();
console.log(`${tampered.length} elements were modified`);
```

Useful for generating reports or analyzing what has been changed.

### destroy()

Stop all monitoring and remove markers.

```javascript
guard.destroy();
```

Call this when you want to completely disable DOMGuard and clean up all resources.

## How It Works

Understanding how DOMGuard detects and marks tampering can help you use it more effectively.

### DevTools Detection

DOMGuard uses three different methods to detect when browser developer tools are opened:

**Debugger Timing Method**  
Measures how long a debugger statement takes to execute. When DevTools are open, this takes significantly longer.

**Console Detection Method**  
Monitors when the console API is accessed in certain ways that only happen when DevTools are open.

**Window Size Detection Method**  
Checks for discrepancies between the outer window size and inner viewport size, which occur when DevTools panels are open.

By using multiple methods, DOMGuard can reliably detect DevTools even if one method is bypassed.

### DOM Mutation Monitoring

DOMGuard uses the browser's MutationObserver API to watch for changes:

- **Text content changes** - When someone edits the text inside an element
- **Attribute modifications** - When CSS classes, styles, or other attributes are changed
- **Structural changes** - When elements are added or removed from the page
- **HTML alterations** - When the inner HTML structure is modified

Every change is logged and triggers the appropriate response based on your configuration.

### Visual Markers

When tampering is detected, DOMGuard applies subtle CSS modifications that are nearly invisible but provably present:

- Font size adjustments (0.98em instead of 1em)
- Letter spacing changes (adding 0.02em)
- Line height variations (1.01 instead of 1)
- Font weight tweaks (401 instead of 400)
- Word spacing adjustments (adding 0.5px)
- Nearly invisible borders

These changes are:

- **Invisible to casual observers** - Won't be noticed during normal viewing
- **Detectable through analysis** - Can be found through forensic examination
- **Randomized** - Different markers are randomly selected to prevent circumvention
- **Protected** - Applied with `!important` CSS rules to resist removal

## Practical Examples

### Example 1: Basic Page Protection

The simplest implementation to protect an entire page:

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

### Example 2: Server-Side Logging

Log tampering events to your server for security monitoring:

```javascript
const guard = new DOMGuard({
  onTamperDetected: async (event) => {
    // Send tampering event to your server
    await fetch('/api/log-tampering', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: event.type,
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        pageUrl: window.location.href
      })
    });
    
    // Optionally notify the user
    console.warn('Content modification detected and logged');
  }
});
```

### Example 3: Protecting Specific Content

Only monitor specific sections of your page:

```javascript
// Only protect content with specific classes or attributes
const guard = new DOMGuard({
  watchElements: '.protected-content, [data-sensitive]',
  markers: [
    { property: 'fontSize', value: '0.99em' },
    { property: 'opacity', value: '0.999' }
  ]
});
```

### Example 4: Maximum Security Setup

Protect financial data with all available security measures:

```javascript
// Protect financial dashboard with aggressive measures
const guard = new DOMGuard({
  debuggerTrap: true,        // Trigger debugger on tampering attempts
  showTamperedLabel: true,   // Show visible modification labels
  onTamperDetected: (event) => {
    // Log to your security server
    fetch('/api/security-alert', {
      method: 'POST',
      body: JSON.stringify({
        severity: 'high',
        event: event,
        timestamp: new Date().toISOString()
      })
    });
    
    // Alert the user
    alert('SECURITY ALERT: Unauthorized modification detected and logged!');
  }
});
```

## Browser Compatibility

DOMGuard works in all modern browsers:

- Chrome/Edge 51 and above
- Firefox 14 and above
- Safari 10 and above
- Opera 38 and above

The library requires MutationObserver API support, which is available in all browsers released since 2012.

## Limitations and Considerations

While DOMGuard is effective, it's important to understand its limitations:

**Not Foolproof**  
Sophisticated users with enough technical knowledge can potentially bypass these protections. DOMGuard is a deterrent, not absolute security.

**Screenshot Timing**  
Users can take screenshots of original content before making any modifications. DOMGuard only helps detect changes that have already occurred.

**JavaScript Dependency**  
Users who disable JavaScript entirely will bypass all protections. Consider this when deploying on sensitive pages.

**Performance Impact**  
Monitoring the entire page can have a small performance impact on very large or complex pages. Use the `watchElements` option to limit monitoring to specific areas if needed.

**Browser Extensions**  
Some browser extensions may interfere with DOMGuard's detection methods or remove the markers.

## Recommended Best Practices

To get the most out of DOMGuard:

**Layer Your Security**  
Don't rely solely on DOMGuard. Combine it with server-side validation, rate limiting, and other security measures for comprehensive protection.

**Log Everything**  
Always implement the `onTamperDetected` callback to log events to your server. This creates an audit trail and helps you understand tampering patterns.

**Choose the Right Mode**  
Use subtle markers for general content, visible labels for user-submitted content, and debugger trap only for highly sensitive data.

**Add Timestamps**  
Consider adding visible timestamps or watermarks to screenshots in addition to DOMGuard's invisible markers.

**Monitor and Review**  
Regularly review tampering logs to understand if your content is being targeted and adjust your security accordingly.

**Educate Users**  
Make it clear in your terms of service that tampering with content is prohibited and may result in consequences.

## License

This project is released under the MIT License, which means you're free to use it in both personal and commercial projects. See the LICENSE file for complete details.

## Contributing

Contributions are always welcome! If you've found a bug, have a feature request, or want to improve the code, please feel free to:

1. Open an issue to discuss your ideas
2. Submit a pull request with your improvements
3. Report any security vulnerabilities directly to the maintainer

All contributions should maintain the library's focus on simplicity and zero dependencies.

## Contact & Author

**Author:** Mehmet Alp  
**Email:** mehmet.alp@rastmobile.com  
**GitHub Repository:** [https://github.com/mobilerast/domguard](https://github.com/mobilerast/domguard)  
**Website:** [https://rastmobile.com](https://rastmobile.com)

If you find DOMGuard useful, please consider giving it a star on GitHub. Your support helps the project grow and improves web security for everyone.

## Important Security Note

DOMGuard is designed as a deterrent and detection tool, not as absolute protection. Sophisticated users with advanced technical knowledge may find ways to bypass these protections. Think of DOMGuard as one layer in your security strategy, similar to how a lock on a door deters casual theft but won't stop a determined burglar.

Always combine DOMGuard with other security measures such as:
- Server-side validation of all data
- Rate limiting and request monitoring
- User authentication and authorization
- Logging and anomaly detection
- Regular security audits

DOMGuard works best when used as part of a comprehensive approach to web security.
