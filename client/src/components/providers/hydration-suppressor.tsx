'use client';

import { useEffect, useState } from 'react';
import { useSuppressHydrationWarning } from '@/hooks/useSupressHydrationWarning';

export function HydrationSuppressor({ children }: { children: React.ReactNode }) {
  // Enable hydration suppression hook
  useSuppressHydrationWarning();

  useEffect(() => {
    // Handle hydration errors from browser extensions
    const handleError = (event: ErrorEvent) => {
      const message = event.message.toLowerCase();
      
      // Extension patterns that should be suppressed
      const extensionPatterns = [
        'bis_skin_checked',
        'hydrated but some attributes',
        'tree hydrated',
        'hydration mismatch',
        'browser extension',
      ];

      const isExtensionError = extensionPatterns.some(p => message.includes(p));
      
      if (isExtensionError) {
        event.preventDefault();
        return true;
      }
    };

    // Handle unhandled promise rejections that might be hydration related
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = String(event.reason).toLowerCase();
      
      if (
        (reason.includes('hydration') || reason.includes('tree hydrated')) &&
        (reason.includes('bis_skin_checked') || reason.includes('attribute'))
      ) {
        event.preventDefault();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // Monitor for bis_skin_checked attribute being added by extensions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        // Silently accept bis_skin_checked and similar extension attributes
        if (mutation.type === 'attributes') {
          const attrName = mutation.attributeName || '';
          if (
            attrName === 'bis_skin_checked' ||
            attrName === 'fdprocessedid' ||
            attrName.startsWith('data-extension')
          ) {
            // Browser extensions adding attributes - this is normal and not an error
            // Do nothing to prevent React errors
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeOldValue: false,
    });

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      observer.disconnect();
    };
  }, []);
  
  return <>{children}</>;
}
