// Mock data for the UI mockup preview. The backend/service agents replace these
// reads with real `/api/*` calls + Prisma queries; the shapes mirror the plan's
// entities (User, Note) so wiring is a drop-in swap.

export interface MockUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'USER';
}

export interface MockNote {
  id: string;
  title: string;
  body: string;
  createdAt: string; // ISO
}

// First registered user → admin (per the full_auth model).
export const currentUser: MockUser = {
  id: 'u_1',
  email: 'you@quicknotes.app',
  name: 'Alex Rivera',
  role: 'ADMIN',
};

// Newest-first, matching `orderBy createdAt desc`.
export const mockNotes: MockNote[] = [
  {
    id: 'n_6',
    title: 'Q3 planning kickoff',
    body:
      'Agenda for Monday: review last quarter goals, lock the top three initiatives, and assign owners. ' +
      'Need to circle back with design on the onboarding revamp before we commit dates. Rough capacity looks like ' +
      '6 eng-weeks available after the release freeze lifts.',
    createdAt: '2026-07-18T09:12:00.000Z',
  },
  {
    id: 'n_5',
    title: 'Reading list',
    body:
      'Designing Data-Intensive Applications (finish ch. 7), The Pragmatic Programmer re-read, and that long-form ' +
      'piece on local-first software. Also want to skim the new Postgres 17 release notes.',
    createdAt: '2026-07-17T20:45:00.000Z',
  },
  {
    id: 'n_4',
    title: 'Grocery run',
    body: 'Olive oil, oat milk, sourdough, cherry tomatoes, basil, parmesan, coffee beans (the medium roast), and dish soap.',
    createdAt: '2026-07-16T18:03:00.000Z',
  },
  {
    id: 'n_3',
    title: 'Idea: weekly review ritual',
    body:
      'Every Friday afternoon, spend 20 minutes: what shipped, what slipped, what to carry over. Keep it lightweight — ' +
      'three bullets max per section so it actually sticks.',
    createdAt: '2026-07-15T15:30:00.000Z',
  },
  {
    id: 'n_2',
    title: 'Trip to Lisbon',
    body:
      'Neighborhoods to explore: Alfama, Príncipe Real, LX Factory. Try the pastéis de nata near the tram 28 stop. ' +
      'Book the Sintra day trip early — it fills up. Pack light layers, evenings get breezy by the water.',
    createdAt: '2026-07-13T11:20:00.000Z',
  },
  {
    id: 'n_1',
    title: 'Welcome to QuickNotes',
    body:
      'This is your first note. Jot down anything — ideas, lists, reminders. Your notes are private to your account ' +
      'and always sorted with the newest on top. Tap “New note” to add another.',
    createdAt: '2026-07-10T08:00:00.000Z',
  },
];

const SNIPPET_LEN = 140;

export function snippet(body: string, len = SNIPPET_LEN): string {
  const clean = body.replace(/\s+/g, ' ').trim();
  return clean.length <= len ? clean : clean.slice(0, len).trimEnd() + '…';
}

export function getNote(id: string): MockNote | undefined {
  return mockNotes.find((n) => n.id === id);
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Services declared in the deployment manifest, surfaced on /admin/settings.
export interface MockService {
  key: string;
  name: string;
  icon: string;
  description: string;
  configured: boolean;
  fields: { key: string; label: string; placeholder: string; masked: string }[];
}

export const mockServices: MockService[] = [
  {
    key: 'postgresql',
    name: 'PostgreSQL',
    icon: '🐘',
    description: 'Primary database connection used to persist users and notes.',
    configured: true,
    fields: [
      { key: 'POSTGRES_HOST', label: 'Host', placeholder: 'db.internal', masked: 'db.internal' },
      { key: 'POSTGRES_PORT', label: 'Port', placeholder: '5432', masked: '5432' },
      { key: 'POSTGRES_USER', label: 'User', placeholder: 'quicknotes', masked: 'quicknotes' },
      { key: 'POSTGRES_PASSWORD', label: 'Password', placeholder: '••••••••', masked: '••••••••••' },
    ],
  },
  {
    key: 'minio',
    name: 'MinIO object storage',
    icon: '🗄️',
    description: 'S3-compatible storage for future note attachments. Optional — not required to run.',
    configured: false,
    fields: [
      { key: 'MINIO_ENDPOINT', label: 'Endpoint', placeholder: 'minio.internal:9000', masked: '' },
      { key: 'MINIO_ACCESS_KEY', label: 'Access key', placeholder: 'access-key', masked: '' },
      { key: 'MINIO_SECRET_KEY', label: 'Secret key', placeholder: '••••••••', masked: '' },
      { key: 'MINIO_BUCKET', label: 'Bucket', placeholder: 'quicknotes-uploads', masked: '' },
    ],
  },
];
