import { useState } from 'react';
import { ArrowDownUp } from 'lucide-react';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { FileUploadCard } from './components/FileUploadCard';
import { CompareButton } from './components/CompareButton';
import { PrivacyNotice } from './components/PrivacyNotice';
import { HowItWorks } from './components/HowItWorks';
import { ResultsDashboard } from './components/ResultsDashboard';
import { useFileUpload } from './hooks/useFileUpload';
import { compareLists } from './lib/compareLists';
import type { ComparisonResult } from './types/instagram';
export default function App() {
  const followers = useFileUpload('followers'), following = useFileUpload('following');
  const [result, setResult] = useState<ComparisonResult | null>(null), [comparing, setComparing] = useState(false);
  async function compare() { if (!followers.ready || !following.ready || comparing) return; setComparing(true); await new Promise(resolve => setTimeout(resolve, 180)); setResult(compareLists([followers.accounts], [following.accounts])); setComparing(false); window.scrollTo({ top: 0, behavior: 'instant' }); }
  function reset() { followers.clear(); following.clear(); setResult(null); window.scrollTo({ top: 0, behavior: 'instant' }); requestAnimationFrame(() => document.getElementById('upload-title')?.focus()); }
  return <><a href="#main-content" className="skip-link">Skip to content</a><div className="app-frame"><Header/><div id="main-content">{result ? <ResultsDashboard result={result} onReset={reset}/> : <main className="main-shell"><section className="hero" aria-labelledby="upload-title"><span className="eyebrow"><span className="mini-line"/> YOUR CIRCLE, A LITTLE CLEARER</span><h1 id="upload-title" tabIndex={-1}>Find Out Who<br/><span className="gradient-text">Doesn’t Follow Back</span></h1><p>No guessing. No awkward apps. Just your Instagram export,<br className="desktop-break"/> a private comparison, and a clearer picture.</p><div className="hero-meta"><span>No Instagram login</span><span>100% on your device</span><span>Free to use</span></div></section><section aria-label="Upload your Instagram lists" className="upload-section"><div className="upload-grid"><FileUploadCard kind="followers" state={followers} onAdd={followers.addFiles} onRemove={followers.remove}/><div className="connection-icon" aria-hidden="true"><ArrowDownUp size={18}/></div><FileUploadCard kind="following" state={following} onAdd={following.addFiles} onRemove={following.remove}/></div><CompareButton ready={followers.ready && following.ready} busy={comparing || followers.busy || following.busy} onCompare={() => void compare()}/><PrivacyNotice/></section><HowItWorks/></main>}</div><Footer/></div></>;
}
