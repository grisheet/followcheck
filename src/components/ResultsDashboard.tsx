import { useEffect, useRef, useState } from 'react';
import { Users, UserPlus, HeartHandshake, UserMinus, UserRoundMinus, RotateCcw, ShieldCheck } from 'lucide-react';
import type { ComparisonResult, ResultTab } from '../types/instagram';
import { StatsCard } from './StatsCard';
import { ResultsTabs, tabs } from './ResultsTabs';
import { UserList } from './UserList';
export function ResultsDashboard({ result, onReset }: { result: ComparisonResult; onReset: () => void }) {
  const [active, setActive] = useState<ResultTab>('notFollowingBack'), [toast, setToast] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined), heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => { heading.current?.focus(); return () => clearTimeout(timer.current); }, []);
  const notify = (message: string) => { setToast(message); clearTimeout(timer.current); timer.current = setTimeout(() => setToast(''), 3000); };
  const tab = tabs.find(t => t.id === active)!;
  return <main className="results main-shell"><div className="results-heading"><div><span className="eyebrow">THE BIG PICTURE</span><h1 ref={heading} tabIndex={-1}>Your Follow Summary<span className="gradient-text">.</span></h1><p><ShieldCheck size={14}/><time dateTime={new Date(result.comparedAt).toISOString()}>Compared locally at {new Date(result.comparedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</time></p></div><button className="secondary-button" onClick={onReset}><RotateCcw size={16}/>Start Over</button></div><div className="stats-grid"><StatsCard label="Followers" count={result.followers.length} icon={Users} accent="violet"/><StatsCard label="Following" count={result.following.length} icon={UserPlus} accent="blue"/><StatsCard label="Mutuals" count={result.mutuals.length} icon={HeartHandshake} accent="green"/><StatsCard label="Don’t Follow Back" count={result.notFollowingBack.length} icon={UserMinus} accent="pink"/><StatsCard label="You Don’t Follow Back" count={result.notFollowedBack.length} icon={UserRoundMinus} accent="orange"/></div><section className="results-panel"><ResultsTabs result={result} active={active} onChange={setActive}/><div id="account-panel" role="tabpanel" aria-labelledby={`tab-${active}`}><UserList key={active} accounts={result[active]} description={tab.description} empty={tab.empty} notify={notify}/></div></section><p className="snapshot-note">A snapshot, not a live feed. Results reflect your uploaded exports and can’t tell you who blocked, deactivated, or previously unfollowed you.</p><div className={`toast ${toast ? 'shown' : ''}`} role="status" aria-live="polite">{toast}</div></main>;
}
