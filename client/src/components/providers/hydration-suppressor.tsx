'use client';

import { useEffect, useState } from 'react';
import { useSuppressHydrationWarning } from '@/hooks/useSupressHydrationWarning';

export function HydrationSuppressor({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false);

  // Enable hydration suppression hook
  useSuppressHydrationWarning();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Additional error handler for React errors during hydration
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message.toLowerCase();
      
      // Catch hydration errors from extensions
      if (
        errorMessage.includes('hydration') &&
        (errorMessage.includes('bis_skin_checked') ||
          errorMessage.includes('extension') ||
          errorMessage.includes('attribute'))
      ) {
        event.preventDefault();
        console.log('[Hydration] Browser extension hydration error suppressed');
      }
    };

    window.addEventListener('error', handleError);
    
    // Monitor for bis_skin_checked attribute being added and mark ancestors
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'bis_skin_checked') {
          const target = mutation.target as HTMLElement;
          // Mark all parent elements as having suppressHydrationWarning
          let current = target.parentElement;
          while (current) {
            if (!current.hasAttribute('suppressHydrationWarning')) {
              current.setAttribute('suppressHydrationWarning', 'true');
            }
            current = current.parentElement;
          }
        }
      });
    });

    // Observe the entire document for attribute changes
    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ['bis_skin_checked'],
    });

    return () => {
      window.removeEventListener('error', handleError);
      observer.disconnect();
    };
  }, []);
  
  return <>{children}</>;
}
