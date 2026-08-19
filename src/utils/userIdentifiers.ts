/**
 * Utility functions for handling user identifiers, custom usernames (e.g. 'matheus.parceiro'),
 * and standard email addresses.
 */

export const INTERNAL_AUTH_DOMAIN = '@megazap.local';

/**
 * Normalizes any login / registration identifier:
 * - If it's a standard email (e.g. 'matheus.tmw@gmail.com'), trims and lowercases.
 * - If it's a custom username (e.g. 'matheus.parceiro' or 'joao.silva'), appends the internal auth domain.
 */
export function normalizeAuthIdentifier(input: string): string {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return '';
  if (trimmed.includes('@')) {
    return trimmed;
  }
  // Custom username format (e.g. 'matheus.parceiro' -> 'matheus.parceiro@megazap.local')
  return `${trimmed}${INTERNAL_AUTH_DOMAIN}`;
}

/**
 * Formats a user email/identifier for clean UI display:
 * - If it was created as a custom username (ends with @megazap.local or @megazap.internal), returns just 'matheus.parceiro'.
 * - Otherwise returns the regular email address.
 */
export function formatDisplayIdentifier(emailOrUsername: string | null | undefined): string {
  if (!emailOrUsername) return '';
  if (emailOrUsername.endsWith(INTERNAL_AUTH_DOMAIN)) {
    return emailOrUsername.replace(INTERNAL_AUTH_DOMAIN, '');
  }
  if (emailOrUsername.endsWith('@megazap.internal')) {
    return emailOrUsername.replace('@megazap.internal', '');
  }
  return emailOrUsername;
}

/**
 * Checks whether an input identifier is a custom username (without @).
 */
export function isCustomUsername(input: string): boolean {
  return !input.includes('@');
}
