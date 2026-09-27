import type { Account, ListKind, ParseResult } from '../types/instagram';
const usernamePattern = /^[a-zA-Z0-9_](?:[a-zA-Z0-9_.]{0,28}[a-zA-Z0-9_])?$/;
const reserved = new Set(['p', 'reel', 'reels', 'stories', 'explore', 'accounts', 'direct', 'about', 'legal', 'privacy', 'developer', 'web', 'tv']);
const object = (x: unknown): x is Record<string, unknown> => !!x && typeof x === 'object' && !Array.isArray(x);
export function normalizeUsername(value: unknown): Account | null {
  if (typeof value !== 'string') return null;
  const displayName = value.trim().replace(/^@/, '');
  if (!usernamePattern.test(displayName) || displayName.includes('..')) return null;
  return { username: displayName.toLowerCase(), displayName };
}
export function accountFromUrl(value: unknown): Account | null {
  if (typeof value !== 'string') return null;
  try {
    const url = new URL(value.trim());
    if (url.protocol !== 'https:' || !['instagram.com', 'www.instagram.com', 'm.instagram.com'].includes(url.hostname) || url.username || url.password || url.port) return null;
    const segments = url.pathname.split('/').filter(Boolean);
    if (segments[0] === '_u') segments.shift();
    if (segments.length !== 1 || reserved.has(segments[0].toLowerCase())) return null;
    return normalizeUsername(decodeURIComponent(segments[0]));
  } catch { return null; }
}
export function extractAccounts(data: unknown, kind?: ListKind): ParseResult {
  if (!object(data) && !Array.isArray(data)) throw new Error('This JSON is not an Instagram account list. Choose the followers or following export.');
  const accounts = new Map<string, Account>();
  let duplicates = 0, ignored = 0, recognizedEmpty = false, opposite = false;
  // Iterative traversal keeps deeply nested JSON from overflowing the call stack.
  const stack: { value: unknown; relationship: boolean }[] = [{ value: data, relationship: false }];
  const add = (account: Account | null) => { if (!account) return false; if (accounts.has(account.username)) duplicates++; else accounts.set(account.username, account); return true; };
  while (stack.length) {
    const { value, relationship } = stack.pop()!;
    if (Array.isArray(value)) { for (let i = value.length - 1; i >= 0; i--) stack.push({ value: value[i], relationship }); continue; }
    if (!object(value)) continue;
    if (Array.isArray(value.string_list_data)) {
      let found = false;
      for (const entry of value.string_list_data) if (object(entry)) {
        const account = normalizeUsername(entry.value);
        if (account) { add(account); found = true; }
      }
      if (!found) found = add(normalizeUsername(value.title));
      if (!found) for (const entry of value.string_list_data) if (object(entry) && add(accountFromUrl(entry.href))) found = true;
      if (!found) ignored++;
      continue;
    }
    if (relationship && ('title' in value || 'href' in value)) {
      if (!add(normalizeUsername(value.title) ?? accountFromUrl(value.href))) ignored++;
      continue;
    }
    for (const [key, child] of Object.entries(value)) {
      const known = key === 'relationships_following' || key === 'relationships_followers';
      if (key.startsWith('relationships_') && !known) continue;
      if (known && kind && key !== `relationships_${kind}`) { opposite = true; continue; }
      if (known && Array.isArray(child) && child.length === 0) recognizedEmpty = true;
      if (child && typeof child === 'object') stack.push({ value: child, relationship: known });
    }
  }
  if (opposite) throw new Error(`This file contains the other account list. Upload it in the ${kind === 'followers' ? 'Following' : 'Followers'} card.`);
  if (!accounts.size && !recognizedEmpty) throw new Error('No likely Instagram usernames found. Choose a followers or following JSON file, not the full archive or an HTML export.');
  return { accounts: [...accounts.values()], duplicates, ignored };
}
export function parseInstagramJson(text: string, kind?: ListKind): ParseResult {
  let data: unknown;
  try { data = JSON.parse(text.replace(/^\uFEFF/, '')); }
  catch { throw new Error('This file is not valid JSON. Extract your downloaded archive and select the .json file again.'); }
  return extractAccounts(data, kind);
}
