(function() {
    'use strict';

    // ===== OPTIMIZED CONFIGURATION =====
    const CONFIG = {
        SCRIPT_VERSION: 'XSS-73THv6 "Phoenix-OPTIMIZED"',
        MAX_ERROR_BUDGET: 50,
        STEALTH_DELAY: [50, 150], // Reduced delays
        PHASE_TIMEOUT: 15000, // 15 seconds max per phase
        MAX_ELEMENTS_PER_PHASE: 100,
        BATCH_SIZE: 10,
        INTELLIGENT_RETRY: true
    };

    let findings = [];
    let successFlag = '__XSS73TH_SUCCESS';
    let scanAborted = false;

    const log = (message, isFinding = false) => {
        const style = isFinding ? 'color: #ff6b6b; font-weight: bold;' : 'color: #4ecdc4;';
        console.log(`%c[XSS-OPTIMIZED] ${message}`, style);
        if (isFinding) findings.push(message);
    };

    // ===== ABORT CONTROLLER =====
    class ScanController {
        constructor() {
            this.abortController = new AbortController();
            this.phaseTimeouts = new Map();
        }

        get signal() {
            return this.abortController.signal;
        }

        abort() {
            scanAborted = true;
            this.abortController.abort();
            this.phaseTimeouts.forEach(timeout => clearTimeout(timeout));
            log('Scan aborted by user');
        }

        setTimeout(phaseName, callback) {
            const timeout = setTimeout(() => {
                if (!scanAborted) {
                    log(`Phase ${phaseName} timeout reached - moving to next phase`);
                    callback();
                }
            }, CONFIG.PHASE_TIMEOUT);
            this.phaseTimeouts.set(phaseName, timeout);
        }

        clearTimeout(phaseName) {
            const timeout = this.phaseTimeouts.get(phaseName);
            if (timeout) {
                clearTimeout(timeout);
                this.phaseTimeouts.delete(phaseName);
            }
        }
    }

    // ===== OPTIMIZED PAYLOAD ENGINE =====
    class OptimizedPayloadEngine {
        constructor() {
            this.successHistory = new Map();
            this.contextWeights = new Map();
            this.initializeWeights();
        }

        initializeWeights() {
            this.contextWeights.set('innerHTML', 0.9);
            this.contextWeights.set('outerHTML', 0.8);
            this.contextWeights.set('document.write', 0.7);
            this.contextWeights.set('eval', 0.6);
            this.contextWeights.set('attribute', 0.5);
        }

        getOptimizedPayloads(context) {
            const basePayloads = this.getBasePayloads();
            const contextPayloads = basePayloads[context] || basePayloads.HTML_CONTEXT;
            
            return contextPayloads.sort((a, b) => {
                const aSuccess = this.successHistory.get(a.payload) || 0;
                const bSuccess = this.successHistory.get(b.payload) || 0;
                return bSuccess - aSuccess;
            });
        }

        getBasePayloads() {
            return {
                HTML_CONTEXT: [
                    { payload: `<img src=x onerror="window.${successFlag}=1">`, weight: 0.95 },
                    { payload: `<svg onload="window.${successFlag}=1">`, weight: 0.9 },
                    { payload: `<iframe srcdoc="<img src=x onerror='top.${successFlag}=1'>">`, weight: 0.85 },
                    { payload: `<div data-xss="</div><script>window.${successFlag}=1</script>">`, weight: 0.8 }
                ],
                ATTRIBUTE_CONTEXT: [
                    { payload: `" onfocus="window.${successFlag}=1" autofocus="`, weight: 0.9 },
                    { payload: `' onmouseenter="window.${successFlag}=1" '`, weight: 0.85 },
                    { payload: `" onload="window.${successFlag}=1" `, weight: 0.8 },
                    { payload: `javascript:window.${successFlag}=1`, weight: 0.7 }
                ]
            };
        }

        recordSuccess(payload) {
            const current = this.successHistory.get(payload) || 0;
            this.successHistory.set(payload, current + 1);
        }
    }

    // ===== OPTIMIZED STEALTH ENGINE =====
    class OptimizedStealthEngine {
        constructor() {
            this.requestCount = 0;
            this.lastRequestTime = 0;
        }

        async randomDelay() {
            const delay = CONFIG.STEALTH_DELAY[0] + 
                         Math.random() * (CONFIG.STEALTH_DELAY[1] - CONFIG.STEALTH_DELAY[0]);
            return new Promise(resolve => setTimeout(resolve, delay));
        }

        async throttleRequests() {
            const now = Date.now();
            if (now - this.lastRequestTime < 50) { // Reduced from 100ms
                await this.randomDelay();
            }
            this.lastRequestTime = now;
            this.requestCount++;
        }

        async batchDelay() {
            // Only delay between batches, not individual operations
            await this.randomDelay();
        }
    }

    // ===== INTELLIGENT ELEMENT SELECTOR =====
    class IntelligentElementSelector {
        static getRelevantElements() {
            const selectors = [
                // High-value targets
                'input[type="text"]',
                'input[type="search"]',
                'input[type="url"]',
                'input[type="email"]',
                'textarea',
                '[contenteditable="true"]',
                
                // Form elements
                'input:not([type])',
                'select',
                
                // Elements with common framework bindings
                '[data-bind]',
                '[data-model]',
                '[ng-model]',
                '[v-model]',
                
                // Elements with user content
                '[data-content]',
                '[data-text]'
            ];

            const elements = new Set();
            
            // Use sampling for large DOMs
            selectors.forEach(selector => {
                try {
                    const found = document.querySelectorAll(selector);
                    const maxPerSelector = Math.ceil(CONFIG.MAX_ELEMENTS_PER_PHASE / selectors.length);
                    
                    if (found.length <= maxPerSelector) {
                        found.forEach(el => elements.add(el));
                    } else {
                        // Sample if too many elements
                        for (let i = 0; i < maxPerSelector; i++) {
                            const randomIndex = Math.floor(Math.random() * found.length);
                            elements.add(found[randomIndex]);
                        }
                    }
                } catch (e) {
                    // Skip invalid selectors
                }
            });

            const elementArray = Array.from(elements);
            
            // Prioritize visible elements
            elementArray.sort((a, b) => {
                const aVisible = this.isElementVisible(a);
                const bVisible = this.isElementVisible(b);
                if (aVisible && !bVisible) return -1;
                if (!aVisible && bVisible) return 1;
                return 0;
            });

            return elementArray.slice(0, CONFIG.MAX_ELEMENTS_PER_PHASE);
        }

        static isElementVisible(element) {
            const style = window.getComputedStyle(element);
            return style.display !== 'none' && 
                   style.visibility !== 'hidden' && 
                   style.opacity !== '0' &&
                   element.offsetWidth > 0 && 
                   element.offsetHeight > 0;
        }

        static getRelevantAttributes(element) {
            const tagName = element.tagName.toLowerCase();
            const baseAttributes = ['value', 'title', 'placeholder', 'alt', 'data-custom'];
            
            const tagSpecific = {
                'input': ['value', 'placeholder', 'title', 'data-*'],
                'textarea': ['value', 'placeholder', 'title'],
                'img': ['src', 'alt', 'title'],
                'a': ['href', 'title'],
                'div': ['title', 'data-*', 'aria-*'],
                'span': ['title', 'data-*']
            };

            return tagSpecific[tagName] || baseAttributes;
        }
    }

    // ===== OPTIMIZED TESTING PHASES =====
    class OptimizedTestingPhases {
        constructor(payloadEngine, stealthEngine, scanController) {
            this.payloadEngine = payloadEngine;
            this.stealth = stealthEngine;
            this.scanController = scanController;
        }

        async testDirectInjection() {
            log('Testing direct HTML injection vectors...');
            
            this.scanController.setTimeout('direct_injection', () => {
                throw new Error('Direct injection phase timeout');
            });

            try {
                const payloads = this.payloadEngine.getOptimizedPayloads('HTML_CONTEXT');
                
                for (const { payload } of payloads) {
                    if (this.scanController.signal.aborted) return;
                    
                    await this.stealth.throttleRequests();
                    
                    try {
                        const container = document.createElement('div');
                        container.style.cssText = 'display: none !important; position: absolute !important; left: -9999px !important;';
                        document.body.appendChild(container);
                        
                        // Test injection methods
                        container.innerHTML = payload;
                        await this.stealth.randomDelay();
                        
                        if (window[successFlag]) {
                            log(`*** XSS CONFIRMED via innerHTML: ${payload.substring(0, 50)}...`, true);
                            this.payloadEngine.recordSuccess(payload);
                            delete window[successFlag];
                        }
                        
                        // Test outerHTML
                        container.outerHTML = payload;
                        await this.stealth.randomDelay();
                        
                        if (window[successFlag]) {
                            log(`*** XSS CONFIRMED via outerHTML: ${payload.substring(0, 50)}...`, true);
                            this.payloadEngine.recordSuccess(payload);
                            delete window[successFlag];
                        }
                        
                        // Cleanup
                        if (container.parentNode) {
                            container.parentNode.removeChild(container);
                        }
                    } catch (error) {
                        // Expected for some payloads
                    }
                }
            } finally {
                this.scanController.clearTimeout('direct_injection');
            }
        }

        async testDynamicAttributes() {
            log('Testing dynamic attribute injection...');
            
            this.scanController.setTimeout('attribute_injection', () => {
                throw new Error('Attribute injection phase timeout');
            });

            try {
                const elements = IntelligentElementSelector.getRelevantElements();
                log(`Testing ${elements.length} relevant elements (optimized selection)`);
                
                if (elements.length === 0) {
                    log('No relevant elements found for attribute testing');
                    return;
                }

                const payloads = this.payloadEngine.getOptimizedPayloads('ATTRIBUTE_CONTEXT');
                let processed = 0;

                // Process in batches
                for (let i = 0; i < elements.length; i += CONFIG.BATCH_SIZE) {
                    if (this.scanController.signal.aborted) return;
                    
                    const batch = elements.slice(i, i + CONFIG.BATCH_SIZE);
                    
                    // Process batch with minimal delays
                    await Promise.all(batch.map(async (element) => {
                        if (this.scanController.signal.aborted) return;
                        
                        await this.testSingleElementAttributes(element, payloads);
                        processed++;
                        
                        // Progress reporting
                        if (processed % 10 === 0) {
                            log(`Attribute testing progress: ${processed}/${elements.length}`);
                        }
                    }));
                    
                    // Single delay between batches only
                    await this.stealth.batchDelay();
                }
                
                log(`Completed attribute testing on ${processed} elements`);
            } finally {
                this.scanController.clearTimeout('attribute_injection');
            }
        }

        async testSingleElementAttributes(element, payloads) {
            const attributes = IntelligentElementSelector.getRelevantAttributes(element);
            
            for (const { payload } of payloads.slice(0, 2)) {
                if (this.scanController.signal.aborted) return;
                
                for (const attr of attributes) {
                    if (this.scanController.signal.aborted) return;
                    
                    try {
                        const original = element.getAttribute(attr);
                        
                        // Set payload
                        element.setAttribute(attr, payload);
                        
                        // Trigger events (no delays between events)
                        const events = ['focus', 'mouseover', 'click'];
                        events.forEach(eventType => {
                            element.dispatchEvent(new Event(eventType, { bubbles: true }));
                        });
                        
                        // Single consolidated delay per attribute
                        await this.stealth.randomDelay();
                        
                        if (window[successFlag]) {
                            log(`*** XSS CONFIRMED via ${element.tagName}.${attr}`, true);
                            this.payloadEngine.recordSuccess(payload);
                            delete window[successFlag];
                        }
                        
                        // Restore original value
                        if (original !== null) {
                            element.setAttribute(attr, original);
                        } else {
                            element.removeAttribute(attr);
                        }
                        
                    } catch (error) {
                        // Skip elements that throw errors
                        break;
                    }
                }
            }
        }

        async testURLReflection() {
            log('Testing URL parameter reflection...');
            
            this.scanController.setTimeout('url_reflection', () => {
                throw new Error('URL reflection phase timeout');
            });

            try {
                const url = new URL(window.location.href);
                const params = Array.from(url.searchParams.entries());
                const payloads = this.payloadEngine.getOptimizedPayloads('HTML_CONTEXT');
                const originalURL = window.location.href;

                if (params.length === 0) {
                    log('No URL parameters found to test');
                    return;
                }

                for (const [key, originalValue] of params) {
                    if (this.scanController.signal.aborted) return;
                    
                    for (const { payload } of payloads.slice(0, 2)) {
                        if (this.scanController.signal.aborted) return;
                        
                        await this.stealth.throttleRequests();
                        
                        url.searchParams.set(key, payload);
                        window.history.replaceState(null, '', url.toString());
                        
                        // Trigger potential execution contexts
                        if (key === 'hash' || payload.includes('#')) {
                            window.dispatchEvent(new Event('hashchange'));
                        }
                        
                        window.dispatchEvent(new Event('popstate'));
                        
                        await this.stealth.randomDelay();
                        
                        if (window[successFlag]) {
                            log(`*** XSS CONFIRMED via URL parameter: ${key}`, true);
                            this.payloadEngine.recordSuccess(payload);
                            delete window[successFlag];
                        }
                        
                        // Restore immediately
                        url.searchParams.set(key, originalValue);
                    }
                }
                
                // Final restore
                window.history.replaceState(null, '', originalURL);
            } finally {
                this.scanController.clearTimeout('url_reflection');
            }
        }
    }

    // ===== OPTIMIZED MAIN EXECUTION CONTROLLER =====
    const executeOptimizedScan = async () => {
        log(`Initializing ${CONFIG.SCRIPT_VERSION} - Optimized XSS Scanner`);
        
        const scanController = new ScanController();
        const payloadEngine = new OptimizedPayloadEngine();
        const stealthEngine = new OptimizedStealthEngine();
        const testingPhases = new OptimizedTestingPhases(payloadEngine, stealthEngine, scanController);

        // Global abort handler
        window.__XSS_ABORT = () => scanController.abort();

        try {
            await testingPhases.testDirectInjection();
            if (scanController.signal.aborted) return;
            
            await testingPhases.testDynamicAttributes();
            if (scanController.signal.aborted) return;
            
            await testingPhases.testURLReflection();

            // Final report
            log('=== OPTIMIZED SCAN COMPLETE ===');
            log(`Total Vulnerabilities Found: ${findings.length}`);
            log(`Scan Status: ${scanAborted ? 'ABORTED' : 'COMPLETED'}`);
            
            if (findings.length > 0) {
                log('=== VULNERABILITY REPORT ===', true);
                findings.forEach((finding, index) => {
                    log(`${index + 1}. ${finding}`, true);
                });
            }

        } catch (error) {
            if (!scanAborted) {
                log(`Scan interrupted: ${error.message}`, false);
            }
        }
    };

    // Initialize with abort capability
    const scanTimeout = setTimeout(executeOptimizedScan, 1000 + Math.random() * 2000);
    
    // Export abort function
    window.__XSS_OPTIMIZED_ABORT = () => {
        clearTimeout(scanTimeout);
        scanAborted = true;
        log('Scan aborted before start');
    };
})();
