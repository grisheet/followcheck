import { describe, expect, it } from 'vitest';
import { accountFromUrl, extractAccounts, normalizeUsername, parseInstagramJson } from '../src/lib/instagramParser';
import { compareLists } from '../src/lib/compareLists';
const record = (value: unknown) => ({ title: '', string_list_data: [{ value }] });
const names = (data: unknown) => extractAccounts(data).accounts.map(a => a.username);
describe('Instagram exports', () => {
  it('prefers string_list_data values over titles and URLs, normalizes and deduplicates', () => {
    const result = extractAccounts([{ title: 'wrong', string_list_data: [{ value: ' @Alice ', href: 'https://www.instagram.com/wrong/' }] }, record('alice'), record('Bob_2')]);
    expect(result.accounts).toEqual([{ username: 'alice', displayName: 'Alice' }, { username: 'bob_2', displayName: 'Bob_2' }]);
    expect(result.duplicates).toBe(1);
  });
  it('handles nested exports and relationship wrappers', () => {
    expect(names({ data: { nested: [{ relationships_following: [record('alice'), { title: 'Bob' }] }] } })).toEqual(['alice', 'bob']);
  });
  it('uses record title, then a profile URL as fallbacks', () => {
    expect(names([{ title: 'title_user', string_list_data: [] }, { string_list_data: [{ href: 'https://www.instagram.com/_u/link_user/' }] }])).toEqual(['title_user', 'link_user']);
  });
  it('does not convert unrelated metadata strings or titles to accounts', () => {
    expect(() => extractAccounts({ title: 'metadata', description: 'hello', nested: { value: 'ordinary_word' } })).toThrow('No likely');
  });
  it('ignores malformed records without losing valid accounts', () => {
    const result = extractAccounts([record('valid'), record('name with spaces'), record(''), null, 4]);
    expect(result.accounts).toHaveLength(1); expect(result.ignored).toBe(2);
  });
  it('rejects opposite list wrappers and skips unrelated relationships', () => {
    expect(() => extractAccounts({ relationships_following: [record('alice')] }, 'followers')).toThrow('Following');
    expect(() => extractAccounts({ relationships_blocked_users: [record('alice')] })).toThrow('No likely');
  });
  it('accepts an explicitly empty relationship export but rejects ambiguous empty data', () => {
    expect(extractAccounts({ relationships_following: [] }, 'following').accounts).toEqual([]);
    for (const value of [[], {}, null, 'alice', 42]) expect(() => extractAccounts(value)).toThrow();
  });
  it('reports malformed JSON clearly and supports a BOM', () => {
    expect(() => parseInstagramJson('{oops')).toThrow('not valid JSON');
    expect(parseInstagramJson('\uFEFF[{"string_list_data":[{"value":"alice"}]}]').accounts[0].username).toBe('alice');
  });
  it('rejects hostile URLs, content URLs, and invalid names', () => {
    for (const url of ['https://instagram.com.evil.test/alice', 'javascript:alert(1)', 'https://evil.test/alice', 'https://instagram.com/p/post/', 'https://instagram.com/reel/', 'https://instagram.com/alice/extra', 'https://user:pass@instagram.com/alice']) expect(accountFromUrl(url)).toBeNull();
    for (const value of ['..', 'a..b', '.alice', 'alice.', 'a'.repeat(31), '<script>', '@@alice', '', null]) expect(normalizeUsername(value)).toBeNull();
  });
  it('traverses deeply nested data without recursive stack failure', () => {
    let data: unknown = [record('alice')]; for (let i = 0; i < 10000; i++) data = { nested: data };
    expect(names(data)).toEqual(['alice']);
  });
});
describe('set comparison', () => {
  it('merges multiple follower parts and produces all five correct lists', () => {
    const result = compareLists([extractAccounts([record('Alice'), record('Bob')]).accounts, extractAccounts([record('ALICE'), record('Cara')]).accounts], [extractAccounts({ relationships_following: [record('alice'), record('Dylan'), record('dylan')] }).accounts]);
    expect(result.followers).toHaveLength(3); expect(result.following).toHaveLength(2);
    expect(result.mutuals.map(a => a.username)).toEqual(['alice']);
    expect(result.notFollowingBack.map(a => a.username)).toEqual(['dylan']);
    expect(result.notFollowedBack.map(a => a.username)).toEqual(['bob', 'cara']);
  });
  it('handles empty lists and large overlapping lists', () => {
    expect(compareLists([], []).mutuals).toEqual([]);
    const accounts = (start: number) => Array.from({ length: 25000 }, (_, i) => ({ username: `user${start + i}`, displayName: `user${start + i}` }));
    const result = compareLists([accounts(0)], [accounts(12500)]);
    expect(result.mutuals).toHaveLength(12500); expect(result.notFollowingBack).toHaveLength(12500); expect(result.notFollowedBack).toHaveLength(12500);
  });
});
