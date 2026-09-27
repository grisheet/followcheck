import type { LucideIcon } from 'lucide-react';
export function StatsCard({ label, count, icon: Icon, accent }: { label: string; count: number; icon: LucideIcon; accent: string }) { return <article className={`stat-card ${accent}`}><Icon size={19}/><strong>{count.toLocaleString()}</strong><span>{label}</span></article>; }
