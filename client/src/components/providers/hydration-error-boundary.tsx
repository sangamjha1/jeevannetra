'use client';

import React, { ErrorInfo, ReactNode } from 'react';

interface HydrationErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error boundary that specifically catches and suppresses hydration errors
 * caused by browser extensions (like Windows Defender, Bitdefender, etc.)
 */
export class HydrationErrorBoundary extends React.Component<
  { children: ReactNode },
  HydrationErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): HydrationErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const errorMessage = error.message.toLowerCase();
    const errorStack = errorInfo.componentStack?.toLowerCase() || '';
    const fullError = `${errorMessage} ${errorStack}`;

    // Extension patterns that are known false positives
    const extensionPatterns = [
      'bis_skin_checked',
      'hydrated but some attributes',
      'tree hydrated',
      'fdprocessedid',
      'browser extension',
    ];

    const isExtensionError = extensionPatterns.some(p => fullError.includes(p));
    const isHydrationError =
      errorMessage.includes('hydration') ||
      errorMessage.includes('tree hydrated') ||
      errorMessage.includes('text content does not match');

    if (isHydrationError && isExtensionError) {
      // Log for debugging but don't treat as a critical error
      console.log(
        '[HydrationErrorBoundary] Suppressed browser extension hydration error:',
        error.message
      );

      // Clear the error state to allow the UI to continue rendering
      // This prevents the error from being displayed to the user
      setTimeout(() => {
        this.setState({ hasError: false, error: null });
      }, 0);

      return;
    }

    // For real hydration errors (not from extensions), log them
    console.error('[HydrationErrorBoundary] Real hydration error:', error);
  }

  render() {
    // Only show error boundary UI if it's a real error (not from extensions)
    if (this.state.hasError && this.state.error) {
      const errorMessage = this.state.error.message.toLowerCase();
      const isExtensionError =
        errorMessage.includes('bis_skin_checked') ||
        errorMessage.includes('fdprocessedid') ||
        errorMessage.includes('browser extension');

      // Don't show UI for extension-related errors
      if (isExtensionError) {
        return this.props.children;
      }

      // Show error UI for real errors
      return (
        <div style={{ padding: '20px', color: 'red' }}>
          <h2>Application Error</h2>
          <p>{this.state.error.message}</p>
        </div>
      );
    }

    return this.props.children;
  }
}
