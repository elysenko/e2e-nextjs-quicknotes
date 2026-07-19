'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('you@quicknotes.app');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  // Mockup-only auth simulation. The service agent swaps this for
  // POST /api/auth/login (401 → the same visible error, success → /notes).
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setPending(true);
    if (password.toLowerCase() === 'wrong') {
      setPending(false);
      setError('Invalid email or password.');
      return;
    }
    router.push('/notes');
  }

  return (
    <form className="stack" onSubmit={handleSubmit} noValidate>
      {error && (
        <div className="alert alert-error" role="alert" data-testid="login-error">
          <span>⚠</span>
          <span>{error}</span>
        </div>
      )}

      <div className="field">
        <label className="label" htmlFor="email">Email</label>
        <input
          id="email"
          className="input"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
        />
      </div>

      <div className="field">
        <label className="label" htmlFor="password">Password</label>
        <input
          id="password"
          className="input"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Your password"
        />
        <span className="hint">Demo: type <code>wrong</code> to preview the error state.</span>
      </div>

      <button className="btn btn-primary btn-block" type="submit" disabled={pending}>
        {pending ? 'Logging in…' : 'Log in'}
      </button>
    </form>
  );
}
