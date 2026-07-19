import Link from 'next/link';
import NoteForm from './note-form';

export default function NewNotePage() {
  return (
    <div data-testid="new-note-page">
      <Link href="/notes" className="back-link">← Back to notes</Link>
      <div className="page-head">
        <div>
          <h1>New note</h1>
          <p className="sub">It&apos;ll appear at the top of your list.</p>
        </div>
      </div>
      <NoteForm />
    </div>
  );
}
