/**
 * DOMGuard - A library to detect and mark DOM tampering
 * Prevents fraudulent screenshots by adding subtle visual markers when content is modified
 */

(function(window) {
    'use strict';

    class DOMGuard {
        constructor(options = {}) {
            this.options = {
                // Subtle visual markers to apply when tampering detected
                markers: options.markers || [
                    { property: 'fontSize', value: '0.98em' },
                    { property: 'letterSpacing', value: '0.02em' },
                    { property: 'lineHeight', value: '1.01' },
                    { property: 'fontWeight', value: '401' },
                    { property: 'wordSpacing', value: '0.5px' }
                ],
                // Elements to monitor (default: all text-containing elements)
                watchElements: options.watchElements || 'body *',
                // Callback when tampering detected
                onTamperDetected: options.onTamperDetected || null,
                // Enable devtools detection
                detectDevTools: options.detectDevTools !== false,
                // Check interval for devtools (ms)
                devToolsCheckInterval: options.devToolsCheckInterval || 1000,
                // Enable mutation monitoring
                detectMutations: options.detectMutations !== false,
                // Attributes to monitor
                attributeFilter: options.attributeFilter || ['class', 'style', 'id', 'src', 'href'],
                // Debug mode
                debug: options.debug || false,
                // Debugger trap mode - continuously trigger debugger on tampering
                debuggerTrap: options.debuggerTrap || false,
                // Show visible "MODIFIED" label on tampered content
                showTamperedLabel: options.showTamperedLabel || false
            };

            this.isDevToolsOpen = false;
            this.observer = null;
            this.devToolsInterval = null;
            this.originalContent = new Map();
            this.tamperedElements = new Set();
            this.markerClass = 'tamper-detected-' + Date.now();
            this.debuggerTrapActive = false;
            this.debuggerTrapInterval = null;
            this.labelMap = new Map(); // Track labels per element
            this.labelCheckInterval = null;
            
            this.init();
        }

        init() {
            this.log('DOMGuard initialized');
            
            // Store original content snapshots
            this.snapshotContent();
            
            // Start devtools detection
            if (this.options.detectDevTools) {
                this.startDevToolsDetection();
            }
            
            // Start mutation monitoring
            if (this.options.detectMutations) {
                this.startMutationMonitoring();
            }
            
            // Inject marker styles
            this.injectStyles();
            
            // Start label protection if visible labels enabled
            if (this.options.showTamperedLabel) {
                this.startLabelProtection();
            }
        }

        snapshotContent() {
            const elements = document.querySelectorAll(this.options.watchElements);
            elements.forEach(el => {
                if (el.textContent.trim()) {
                    this.originalContent.set(el, {
                        text: el.textContent,
                        html: el.innerHTML,
                        attributes: this.getElementAttributes(el)
                    });
                }
            });
            this.log(`Snapshotted ${this.originalContent.size} elements`);
        }

        getElementAttributes(element) {
            const attrs = {};
            for (let attr of element.attributes) {
                attrs[attr.name] = attr.value;
            }
            return attrs;
        }

        startDevToolsDetection() {
            // Method 1: Debugger timing
            const checkDevTools = () => {
                const threshold = 100;
                const start = performance.now();
                debugger; // eslint-disable-line no-debugger
                const end = performance.now();
                
                const wasOpen = this.isDevToolsOpen;
                this.isDevToolsOpen = (end - start) > threshold;
                
                if (!wasOpen && this.isDevToolsOpen) {
                    this.log('DevTools opened');
                    this.onDevToolsOpened();
                }
            };

            // Method 2: Console detection
            const consoleCheck = () => {
                const element = new Image();
                Object.defineProperty(element, 'id', {
                    get: () => {
                        this.isDevToolsOpen = true;
                        this.onDevToolsOpened();
                    }
                });
                console.log(element);
            };

            // Method 3: Window size detection
            const sizeCheck = () => {
                const widthThreshold = window.outerWidth - window.innerWidth > 160;
                const heightThreshold = window.outerHeight - window.innerHeight > 160;
                
                if (widthThreshold || heightThreshold) {
                    this.isDevToolsOpen = true;
                    this.onDevToolsOpened();
                }
            };

            this.devToolsInterval = setInterval(() => {
                try {
                    checkDevTools();
                    sizeCheck();
                } catch (e) {
                    // DevTools might block debugger
                    this.isDevToolsOpen = true;
                    this.onDevToolsOpened();
                }
            }, this.options.devToolsCheckInterval);
        }

        onDevToolsOpened() {
            this.log('DevTools detected - Monitoring for tampering');
            if (this.options.onTamperDetected) {
                this.options.onTamperDetected({
                    type: 'devtools',
                    message: 'Developer tools opened'
                });
            }
        }

        startMutationMonitoring() {
            this.observer = new MutationObserver((mutations) => {
                mutations.forEach((mutation) => {
                    this.handleMutation(mutation);
                });
            });

            this.observer.observe(document.body, {
                childList: true,
                subtree: true,
                characterData: true,
                characterDataOldValue: true,
                attributes: true,
                attributeOldValue: true,
                attributeFilter: this.options.attributeFilter
            });

            this.log('Mutation monitoring started');
        }

        handleMutation(mutation) {
            let tampered = false;
            const target = mutation.target;
            
            // Ignore mutations on our own labels
            if (target.classList && target.classList.contains('domguard-tampered-label')) {
                return;
            }
            if (target.parentElement && target.parentElement.classList && 
                target.parentElement.classList.contains('domguard-tampered-label')) {
                return;
            }

            // Check character data changes (text content)
            if (mutation.type === 'characterData') {
                if (mutation.oldValue && mutation.oldValue !== target.textContent) {
                    tampered = true;
                    this.log('Text content modified', target);
                }
            }

            // Check attribute changes
            if (mutation.type === 'attributes') {
                const element = mutation.target;
                const attributeName = mutation.attributeName;
                const oldValue = mutation.oldValue;
                const newValue = element.getAttribute(attributeName);

                if (oldValue !== newValue) {
                    tampered = true;
                    this.log(`Attribute "${attributeName}" modified on`, element);
                }
            }

            // Check for added/removed nodes
            if (mutation.type === 'childList') {
                // Check if someone removed a MODIFIED label
                mutation.removedNodes.forEach(node => {
                    if (node.classList && node.classList.contains('domguard-tampered-label')) {
                        // Label was removed! Re-add it immediately
                        const parentElement = mutation.target;
                        this.log('MODIFIED label removal detected! Re-adding...', parentElement);
                        setTimeout(() => this.addTamperedLabel(parentElement), 10);
                        
                        // Activate debugger trap if enabled
                        if (this.options.debuggerTrap && !this.debuggerTrapActive) {
                            this.activateDebuggerTrap();
                        }
                        return;
                    }
                });
                
                if (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0) {
                    tampered = true;
                    this.log('DOM structure modified', mutation);
                }
            }

            if (tampered) {
                this.markTampering(target.nodeType === 1 ? target : target.parentElement);
                
                // Activate debugger trap if enabled
                if (this.options.debuggerTrap && !this.debuggerTrapActive) {
                    this.activateDebuggerTrap();
                }
            }
        }

        activateDebuggerTrap() {
            if (this.debuggerTrapActive) return;
            
            this.debuggerTrapActive = true;
            this.log('🚨 DEBUGGER TRAP ACTIVATED - Tampering detected!');
            
            // Continuously trigger debugger to annoy the user
            this.debuggerTrapInterval = setInterval(() => {
                debugger; // eslint-disable-line no-debugger
            }, 100);
            
            // Also trigger immediately
            debugger; // eslint-disable-line no-debugger
        }

        deactivateDebuggerTrap() {
            if (this.debuggerTrapInterval) {
                clearInterval(this.debuggerTrapInterval);
                this.debuggerTrapInterval = null;
            }
            this.debuggerTrapActive = false;
            this.log('Debugger trap deactivated');
        }

        markTampering(element) {
            if (!element || this.tamperedElements.has(element)) {
                return;
            }

            this.tamperedElements.add(element);
            element.classList.add(this.markerClass);
            
            // Add visible "MODIFIED" label if enabled
            if (this.options.showTamperedLabel) {
                this.addTamperedLabel(element);
            }

            this.log('Tampering detected - Applied markers to', element);

            if (this.options.onTamperDetected) {
                this.options.onTamperDetected({
                    type: 'mutation',
                    element: element,
                    message: 'Content tampering detected'
                });
            }

            // Also mark parent elements for visibility
            let parent = element.parentElement;
            let depth = 0;
            while (parent && depth < 3) {
                if (!this.tamperedElements.has(parent)) {
                    this.tamperedElements.add(parent);
                    parent.classList.add(this.markerClass);
                }
                parent = parent.parentElement;
                depth++;
            }
        }

        addTamperedLabel(element) {
            // Don't add label if already has one
            const existingLabel = element.querySelector('.domguard-tampered-label');
            if (existingLabel) {
                return;
            }
            
            const label = document.createElement('span');
            label.className = 'domguard-tampered-label';
            label.textContent = ' [MODIFIED]';
            label.setAttribute('data-domguard-protected', 'true');
            
            // Make it completely uneditable
            Object.defineProperty(label, 'textContent', {
                writable: false,
                configurable: false
            });
            
            label.style.cssText = `
                color: red !important;
                font-weight: bold !important;
                font-size: 0.8em !important;
                background: yellow !important;
                padding: 2px 6px !important;
                border-radius: 3px !important;
                margin-left: 5px !important;
                display: inline-block !important;
                animation: domguard-blink 1s infinite !important;
            `;
            
            // Insert label after element content
            if (element.childNodes.length > 0) {
                const lastChild = element.childNodes[element.childNodes.length - 1];
                if (lastChild.nodeType === 3) { // Text node
                    element.appendChild(label);
                } else {
                    element.insertBefore(label, element.firstChild);
                }
            } else {
                element.appendChild(label);
            }
            
            // Store reference to label
            this.labelMap.set(element, label);
            
            this.log('Added visible MODIFIED label to', element);
        }
        
        startLabelProtection() {
            // Periodically check and restore labels if removed
            this.labelCheckInterval = setInterval(() => {
                this.labelMap.forEach((label, element) => {
                    // Check if label still exists in DOM
                    if (!element.contains(label)) {
                        this.log('Label removed from', element, '- Re-adding immediately!');
                        this.addTamperedLabel(element);
                    }
                });
            }, 100); // Check every 100ms
        }

        injectStyles() {
            const style = document.createElement('style');
            style.id = 'tamper-detect-styles';
            
            // Create subtle, hard-to-notice markers
            let css = `.${this.markerClass} {\n`;
            
            // Randomly select markers to apply
            const selectedMarkers = this.getRandomMarkers();
            selectedMarkers.forEach(marker => {
                css += `  ${this.camelToKebab(marker.property)}: ${marker.value} !important;\n`;
            });
            
            // Add a very subtle border that's hard to see
            css += `  outline: 0.5px solid rgba(0, 0, 0, 0.01) !important;\n`;
            css += `}\n`;
            
            // Add blink animation for visible labels
            css += `
@keyframes domguard-blink {
  0%, 50%, 100% { opacity: 1; }
  25%, 75% { opacity: 0.5; }
}

.domguard-tampered-label {
  pointer-events: none !important;
  user-select: none !important;
  -webkit-user-select: none !important;
  -moz-user-select: none !important;
  z-index: 999999 !important;
  position: relative !important;
}

.domguard-tampered-label::before {
  content: attr(data-domguard-protected) !important;
  display: none !important;
}
`;

            style.textContent = css;
            document.head.appendChild(style);
            
            this.log('Marker styles injected');
        }

        getRandomMarkers() {
            // Select 2-3 random markers to make detection harder
            const count = Math.floor(Math.random() * 2) + 2;
            const shuffled = [...this.options.markers].sort(() => 0.5 - Math.random());
            return shuffled.slice(0, count);
        }

        camelToKebab(str) {
            return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
        }

        // Force apply markers to all elements (nuclear option)
        forceMarkAll() {
            const elements = document.querySelectorAll(this.options.watchElements);
            elements.forEach(el => {
                this.markTampering(el);
            });
            this.log('Force marked all elements');
        }

        // Check if specific element has been tampered
        isElementTampered(element) {
            const original = this.originalContent.get(element);
            if (!original) return false;

            const currentText = element.textContent;
            const currentHTML = element.innerHTML;
            const currentAttrs = this.getElementAttributes(element);

            return (
                original.text !== currentText ||
                original.html !== currentHTML ||
                JSON.stringify(original.attributes) !== JSON.stringify(currentAttrs)
            );
        }

        // Get all tampered elements
        getTamperedElements() {
            return Array.from(this.tamperedElements);
        }

        // Destroy the detector
        destroy() {
            if (this.observer) {
                this.observer.disconnect();
            }
            if (this.devToolsInterval) {
                clearInterval(this.devToolsInterval);
            }
            if (this.debuggerTrapInterval) {
                clearInterval(this.debuggerTrapInterval);
            }
            if (this.labelCheckInterval) {
                clearInterval(this.labelCheckInterval);
            }
            const styleEl = document.getElementById('tamper-detect-styles');
            if (styleEl) {
                styleEl.remove();
            }
            this.log('DOMGuard destroyed');
        }

        log(...args) {
            if (this.options.debug) {
                console.log('[DOMGuard]', ...args);
            }
        }
    }

    // Expose to window
    window.DOMGuard = DOMGuard;

    // Auto-initialize if data attribute present
    if (document.querySelector('[data-domguard]')) {
        document.addEventListener('DOMContentLoaded', () => {
            window.domguard = new DOMGuard({
                debug: true
            });
        });
    }

})(window);
