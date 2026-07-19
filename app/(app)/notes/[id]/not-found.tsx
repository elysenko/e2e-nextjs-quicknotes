import Link from 'next/link';

export default function NoteNotFound() {
  return (
    <div className="empty" data-testid="note-not-found" style={{ maxWidth: 520, margin: '10px auto' }}>
      <div className="empty-emoji">🔒</div>
      <h2>Note not found</h2>
      <p>This note doesn&apos;t exist, or it belongs to another account.</p>
      <Link href="/notes" className="btn btn-primary">Back to your notes</Link>
    </div>
  );
}
