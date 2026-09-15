'use client';

import React, { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react';

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement | string,
        params: {
          sitekey: string;
          theme?: 'light' | 'dark' | 'auto';
          action?: string;
          cData?: string;
          callback?: (token: string) => void;
          'expired-callback'?: () => void;
          'error-callback'?: (error: unknown) => void;
          'timeout-callback'?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string | undefined;
    };
  }
}

export interface HumanVerificationRef {
  reset: () => void;
}

export interface HumanVerificationProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  onError?: (error?: unknown) => void;
  action?: string;
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
}

// Global script loading promise to guarantee the Turnstile script is added to <head> only once
let turnstileScriptPromise: Promise<void> | null = null;

function loadTurnstileScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  if (window.turnstile) {
    return Promise.resolve();
  }

  if (turnstileScriptPromise) {
    return turnstileScriptPromise;
  }

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="challenges.cloudflare.com/turnstile"]');
    if (existing) {
      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
      setTimeout(() => {
        clearInterval(checkInterval);
        if (window.turnstile) resolve();
        else reject(new Error('Turnstile script timeout'));
      }, 5000);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = (err) => {
      turnstileScriptPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

const HumanVerification = forwardRef<HumanVerificationRef, HumanVerificationProps>(
  function HumanVerification(
    {
      onVerify,
      onExpire,
      onError,
      action = 'submit',
      theme = 'dark',
      className = '',
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const [isScriptReady, setIsScriptReady] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);

    const siteKey =
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ||
      '1x00000000000000000000AA'; // Cloudflare official test sitekey (always passes)

    // Expose reset method to parent forms
    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch {
            // ignore reset errors
          }
        }
      },
    }));

    // 1. Load script once
    useEffect(() => {
      let isMounted = true;
      loadTurnstileScript()
        .then(() => {
          if (isMounted) {
            setIsScriptReady(true);
          }
        })
        .catch((err) => {
          if (isMounted) {
            setLoadError('Security verification failed to load. Please check network connection.');
            if (onError) onError(err);
          }
        });

      return () => {
        isMounted = false;
      };
    }, [onError]);

    // 2. Render widget into container safely
    useEffect(() => {
      if (!isScriptReady || !containerRef.current || !window.turnstile) {
        return;
      }

      // Clean up previous widget instance if one exists
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }

      // Clear any previous child nodes to prevent duplicate frames in React StrictMode
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }

      try {
        const widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme,
          action,
          callback: (token: string) => {
            onVerify(token);
          },
          'expired-callback': () => {
            if (onExpire) onExpire();
            if (widgetIdRef.current && window.turnstile) {
              try {
                window.turnstile.reset(widgetIdRef.current);
              } catch {
                // ignore
              }
            }
          },
          'error-callback': (err: unknown) => {
            if (onError) onError(err);
            if (widgetIdRef.current && window.turnstile) {
              try {
                window.turnstile.reset(widgetIdRef.current);
              } catch {
                // ignore
              }
            }
          },
          'timeout-callback': () => {
            if (onExpire) onExpire();
            if (widgetIdRef.current && window.turnstile) {
              try {
                window.turnstile.reset(widgetIdRef.current);
              } catch {
                // ignore
              }
            }
          },
        });

        widgetIdRef.current = widgetId;
      } catch (renderError) {
        if (onError) onError(renderError);
      }

      return () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
          widgetIdRef.current = null;
        }
      };
    }, [isScriptReady, siteKey, theme, action, onVerify, onExpire, onError]);

    return (
      <div className={`my-2 select-none ${className}`}>
        <div className="min-h-[66px] flex items-center justify-center p-2 rounded-xl bg-slate-950/70 border border-slate-800/80">
          <div ref={containerRef} />
          {!isScriptReady && !loadError && (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
              <svg className="animate-spin h-4 w-4 text-amber-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              <span>Loading security challenge...</span>
            </div>
          )}
          {loadError && (
            <div className="text-xs text-rose-400 py-2 text-center">
              {loadError}
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default HumanVerification;
