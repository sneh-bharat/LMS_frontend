import { describe, it, expect } from 'vitest';
import { createApiClient } from '@/lib/api/client';

describe('createApiClient', () => {
  it('creates an axios instance with the given baseURL', () => {
    const client = createApiClient('https://example.com/api');
    expect(client.defaults.baseURL).toBe('https://example.com/api');
  });

  it('sets default Content-Type header', () => {
    const client = createApiClient('https://example.com/api');
    const headers = client.defaults.headers as Record<string, Record<string, string>>;
    expect(headers.common?.['Content-Type'] ?? headers['Content-Type']).toBeDefined();
  });

  it('sets default timeout', () => {
    const client = createApiClient('https://example.com/api');
    expect(client.defaults.timeout).toBe(15_000);
  });

  it('allows custom timeout', () => {
    const client = createApiClient('https://example.com/api', { timeout: 5_000 });
    expect(client.defaults.timeout).toBe(5_000);
  });
});
