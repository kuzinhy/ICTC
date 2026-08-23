/**
 * Image Utilities for ICTC Hub
 * Handles URL normalization, referrer-policy bypass, and image preview helpers.
 */

export function normalizeImageUrl(rawUrl: string): string {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  let url = rawUrl.trim();

  // 1. Google Drive file URL to high-speed CDN preview
  const driveFileMatch = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (driveFileMatch && driveFileMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveFileMatch[1]}`;
  }

  const driveIdMatch = url.match(/drive\.google\.com\/.*?id=([a-zA-Z0-9_-]+)/);
  if (driveIdMatch && driveIdMatch[1]) {
    return `https://lh3.googleusercontent.com/d/${driveIdMatch[1]}`;
  }

  // 2. Dropbox share link to direct download stream
  if (url.includes('dropbox.com')) {
    url = url.replace('dl=0', 'raw=1');
  }

  // 3. Imgur page link to direct image
  if (url.match(/imgur\.com\/([a-zA-Z0-9]+)$/)) {
    const id = url.split('/').pop();
    return `https://i.imgur.com/${id}.jpg`;
  }

  return url;
}

/**
 * Provides a fallback proxy cache URL if direct image loading is blocked by CORS/hotlinking
 */
export function getProxyImageUrl(url: string): string {
  const normalized = normalizeImageUrl(url);
  if (!normalized.startsWith('http')) return normalized;
  // Use images.weserv.nl as universal high-speed image cache & CORS proxy
  const cleanUrl = normalized.replace(/^https?:\/\//, '');
  return `https://images.weserv.nl/?url=${encodeURIComponent(cleanUrl)}`;
}
