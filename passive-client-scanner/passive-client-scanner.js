/**
 * passive-client-scanner.js
 *
 * Safe, passive client-side vulnerability pattern scanner.
 * - Read-only inspection of the DOM (no payloads, no DOM mutation)
 * - Static analysis helpers for HTML/JS strings (no network activity)
 * - Produces a JSON-style report of suspicious patterns (innerHTML, eval, inline scripts, inline events, javascript: URIs)
 *
 * Usage (Browser console):
 *   1) Open a safe, authorized test page (local file or dev server).
 *   2) Open DevTools -> Console and paste this script or include it as a dev-only script.
 *   3) Run: PassiveClientScanner.scanDom()  // returns array of findings
 *
 * Usage (Node.js - analyze a file string):
 *   const PassiveClientScanner = require('./passive-client-scanner');
 *   const fs = require('fs');
 *   const html = fs.readFileSync('sample.html','utf8');
 *   const report = PassiveClientScanner.scanHtmlString(html);
 *   console.log(report);
 */

(function (global) {
  'use strict';

  const SEVERITY = { INFO: 'INFO', WARNING: 'WARNING', HIGH: 'HIGH' };

  function excerpt(s, len = 140) {
    if (!s) return '';
    return s.length <= len ? s : (s.slice(0, len) + '...');
  }

  function detectHtmlPatterns(htmlText) {
    const findings = [];
    if (!htmlText || typeof htmlText !== 'string') return findings;

    // Inline <script> blocks without src
    const inlineScriptRegex = /<script\b(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = inlineScriptRegex.exec(htmlText)) !== null) {
      findings.push({
        type: 'InlineScript',
        severity: SEVERITY.HIGH,
        excerpt: excerpt(m[0]),
        explanation: 'Inline <script> blocks can increase XSS risk if they operate on untrusted input.'
      });
    }

    // innerHTML usage
    const innerHTMLRegex = /innerHTML\s*=|\.innerHTML\s*=|innerHTML\s*\+/gi;
    if (innerHTMLRegex.test(htmlText)) {
      findings.push({
        type: 'innerHTMLUsage',
        severity: SEVERITY.HIGH,
        excerpt: 'innerHTML assignment detected',
        explanation: 'Assigning HTML via innerHTML can introduce XSS if the content is not sanitized.'
      });
    }

    // document.write
    const docWriteRegex = /document\.write|document\.writeln/gi;
    if (docWriteRegex.test(htmlText)) {
      findings.push({
        type: 'documentWrite',
        severity: SEVERITY.WARNING,
        excerpt: 'document.write usage detected',
        explanation: 'document.write may produce injection points; prefer safer APIs.'
      });
    }

    // inline event handlers like onclick="..."
    const inlineEventRegex = /\son[a-z]+\s*=\s*['"][^'"]+['"]/gi;
    while ((m = inlineEventRegex.exec(htmlText)) !== null) {
      findings.push({
        type: 'InlineEventHandler',
        severity: SEVERITY.WARNING,
        excerpt: excerpt(m[0], 120),
        explanation: 'Inline event handlers can contain dynamic code; prefer addEventListener and avoid inline JS.'
      });
    }

    // javascript: URIs
    const jsUriRegex = /(href|src)\s*=\s*['"]\s*javascript:/gi;
    if (jsUriRegex.test(htmlText)) {
      findings.push({
        type: 'javascriptURI',
        severity: SEVERITY.HIGH,
        excerpt: 'javascript: URI detected',
        explanation: 'javascript: URIs execute code and are high risk.'
      });
    }

    return findings;
  }

  function detectJsPatterns(jsText) {
    const findings = [];
    if (!jsText || typeof jsText !== 'string') return findings;

    // eval usage
    const evalRegex = /\beval\s*\(/gi;
    if (evalRegex.test(jsText)) {
      findings.push({
        type: 'evalUsage',
        severity: SEVERITY.HIGH,
        excerpt: 'eval() usage found',
        explanation: 'eval() executes strings as code and is dangerous.'
      });
    }

    // Function constructor
    const funcCtorRegex = /new\s+Function\s*\(/gi;
    if (funcCtorRegex.test(jsText)) {
      findings.push({
        type: 'FunctionConstructor',
        severity: SEVERITY.HIGH,
        excerpt: 'Function constructor usage detected',
        explanation: 'Function constructor executes string code; avoid.'
      });
    }

    // innerHTML in JS text
    const innerHTMLRegex = /innerHTML\s*=|\.innerHTML\s*=|innerHTML\s*\+/gi;
    if (innerHTMLRegex.test(jsText)) {
      findings.push({
        type: 'innerHTMLInJs',
        severity: SEVERITY.HIGH,
        excerpt: 'innerHTML assignment in JS',
        explanation: 'Assigning to innerHTML in scripts is risky without sanitization.'
      });
    }

    // simple SQL-like heuristics
    const sqlLikeRegex = /\b(SELECT|INSERT|UPDATE|DELETE)\b\s+.+\bFROM\b/gi;
    if (sqlLikeRegex.test(jsText)) {
      findings.push({
        type: 'SqlLikeString',
        severity: SEVERITY.WARNING,
        excerpt: excerpt(jsText.match(sqlLikeRegex)[0] || '', 140),
        explanation: 'SQL-like strings may indicate client-side concatenation of queries; parameterize server-side.'
      });
    }

    return findings;
  }

  function inspectDomReadOnly() {
    const findings = [];
    try {
      // Inline scripts in DOM
      const inlineScripts = Array.from(document.querySelectorAll('script:not([src])'));
      inlineScripts.forEach(s => {
        findings.push({
          type: 'InlineScript_DOM',
          severity: SEVERITY.HIGH,
          excerpt: excerpt(s.textContent, 200),
          explanation: 'Inline script element found in DOM.'
        });
      });

      // Inline event handler attributes
      const all = Array.from(document.querySelectorAll('*'));
      all.forEach(el => {
        for (let i = 0; i < el.attributes.length; i++) {
          const attr = el.attributes[i];
          if (/^on[a-z]+$/i.test(attr.name)) {
            findings.push({
              type: 'InlineEvent_DOM',
              severity: SEVERITY.WARNING,
              excerpt: `${el.tagName}[${attr.name}]=${excerpt(attr.value,120)}`,
              explanation: 'Element has inline event handler attribute.'
            });
          }
        }
      });

      // javascript: hrefs
      const anchors = Array.from(document.querySelectorAll('a[href]'));
      anchors.forEach(a => {
        const v = (a.getAttribute('href') || '').trim().toLowerCase();
        if (v.startsWith('javascript:')) {
          findings.push({
            type: 'JavascriptHref_DOM',
            severity: SEVERITY.HIGH,
            excerpt: excerpt(a.outerHTML, 200),
            explanation: 'Found anchor with javascript: href.'
          });
        }
      });

      // data: images info
      const imgs = Array.from(document.querySelectorAll('img[src]'));
      imgs.forEach(img => {
        const src = (img.getAttribute('src') || '').trim().toLowerCase();
        if (src.startsWith('data:')) {
          findings.push({
            type: 'DataUriImage',
            severity: SEVERITY.INFO,
            excerpt: excerpt(img.outerHTML, 200),
            explanation: 'Image uses data: URI — review if user-controlled.'
          });
        }
      });

    } catch (e) {
      findings.push({ type: 'InspectError', severity: SEVERITY.INFO, excerpt: String(e), explanation: 'DOM inspection may have failed (cross-origin frames).' });
    }
    return findings;
  }

  const PassiveClientScanner = {
    scanHtmlString: function (html) {
      return detectHtmlPatterns(html).concat(detectJsPatterns(html));
    },
    scanJsString: function (js) {
      return detectJsPatterns(js);
    },
    scanDom: function () {
      if (typeof document === 'undefined') throw new Error('scanDom requires a browser environment');
      return inspectDomReadOnly();
    },
    severityLevels: SEVERITY
  };

  if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
    module.exports = PassiveClientScanner;
  } else {
    global.PassiveClientScanner = PassiveClientScanner;
  }

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : this));
