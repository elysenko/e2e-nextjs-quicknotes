'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function NoteForm() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  // Mockup-only. The service agent swaps this for POST /api/notes, then
  // redirects to /notes where the new note appears at the top.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!title.trim()) {
      setError('Give your note a title.');
      return;
    }
    setPending(true);
    router.push('/notes');
  }

  return (
    <form className="form-card stack" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="alert alert-error" role="alert" data-testid="note-error">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div className="field">
        <label className="label" htmlFor="title">Title</label>
        <input
          id="title"
          className="input"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. Weekend plans"
          maxLength={120}
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="body">Body</label>
        <textarea
          id="body"
          className="textarea"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Write anything…"
        />
      </div>

      <div className="hero-cta">
        <button className="btn btn-primary" type="submit" disabled={pending} data-testid="save-note">
          {pending ? 'Saving…' : 'Save note'}
        </button>
        <button className="btn btn-ghost" type="button" onClick={() => router.push('/notes')}>
          Cancel
        </button>
      </div>
    </form>
  );
}
