import { useEffect, useRef, useState } from 'react';

const TURNSTILE_SCRIPT_ID = 'cloudflare-turnstile-script';
let turnstileScriptPromise;

function loadTurnstileScript() {
  if (window.turnstile) return Promise.resolve(window.turnstile);
  if (turnstileScriptPromise) return turnstileScriptPromise;

  turnstileScriptPromise = new Promise((resolve, reject) => {
    const existing = document.getElementById(TURNSTILE_SCRIPT_ID);
    if (existing) {
      existing.addEventListener('load', () => resolve(window.turnstile), { once: true });
      existing.addEventListener('error', reject, { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = TURNSTILE_SCRIPT_ID;
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.addEventListener('load', () => resolve(window.turnstile), { once: true });
    script.addEventListener('error', reject, { once: true });
    document.head.appendChild(script);
  });

  return turnstileScriptPromise;
}

export default function Turnstile({ action, onToken, resetKey = 0 }) {
  const containerRef = useRef(null);
  const callbackRef = useRef(onToken);
  const [unavailable, setUnavailable] = useState(false);
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    callbackRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    let active = true;
    let widgetId;

    callbackRef.current('');
    if (!siteKey) {
      setUnavailable(true);
      return undefined;
    }

    setUnavailable(false);
    loadTurnstileScript()
      .then((turnstile) => {
        if (!active || !turnstile || !containerRef.current) return;
        widgetId = turnstile.render(containerRef.current, {
          sitekey: siteKey,
          action,
          theme: 'dark',
          callback: (token) => callbackRef.current(token),
          'expired-callback': () => callbackRef.current(''),
          'error-callback': () => callbackRef.current(''),
        });
      })
      .catch(() => {
        if (active) setUnavailable(true);
      });

    return () => {
      active = false;
      callbackRef.current('');
      if (widgetId !== undefined && window.turnstile) window.turnstile.remove(widgetId);
    };
  }, [action, resetKey, siteKey]);

  return (
    <div className="turnstile-field" aria-live="polite">
      <div ref={containerRef} />
      {unavailable && (
        <p className="form-message form-message--error" role="alert">
          Security check unavailable. Please try again later.
        </p>
      )}
    </div>
  );
}
