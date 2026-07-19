import Link from 'next/link';
import { mockNotes, snippet, formatDate } from '@/lib/mock-data';

export default function NotesPage() {
  // Server component. The service agent swaps `mockNotes` for a scoped
  // `GET /api/notes` (orderBy createdAt desc) read for the current user.
  const notes = mockNotes;

  return (
    <div data-testid="notes-page">
      <div className="page-head">
        <div>
          <h1>Your notes</h1>
          <p className="sub">{notes.length} {notes.length === 1 ? 'note' : 'notes'} · newest first</p>
        </div>
        <div className="head-action">
          <Link href="/notes/new" className="btn btn-primary" data-testid="new-note-link">
            <span aria-hidden="true">＋</span> New note
          </Link>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="empty" data-testid="notes-empty">
          <div className="empty-emoji">🗒️</div>
          <h2>No notes yet</h2>
          <p>Your notes will show up here, newest first.</p>
          <Link href="/notes/new" className="btn btn-primary">Write your first note</Link>
        </div>
      ) : (
        <div className="notes-grid" data-testid="notes-list">
          {notes.map((n) => (
            <Link key={n.id} href={`/notes/${n.id}`} className="note-card" data-testid="note-card">
              <h3>{n.title}</h3>
              <p className="note-snippet">{snippet(n.body)}</p>
              <span className="note-meta">{formatDate(n.createdAt)}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
