import type { Selection } from '../types';

const SHARE_PARAM = 's';

function toUrlSafeBase64(input: string): string {
  return btoa(input).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromUrlSafeBase64(input: string): string {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const padLength = (4 - (padded.length % 4)) % 4;
  return atob(padded + '='.repeat(padLength));
}

export function encodeSelectionToParam(selection: Selection): string {
  const entries = Object.entries(selection).filter(([, ids]) => ids && ids.length > 0);
  return toUrlSafeBase64(JSON.stringify(entries));
}

export function decodeSelectionFromParam(param: string): Selection {
  try {
    const entries = JSON.parse(fromUrlSafeBase64(param)) as [string, string[]][];
    return Object.fromEntries(entries);
  } catch {
    return {};
  }
}

export function buildShareUrl(selection: Selection): string {
  const url = new URL(window.location.href);
  url.search = '';
  url.searchParams.set(SHARE_PARAM, encodeSelectionToParam(selection));
  return url.toString();
}

export function readSelectionFromLocation(): Selection {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(SHARE_PARAM);
  if (!value) return {};
  return decodeSelectionFromParam(value);
}
