import Link from 'next/link';
import SignupForm from './signup-form';

export default function SignupPage() {
  return (
    <div className="page">
      <div className="auth">
        <div className="auth-card" data-testid="signup-card">
          <div className="brand-row">
            <span className="brand-mark">Q</span>
            <span className="brand-name">QuickNotes</span>
          </div>
          <h1 className="auth-title">Create your account</h1>
          <p className="auth-sub">It takes about ten seconds.</p>

          <SignupForm />

          <p className="auth-foot">
            Already have an account? <Link href="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
