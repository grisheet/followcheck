import { useMemo, useRef, useState } from 'react';
import { parseInstagramJson } from '../lib/instagramParser';
import { mergeAccounts } from '../lib/compareLists';
import type { ListKind, UploadedFile } from '../types/instagram';
const MAX_BYTES = 25 * 1024 * 1024;
export function useFileUpload(kind: ListKind) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const generation = useRef(0);
  async function addFiles(selected: FileList | File[]) {
    const current = generation.current;
    const batch = Array.from(selected).map(file => ({ file, id: crypto.randomUUID() }));
    setFiles(previous => [...previous, ...batch.map(({ file, id }) => ({ id, name: file.name, size: file.size, status: 'parsing' as const }))]);
    for (const { file, id } of batch) {
      try {
        if (!/\.json$/i.test(file.name)) throw new Error('Choose a .json file. ZIP and HTML exports are not supported.');
        if (file.size > MAX_BYTES) throw new Error('This file exceeds the 25 MB per-file limit. Use a smaller export.');
        if (kind === 'followers' && /^following(?:_\d+)?\.json$/i.test(file.name)) throw new Error('This looks like a following file. Add it to the Following card.');
        if (kind === 'following' && /^followers(?:_\d+)?\.json$/i.test(file.name)) throw new Error('This looks like a followers file. Add it to the Followers card.');
        const text = await file.text();
        if (generation.current !== current) return;
        // Yield between files so the loading state and controls can paint.
        await new Promise(resolve => setTimeout(resolve, 0));
        if (generation.current !== current) return;
        const result = parseInstagramJson(text, kind);
        setFiles(previous => previous.map(f => f.id === id ? { ...f, status: 'valid', result } : f));
      } catch (error) {
        if (generation.current !== current) return;
        setFiles(previous => previous.map(f => f.id === id ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Could not read this file.' } : f));
      }
    }
  }
  const accounts = useMemo(() => mergeAccounts(files.flatMap(f => f.result ? [f.result.accounts] : [])), [files]);
  return { files, accounts, busy: files.some(f => f.status === 'parsing'), ready: files.length > 0 && files.every(f => f.status === 'valid'), addFiles,
    remove: (id: string) => setFiles(previous => previous.filter(f => f.id !== id)),
    clear: () => { generation.current++; setFiles([]); } };
}
