import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(err, fallback = 'An unexpected error occurred. Please try again.') {
  if (!err) return fallback;
  const data = err.response?.data;
  if (!data) return err.message || fallback;

  if (typeof data === 'string') return data;
  if (typeof data.message === 'string') return data.message;
  if (Array.isArray(data.message) && data.message.length > 0) {
    return data.message.map(m => (typeof m === 'string' ? m : m?.msg || m?.message || JSON.stringify(m))).join(', ');
  }
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors.map(e => (typeof e === 'string' ? e : e?.msg || e?.message || e?.detail || JSON.stringify(e))).join(', ');
  }
  if (data.errors && typeof data.errors === 'object') {
    return Object.values(data.errors).flat().map(e => (typeof e === 'string' ? e : e?.msg || e?.message || JSON.stringify(e))).join(', ');
  }
  if (Array.isArray(data.detail) && data.detail.length > 0) {
    return data.detail.map(d => (typeof d === 'string' ? d : d?.msg || JSON.stringify(d))).join(', ');
  }
  if (typeof data.error === 'string') return data.error;

  return err.message || fallback;
}

