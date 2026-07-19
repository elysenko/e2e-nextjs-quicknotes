'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { currentUser } from '@/lib/mock-data';

interface NavItem {
  href: string;
  label: string;
  icon: string;
  adminOnly?: boolean;
  match: (path: string) => boolean;
}

const items: NavItem[] = [
  { href: '/notes', label: 'Notes', icon: '🗒️', match: (p) => p === '/notes' || (p.startsWith('/notes/') && p !== '/notes/new') },
  { href: '/notes/new', label: 'New note', icon: '✏️', match: (p) => p === '/notes/new' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️', adminOnly: true, match: (p) => p.startsWith('/admin') },
];

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const visible = items.filter((i) => !i.adminOnly || currentUser.role === 'ADMIN');
  const initials = currentUser.name.split(' ').map((s) => s[0]).join('').slice(0, 2).toUpperCase();

  function logout() {
    // Mockup-only. The service agent swaps this for POST /api/auth/logout.
    router.push('/login');
  }

  return (
    <header className="appbar">
      <div className="appbar-inner">
        <div className="appbar-left">
          <Link href="/notes" className="brand-row" style={{ marginBottom: 0 }}>
            <span className="brand-mark">Q</span>
            <span className="brand-name">QuickNotes</span>
          </Link>
          <nav className="nav-desktop">
            {visible.map((i) => (
              <Link key={i.href} href={i.href} className={`nav-link${i.match(pathname) ? ' active' : ''}`}>
                <span aria-hidden="true">{i.icon}</span>
                {i.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="appbar-right">
          <span className="user-chip">
            <span className="avatar">{initials}</span>
            <span className="uname">{currentUser.email}</span>
          </span>
          <button className="btn btn-ghost logout-btn" onClick={logout} data-testid="logout">
            <span aria-hidden="true">↩</span>
            <span className="logout-text">Log out</span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function TabBar() {
  const pathname = usePathname();
  const router = useRouter();
  const visible = items.filter((i) => !i.adminOnly || currentUser.role === 'ADMIN');

  return (
    <nav className="tabbar" aria-label="Primary">
      {visible.map((i) => (
        <Link key={i.href} href={i.href} className={`tab${i.match(pathname) ? ' active' : ''}`}>
          <span className="tab-ico" aria-hidden="true">{i.icon}</span>
          {i.label}
        </Link>
      ))}
      <button
        className="tab"
        onClick={() => router.push('/login')}
        data-testid="logout-mobile"
        type="button"
      >
        <span className="tab-ico" aria-hidden="true">↩</span>
        Log out
      </button>
    </nav>
  );
}
