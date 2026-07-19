import Link from 'next/link';
import { notFound } from 'next/navigation';
import { mockNotes, getNote, formatDate } from '@/lib/mock-data';

// Pre-render the mock notes for the static preview. The service agent replaces
// this with a scoped `GET /api/notes/[id]` (404 if not found / not owned).
export function generateStaticParams() {
  return mockNotes.map((n) => ({ id: n.id }));
}

export default async function NoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const note = getNote(id);
  if (!note) notFound();

  return (
    <div data-testid="note-detail">
      <Link href="/notes" className="back-link">← Back to notes</Link>
      <article className="note-detail">
        <h1>{note.title}</h1>
        <p className="stamp">Created {formatDate(note.createdAt)}</p>
        <div className="note-body">{note.body}</div>
      </article>
    </div>
  );
}
