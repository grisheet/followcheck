import type { Account, ComparisonResult } from '../types/instagram';
export const mergeAccounts = (lists: Account[][]): Account[] => [...new Map(lists.flat().map(a => [a.username, a])).values()];
export function compareLists(followerLists: Account[][], followingLists: Account[][]): ComparisonResult {
  const followers = mergeAccounts(followerLists), following = mergeAccounts(followingLists);
  const followerSet = new Set(followers.map(a => a.username)), followingSet = new Set(following.map(a => a.username));
  return { followers, following, mutuals: following.filter(a => followerSet.has(a.username)), notFollowingBack: following.filter(a => !followerSet.has(a.username)), notFollowedBack: followers.filter(a => !followingSet.has(a.username)), comparedAt: Date.now() };
}
