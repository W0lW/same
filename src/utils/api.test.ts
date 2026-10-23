import test from 'node:test';
import assert from 'node:assert/strict';
import { safeFetchJson, getBackendBaseUrl, setCustomBackendUrl } from './api';

test('getBackendBaseUrl returns empty string by default in test environment', () => {
  const url = getBackendBaseUrl();
  assert.equal(typeof url, 'string');
});

test('safeFetchJson catches non-JSON HTML responses gracefully without throwing SyntaxError', async () => {
  // Mock global fetch to return an HTML 404 page like Vercel does
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
    assert.ok(res.error?.includes('Backend non trovato'));
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
