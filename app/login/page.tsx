import Link from 'next/link';
import LoginForm from './login-form';

export default function LoginPage() {
  return (
    <div className="page">
      <div className="auth">
        <div className="auth-card" data-testid="login-card">
          <div className="brand-row">
            <span className="brand-mark">Q</span>
            <span className="brand-name">QuickNotes</span>
          </div>
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-sub">Log in to see your notes.</p>

          <LoginForm />

          <p className="auth-foot">
            New here? <Link href="/signup">Create an account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
