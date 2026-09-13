/**
 * Resolves a profile image URL to a directly renderable image asset URL.
 * Handles known providers such as thispersondoesnotexist.com where the root path
 * returns an HTML document rather than the image binary stream.
 */
export function resolveProfileImageUrl(url: string | undefined | null): string | undefined {
  if (!url || typeof url !== 'string') {
    return undefined;
  }

  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed);
    const host = parsed.hostname.toLowerCase();
    if (host === 'thispersondoesnotexist.com' || host === 'www.thispersondoesnotexist.com') {
      if (parsed.pathname === '/' || parsed.pathname === '') {
        parsed.pathname = '/random-person.jpeg';
        return parsed.toString();
      }
    }
    return trimmed;
  } catch {
    return undefined;
  }
}

/**
 * Generates fallback avatar text from a user identifier (e.g. 'user_001' -> '001').
 */
export function getAvatarFallback(userId: string | undefined | null): string {
  if (!userId) return '';
  return userId.replace('user_', '');
}
