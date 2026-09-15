/**
 * Generates fallback avatar text from a user identifier (e.g. 'user_001' -> '001').
 */
export function getAvatarFallback(userId: string | undefined | null): string {
  if (!userId) return '';
  return userId.replace('user_', '');
}
