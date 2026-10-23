/**
 * Safe API client for Same Wavelength
 * Handles relative and absolute backend URLs, content-type verification,
 * and graceful error reporting preventing JSON parse crashes.
 */

export interface ApiResponse<T = any> {
  ok: boolean;
  status: number;
  data?: T;
  error?: string;
  isHtmlFallback?: boolean;
}

/**
 * Returns the configured backend URL.
 * Order of priority:
 * 1. User custom backend in localStorage ('sw_custom_backend')
 * 2. Vite environment variable import.meta.env.VITE_BACKEND_URL
 * 3. Default: empty string (same-origin relative path '/api/...')
 */
export function getBackendBaseUrl(): string {
  if (typeof window !== 'undefined') {
    const custom = localStorage.getItem('sw_custom_backend');
    if (custom && custom.trim()) {
      return custom.trim().replace(/\/+$/, '');
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

  if (envUrl && typeof envUrl === 'string' && envUrl.trim()) {
    return envUrl.trim().replace(/\/+$/, '');
  }

  return '';
}

export function setCustomBackendUrl(url: string | null): void {
  if (typeof window === 'undefined') return;
  if (!url || !url.trim()) {
    localStorage.removeItem('sw_custom_backend');
  } else {
    localStorage.setItem('sw_custom_backend', url.trim().replace(/\/+$/, ''));
  }
}

/**
 * Executes a fetch request safely, verifying that the response is valid JSON
 * before parsing. If the server returns HTML (e.g. 404 from static host like Vercel),
 * it returns a helpful, human-readable error instead of throwing a SyntaxError.
 */
export async function safeFetchJson<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  const baseUrl = getBackendBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = baseUrl ? `${baseUrl}${cleanEndpoint}` : cleanEndpoint;

  try {
    const res = await fetch(fullUrl, {
      ...options,
      headers: {
        'Accept': 'application/json',
        ...(options?.headers || {}),
      },
    });

    const contentType = res.headers.get('content-type') || '';
    const isJson = contentType.toLowerCase().includes('application/json');

    // If response is NOT JSON, handle HTML/text gracefully
    if (!isJson) {
      const rawText = await res.text();
      const isHtml = rawText.trim().startsWith('<') || rawText.toLowerCase().includes('<!doctype') || rawText.toLowerCase().includes('the page c');

      if (res.status === 404 || isHtml) {
        return {
          ok: false,
          status: res.status,
          isHtmlFallback: true,
          error: `Backend non trovato su ${fullUrl} (HTTP ${res.status}). Se l'app è su Vercel, il frontend è ospitato staticamente e richiede un backend Node.js attivo (imposta VITE_BACKEND_URL o configura il server).`,
        };
      }

      return {
        ok: false,
        status: res.status,
        error: `Risposta imprevista dal server (HTTP ${res.status}): ${rawText.slice(0, 100)}...`,
      };
    }

    // Response is JSON - parse safely
    const data = await res.json();

    if (!res.ok) {
      return {
        ok: false,
        status: res.status,
        data,
        error: data?.error || `Errore del server (HTTP ${res.status})`,
      };
    }

    return {
      ok: true,
      status: res.status,
      data,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      error: `Impossibile contattare il server: ${err.message || 'Errore di rete'}. Verifica la connessione.`,
    };
  }
}
