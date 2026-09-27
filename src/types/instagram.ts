export type ListKind = 'followers' | 'following';
export interface Account { username: string; displayName: string }
export interface ParseResult { accounts: Account[]; duplicates: number; ignored: number }
export interface UploadedFile { id: string; name: string; size: number; status: 'parsing' | 'valid' | 'error'; result?: ParseResult; error?: string }
export interface FileUploadState { files: UploadedFile[]; accounts: Account[]; ready: boolean; busy: boolean }
export interface ComparisonResult { followers: Account[]; following: Account[]; mutuals: Account[]; notFollowingBack: Account[]; notFollowedBack: Account[]; comparedAt: number }
export type ResultTab = Exclude<keyof ComparisonResult, 'comparedAt'>;
