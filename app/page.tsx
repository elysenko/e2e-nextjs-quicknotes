import Link from 'next/link';
import { mockNotes, snippet } from '@/lib/mock-data';

export default function Home() {
  const preview = mockNotes.slice(0, 3);
  return (
    <div className="page">
      <header className="topbar-lite">
        <div className="brand-row" style={{ marginBottom: 0 }}>
          <span className="brand-mark">Q</span>
          <span className="brand-name">QuickNotes</span>
        </div>
        <div className="links">
          <Link className="btn btn-ghost" href="/login">Log in</Link>
          <Link className="btn btn-primary" href="/signup">Sign up</Link>
        </div>
      </header>

      <main className="hero" data-testid="home-main">
        <div className="hero-inner">
          <div>
            <h1 data-testid="home-title">Your notes, fast and private.</h1>
            <p>
              Capture ideas, lists, and reminders in seconds. Everything is scoped to your
              account and always sorted newest-first.
            </p>
            <div className="hero-cta">
              <Link className="btn btn-primary" href="/signup">Get started — it&apos;s free</Link>
              <Link className="btn btn-ghost" href="/notes">View demo notes</Link>
            </div>
          </div>

          <div className="hero-preview" aria-hidden="true">
            <div className="notes-grid" style={{ gridTemplateColumns: '1fr' }}>
              {preview.map((n) => (
                <div className="note-card" key={n.id}>
                  <h3>{n.title}</h3>
                  <p className="note-snippet">{snippet(n.body, 90)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
