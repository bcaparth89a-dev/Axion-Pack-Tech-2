'use client';

import React, {
  useEffect,
  useRef,
  useState,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from 'react';

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
          appearance?: 'always' | 'execute' | 'interaction-only';
          retry?: 'auto' | 'never';
          'retry-interval'?: number;
          'refresh-expired'?: 'auto' | 'manual' | 'never';
          'refresh-timeout'?: 'auto' | 'manual' | 'never';
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

type VerificationStatus = 'loading' | 'verifying' | 'verified' | 'expired' | 'error' | 'timeout';

// Global script loading promise to ensure Turnstile script is added to document only once
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
    const existing = document.querySelector<HTMLScriptElement>(
      'script[src*="challenges.cloudflare.com/turnstile"]'
    );

    if (existing) {
      if (window.turnstile) {
        resolve();
        return;
      }
      const checkInterval = setInterval(() => {
        if (window.turnstile) {
          clearInterval(checkInterval);
          resolve();
        }
      }, 50);
      setTimeout(() => {
        clearInterval(checkInterval);
        if (window.turnstile) resolve();
        else reject(new Error('Turnstile script load timeout'));
      }, 7000);
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
      theme = 'auto',
      className = '',
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const widgetIdRef = useRef<string | null>(null);
    const isMountedRef = useRef(true);

    // Keep stable callback refs to prevent unnecessary re-rendering and widget thrashing
    const onVerifyRef = useRef(onVerify);
    const onExpireRef = useRef(onExpire);
    const onErrorRef = useRef(onError);

    useEffect(() => {
      onVerifyRef.current = onVerify;
      onExpireRef.current = onExpire;
      onErrorRef.current = onError;
    });

    const [status, setStatus] = useState<VerificationStatus>('loading');
    const [isSlow, setIsSlow] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const siteKey = (
      process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'
    ).trim();

    const renderWidget = useCallback(() => {
      if (!containerRef.current || !window.turnstile) return;

      // Clean up existing instance if already rendered
      if (widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch {
          // ignore
        }
        widgetIdRef.current = null;
      }

      containerRef.current.innerHTML = '';
      setStatus('verifying');
      setIsSlow(false);
      setErrorMessage(null);

      try {
        const widgetId = window.turnstile.render(containerRef.current, {
          sitekey: siteKey,
          theme: theme || 'auto',
          action: action || 'submit',
          appearance: 'always',
          retry: 'auto',
          'retry-interval': 5000,
          'refresh-expired': 'auto',
          'refresh-timeout': 'auto',
          callback: (token: string) => {
            if (!isMountedRef.current) return;
            setStatus('verified');
            setIsSlow(false);
            setErrorMessage(null);
            onVerifyRef.current?.(token);
          },
          'expired-callback': () => {
            if (!isMountedRef.current) return;
            setStatus('expired');
            onExpireRef.current?.();
          },
          'error-callback': (err: unknown) => {
            if (!isMountedRef.current) return;
            setStatus('error');
            setErrorMessage('Security check encountered an issue. Retrying...');
            onErrorRef.current?.(err);
          },
          'timeout-callback': () => {
            if (!isMountedRef.current) return;
            setStatus('timeout');
            setErrorMessage('Security challenge timed out. Retrying...');
            onExpireRef.current?.();
          },
        });

        widgetIdRef.current = widgetId;
      } catch (err) {
        if (!isMountedRef.current) return;
        setStatus('error');
        setErrorMessage('Unable to initialize verification widget.');
        onErrorRef.current?.(err);
      }
    }, [siteKey, theme, action]);

    const resetWidget = useCallback(() => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.reset(widgetIdRef.current);
          setStatus('verifying');
          setIsSlow(false);
          setErrorMessage(null);
          return;
        } catch {
          // fallback to full re-render
        }
      }
      renderWidget();
    }, [renderWidget]);

    // Expose reset imperative method to parent forms
    useImperativeHandle(
      ref,
      () => ({
        reset: () => {
          resetWidget();
        },
      }),
      [resetWidget]
    );

    // Watchdog timer: If verification takes longer than 10 seconds, offer manual retry
    useEffect(() => {
      if (status === 'verifying' || status === 'loading') {
        const timer = setTimeout(() => {
          if (isMountedRef.current && (status === 'verifying' || status === 'loading')) {
            setIsSlow(true);
          }
        }, 10000);
        return () => clearTimeout(timer);
      }
    }, [status]);

    // Load script and render widget once on mount
    useEffect(() => {
      isMountedRef.current = true;

      loadTurnstileScript()
        .then(() => {
          if (isMountedRef.current) {
            renderWidget();
          }
        })
        .catch((err) => {
          if (isMountedRef.current) {
            setStatus('error');
            setErrorMessage('Failed to load security script. Please check your internet connection.');
            onErrorRef.current?.(err);
          }
        });

      return () => {
        isMountedRef.current = false;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            // ignore
          }
          widgetIdRef.current = null;
        }
      };
    }, [renderWidget]);

    return (
      <div className={`my-2 select-none ${className}`}>
        <div className="min-h-[66px] flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-900/60 border border-slate-800 transition-colors">
          {/* Turnstile explicit container */}
          <div
            ref={containerRef}
            className="flex items-center justify-center"
            style={{ display: status === 'verified' ? 'none' : 'block' }}
          />

          {/* Controlled Status & Loading Indicators */}
          {status === 'loading' && (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-1.5">
              <div className="w-4 h-4 border-2 border-sky-400 border-t-transparent rounded-full animate-spin" />
              <span>Initializing security verification...</span>
            </div>
          )}

          {status === 'verified' && (
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400 py-1.5 px-3 rounded-lg bg-emerald-950/40 border border-emerald-500/30">
              <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
              <span>Human verification completed</span>
            </div>
          )}

          {errorMessage && status !== 'verified' && (
            <div className="flex flex-col items-center gap-1 text-center py-1">
              <span className="text-xs text-amber-400">{errorMessage}</span>
              <button
                type="button"
                onClick={resetWidget}
                className="text-[11px] font-semibold text-sky-400 hover:text-sky-300 underline mt-0.5 cursor-pointer"
              >
                Click here to retry verification
              </button>
            </div>
          )}

          {isSlow && status !== 'verified' && !errorMessage && (
            <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
              <span>Taking longer than usual?</span>
              <button
                type="button"
                onClick={resetWidget}
                className="text-sky-400 hover:text-sky-300 font-semibold underline cursor-pointer"
              >
                Retry check
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

export default HumanVerification;
