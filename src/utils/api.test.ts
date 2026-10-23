import test from 'node:test';
import assert from 'node:assert/strict';
import { safeFetchJson, getBackendBaseUrl, sanitizeBackendUrl, buildApiUrl } from './api';

test('sanitizeBackendUrl correctly sanitizes various user inputs', () => {
  // Empty & invalid literals
  assert.equal(sanitizeBackendUrl(''), '');
  assert.equal(sanitizeBackendUrl('undefined'), '');
  assert.equal(sanitizeBackendUrl('null'), '');
  assert.equal(sanitizeBackendUrl(null), '');

  // Quotes stripped
  assert.equal(sanitizeBackendUrl('"https://api.example.com"'), 'https://api.example.com');
  assert.equal(sanitizeBackendUrl("'https://api.example.com/'"), 'https://api.example.com');

  // Automatically prepend https:// when missing
  assert.equal(sanitizeBackendUrl('same-wavelength.onrender.com'), 'https://same-wavelength.onrender.com');
  assert.equal(sanitizeBackendUrl('same-wavelength.onrender.com/'), 'https://same-wavelength.onrender.com');

  // Relative path preserved
  assert.equal(sanitizeBackendUrl('/api'), '/api');
});

test('buildApiUrl creates valid endpoint URLs without malformed pattern', () => {
  const url = buildApiUrl('/api/rooms/create');
  assert.ok(url.endsWith('/api/rooms/create'));
});

test('safeFetchJson catches non-JSON HTML responses gracefully without throwing SyntaxError', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response('The page could not be found (404)', {
      status: 404,
      headers: { 'Content-Type': 'text/html' },
    });
  };

  try {
    const res = await safeFetchJson('/api/rooms/create');
    assert.equal(res.ok, false);
    assert.equal(res.status, 404);
    assert.equal(res.isHtmlFallback, true);
    assert.ok(res.error?.includes('Backend non raggiungibile'));
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('safeFetchJson handles empty body gracefully without throwing Safari pattern error', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response('', {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const res = await safeFetchJson('/api/rooms/empty');
    assert.equal(res.ok, true);
    assert.equal(res.data, undefined);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('safeFetchJson parses valid JSON successfully', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ roomCode: 'TEST99', playerId: 'p_123' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const res = await safeFetchJson<{ roomCode: string; playerId: string }>('/api/rooms/create');
    assert.equal(res.ok, true);
    assert.equal(res.data?.roomCode, 'TEST99');
    assert.equal(res.data?.playerId, 'p_123');
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test('safeFetchJson handles JSON error response gracefully', async () => {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    return new Response(JSON.stringify({ success: false, error: 'Stanza non trovata' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  };

  try {
    const res = await safeFetchJson('/api/rooms/join');
    assert.equal(res.ok, false);
    assert.equal(res.status, 400);
    assert.equal(res.error, 'Stanza non trovata');
  } finally {
    globalThis.fetch = originalFetch;
  }
});
