import { useEffect } from 'react';

/**
 * Suppress hydration mismatch warnings caused by browser extensions
 * These extensions (Biometric, antivirus, etc.) inject attributes into the DOM
 * after React hydration, causing false positive hydration mismatches.
 */
export function useSuppressHydrationWarning() {
  useEffect(() => {
    // Store original error function
    const originalError = console.error;

    // Override console.error to filter hydration warnings
    console.error = (...args: any[]) => {
      // Check all arguments for hydration/extension patterns
      const errorString = args
        .map(arg => {
          if (typeof arg === 'string') return arg;
          if (arg && typeof arg === 'object') return JSON.stringify(arg);
          return String(arg || '');
        })
        .join(' ')
        .toLowerCase();
      
      // Suppress hydration mismatch errors that mention browser extension attributes
      // Common attributes injected by extensions:
      // - bis_skin_checked (Bing IS extension, Windows antivirus integration)
      // - fdprocessedid (Form detection)
      // - _ngcontent (Angular related)
      // - data-extension (Generic extension marker)
      // - _react_event (React internals can differ)
      const extensionPatterns = [
        'bis_skin_checked',
        'fdprocessedid',
        'data-extension',
        'browser extension',
        'moz-extension',
        'chrome-extension',
      ];

      const isExtensionError = extensionPatterns.some(pattern => 
        errorString.includes(pattern)
      );

      const isHydrationError = 
        errorString.includes('hydration failed') || 
        errorString.includes('hydrated but some attributes') ||
        errorString.includes('tree hydrated') ||
        errorString.includes('hydration mismatch');

      // Suppress if it's a hydration error from a browser extension
      if (isHydrationError && isExtensionError) {
        if (typeof window !== 'undefined') {
          console.log('[Hydration] Suppressed browser extension hydration mismatch: ' + args[0]);
        }
        return;
      }

      // For all other errors, call the original console.error
      originalError.apply(console, args);
    };

    return () => {
      // Restore original console.error on cleanup
      console.error = originalError;
    };
  }, []);
}

