import api from './api';

const apiOrigin = new URL(api.defaults.baseURL, window.location.origin).origin;

export function getMediaUrl(path) {
  if (!path || typeof path !== 'string') return undefined;
  if (/^(?:https?:|data:|blob:)/i.test(path)) return path;

  const normalizedPath = path.replace(/\\/g, '/').replace(/^\/+/, '');
  return `${apiOrigin}/${normalizedPath}`;
}
