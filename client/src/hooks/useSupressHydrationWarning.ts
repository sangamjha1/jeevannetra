import { useEffect } from 'react';

/**
 * Suppress hydration mismatch warnings caused by browser extensions
 * These extensions (Biometric, antivirus, etc.) inject attributes into the DOM
 * after React hydration, causing false positive hydration mismatches.
 */
export function useSuppressHydrationWarning() {
  useEffect(() => {
    // Store original error and warn functions
    const originalError = console.error;
    const originalWarn = console.warn;

    // Extension patterns commonly injected by browser extensions/security software
    const extensionPatterns = [
      'bis_skin_checked',        // Windows Defender/Security Essentials
      'fdprocessedid',           // Form detection extensions
      'data-extension',          // Generic extension marker
      'browser extension',       // Generic extension reference
      'moz-extension',           // Firefox extensions
      'chrome-extension',        // Chrome extensions
      'webextension',            // Generic web extension
      'data-chrome-extension',   // Chrome extension data
    ];

    const isExtensionRelatedError = (errorString: string): boolean => {
      return extensionPatterns.some(pattern => errorString.includes(pattern));
    };

    const isHydrationError = (errorString: string): boolean => {
      return (
        errorString.includes('hydration failed') ||
        errorString.includes('hydrated but some attributes') ||
        errorString.includes('tree hydrated') ||
        errorString.includes('hydration mismatch') ||
        errorString.includes('text content does not match')
      );
    };

    // Override console.error to filter hydration warnings
    console.error = (...args: any[]) => {
      const errorString = args
        .map(arg => {
          if (typeof arg === 'string') return arg;
          if (arg && typeof arg === 'object') return JSON.stringify(arg);
          return String(arg || '');
        })
        .join(' ')
        .toLowerCase();

      // Suppress if it's a hydration error from a browser extension
      if (isHydrationError(errorString) && isExtensionRelatedError(errorString)) {
        console.log('[Hydration] Browser extension hydration mismatch suppressed - this is not a real error');
        return;
      }

      // For all other errors, call the original console.error
      originalError.apply(console, args);
    };

    // Also override console.warn for good measure
    console.warn = (...args: any[]) => {
      const warnString = args
        .map(arg => {
          if (typeof arg === 'string') return arg;
          if (arg && typeof arg === 'object') return JSON.stringify(arg);
          return String(arg || '');
        })
        .join(' ')
        .toLowerCase();

      // Suppress hydration warnings from extensions
      if (isHydrationError(warnString) && isExtensionRelatedError(warnString)) {
        return;
      }

      // For all other warnings, call the original console.warn
      originalWarn.apply(console, args);
    };

    return () => {
      // Restore original functions on cleanup
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);
}

