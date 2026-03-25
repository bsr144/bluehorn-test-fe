import axios from 'axios';

const env = (window as any).__ENV__ || {};
const API_BASE_URL = env.VITE_API_BASE_URL || import.meta.env.VITE_API_BASE_URL || '';
const API_KEY = env.VITE_API_KEY || import.meta.env.VITE_API_KEY || '';
const HMAC_SECRET = env.VITE_HMAC_SECRET || import.meta.env.VITE_HMAC_SECRET || '';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});



if (API_KEY) {
  apiClient.interceptors.request.use((config) => {
    config.headers['X-API-Key'] = API_KEY;
    return config;
  });
}


if (HMAC_SECRET && crypto.subtle) {
  apiClient.interceptors.request.use(async (config) => {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const method = (config.method || 'GET').toUpperCase();

    
    const base = (config.baseURL || '').replace(/\/+$/, '');
    const rel = (config.url || '').replace(/^\/+/, '');
    const path = new URL(`${base}/${rel}`).pathname;

    const body = config.data ? JSON.stringify(config.data) : '';
    const signingString = `${method}\n${path}\n${timestamp}\n${body}`;

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(HMAC_SECRET),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign(
      'HMAC',
      key,
      new TextEncoder().encode(signingString),
    );
    const hex = [...new Uint8Array(sig)]
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    config.headers['X-Timestamp'] = timestamp;
    config.headers['X-Signature'] = hex;

    return config;
  });
}

export const isUsingMockApi = !env.VITE_API_BASE_URL && !import.meta.env.VITE_API_BASE_URL;

export const apiDocsUrl = API_BASE_URL
  ? API_BASE_URL.replace(/\/api\/v\d+\/?$/, '') + '/docs'
  : '';
