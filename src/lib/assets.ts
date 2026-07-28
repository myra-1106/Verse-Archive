export function assetUrl(storageKey?: string | null) {
  if (!storageKey) return null;
  if (/^https?:\/\//.test(storageKey)) return storageKey;
  return `/${storageKey.replace(/^\/+/, "")}`;
}
