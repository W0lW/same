/**
 * Safe API client for Same Wavelength
 * Handles URL sanitation, cross-platform Safari/WebKit quirks,
 * content-type verification, and graceful error reporting preventing
 * "The string did not match the expected pattern" and JSON parse crashes.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  isHtmlFallback?: boolean;
}

/**
 * Sanitizes and validates a backend URL string.
 * Handles common user mistakes like missing https://, trailing slashes,
 * quotes, and string literals like "undefined" or "null".
 */
export function sanitizeBackendUrl(rawUrl?: string | null): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();

  // Strip wrapping quotes if user pasted with quotes
  if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
    url = url.slice(1, -1).trim();
  }

  // Filter out invalid literal strings
  if (url === 'undefined' || url === 'null' || url === '[object Object]' || url === '') {
    return '';
  }

  // Relative paths are not valid backend base URLs; blank means same-origin.
  if (url.startsWith('/')) return '';

  // If user entered a domain without protocol, add the appropriate scheme.
  if (!/^https?:\/\//i.test(url)) {
    if (url.includes('localhost') || url.startsWith('127.0.0.1') || url.startsWith('0.0.0.0')) {
      url = `http://${url}`;
    } else if (url.includes('.')) {
      url = `https://${url}`;
    } else {
      return '';
    }
  }

  // Validate strictly before passing the value to Safari's fetch/EventSource APIs.
  try {
    const parsed = new URL(url);
    if ((parsed.protocol !== 'https:' && parsed.protocol !== 'http:') ||
        !parsed.hostname || parsed.username || parsed.password ||
        parsed.search || parsed.hash) {
      return '';
    }
    return `${parsed.origin}${parsed.pathname.replace(/\/+$/, '')}`;
  } catch {
    return '';
  }
}

/**
 * Returns the configured backend URL.
 * Order of priority:
 * 1. User custom backend in localStorage ('sw_custom_backend')
 * 2. Vite environment variable import.meta.env.VITE_BACKEND_URL
 * 3. Default: empty string (same-origin)
 */
export function getBackendBaseUrl(): string {
  if (typeof window !== 'undefined') {
    try {
      const custom = localStorage.getItem('sw_custom_backend');
      const sanitized = sanitizeBackendUrl(custom);
      if (sanitized) return sanitized;
    } catch (e) {
      // localStorage may be disabled in Safari Private Mode
    }
  }

  let envUrl: string | undefined;
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env) {
      envUrl = import.meta.env.VITE_BACKEND_URL as string | undefined;
    }
  } catch {
    // import.meta not available
  }

  if (!envUrl && typeof process !== 'undefined' && process.env) {
    envUrl = process.env.VITE_BACKEND_URL;
  }

  return sanitizeBackendUrl(envUrl);
}

export function setCustomBackendUrl(url: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = sanitizeBackendUrl(url);
    if (!sanitized) {
      localStorage.removeItem('sw_custom_backend');
    } else {
      localStorage.setItem('sw_custom_backend', sanitized);
    }
  } catch (e) {
    console.warn('[SameWavelength] Unable to access localStorage:', e);
  }
}

/**
 * Builds a valid, fully-qualified URL for both fetch and EventSource,
 * preventing Safari from throwing "The string did not match the expected pattern".
 */
export function buildApiUrl(endpoint: string): string {
  // Allow a validated absolute URL for explicit backend health checks.
  if (/^https?:\/\//i.test(endpoint)) {
    try {
      const absolute = new URL(endpoint);
      if ((absolute.protocol === 'https:' || absolute.protocol === 'http:') && absolute.hostname) {
        return absolute.toString();
      }
    } catch {
      // Fall through to the normal same-origin builder for invalid input.
    }
  }

  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const baseUrl = getBackendBaseUrl();

  if (baseUrl) {
    return `${baseUrl}${cleanEndpoint}`;
  }

  // If in browser and no baseUrl, construct absolute URL from window.location.origin
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}${cleanEndpoint}`;
  }

  return cleanEndpoint;
}

/**
 * Executes a fetch request safely, verifying that the response is valid JSON
 * before parsing.
 *
 * NOTE: Instead of calling `res.json()` directly (which in Safari/WebKit throws
 * "The string did not match the expected pattern" when the response is not valid JSON),
 * this uses `res.text()` followed by safe JSON.parse in try/catch.
 */
export async function safeFetchJson<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const fullUrl = buildApiUrl(endpoint);

  console.log(`[SameWavelength API] Request: ${options?.method || 'GET'} ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options?.headers || {}),
      },
    });

    const contentType = res.headers.get('content-type') || '';
    const isJsonHeader = contentType.toLowerCase().includes('application/json');

    // Read body as text first to prevent Safari SyntaxError crashes
    const rawText = await res.text();

    console.log(`[SameWavelength API] Response ${res.status} from ${endpoint} (type: ${contentType}, length: ${rawText.length})`);

    // Check if the response is an HTML error page (common on Vercel 404/502)
    const isHtml = rawText.trim().startsWith('<') || 
                   rawText.toLowerCase().includes('<!doctype') || 
                   rawText.toLowerCase().includes('the page c');

    if (isHtml || (!isJsonHeader && !res.ok)) {
      console.warn(`[SameWavelength API] Received HTML or non-JSON response from ${fullUrl}:`, rawText.slice(0, 150));
      return {
        ok: false,
        status: res.status,
        isHtmlFallback: isHtml,
        error: res.status === 404
          ? `Backend non raggiungibile su ${fullUrl} (HTTP 404). Su Vercel, il frontend è statico: configura VITE_BACKEND_URL con il tuo backend Node.js (es. su Render o Railway).`
          : `Risposta imprevista dal server (HTTP ${res.status}).`,
      };
    }

    // Try parsing JSON safely
    let data: any = undefined;
    if (rawText && rawText.trim()) {
      try {
        data = JSON.parse(rawText);
      } catch (parseError: any) {
        console.warn(`[SameWavelength API] JSON parse error from ${fullUrl}:`, parseError, rawText.slice(0, 150));
        return {
          ok: false,
          status: res.status,
          isHtmlFallback: false,
          error: `Il server ha risposto con dati non validi (HTTP ${res.status}).`,
        };
      }
    }

    if (!res.ok) {
      let errorString: string;
      if (typeof data?.error === 'string') {
        errorString = data.error;
      } else if (typeof data?.error?.message === 'string') {
        errorString = data.error.message;
      } else if (typeof data?.message === 'string') {
        errorString = data.message;
      } else if (data && typeof data === 'object' && (data.error || data.message)) {
        const errObj = data.error || data;
        errorString = errObj.code 
          ? `${errObj.code}: ${errObj.message || 'Errore del server'}` 
          : JSON.stringify(errObj);
      } else {
        errorString = `Errore del server (HTTP ${res.status})`;
      }

      return {
        ok: false,
        status: res.status,
        data,
        error: errorString,
      };
    }

    return {
      ok: true,
      status: res.status,
      data,
    };
  } catch (err: any) {
    console.error(`[SameWavelength API] Network failure connecting to ${fullUrl}:`, err);
    return {
      ok: false,
      status: 0,
      error: `Impossibile contattare il server: ${err.message || 'Errore di connessione'}. Verifica la connessione o l'URL del backend.`,
    };
  }
}
