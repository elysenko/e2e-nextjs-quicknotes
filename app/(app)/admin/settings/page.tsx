import { mockServices } from '@/lib/mock-data';
import SettingsForms from './settings-forms';

export default function AdminSettingsPage() {
  // Admin-only in production (role === ADMIN guard in middleware / API).
  const unconfigured = mockServices.filter((s) => !s.configured);

  return (
    <div data-testid="admin-settings">
      <div className="page-head">
        <div>
          <h1>Admin settings</h1>
          <p className="sub">Service &amp; integration credentials for this workspace.</p>
        </div>
      </div>

      {unconfigured.length > 0 && (
        <div className="alert alert-warn" role="status" style={{ marginBottom: 18 }} data-testid="config-banner">
          <span>⚠</span>
          <span>
            {unconfigured.length} service{unconfigured.length > 1 ? 's need' : ' needs'} credentials to activate:{' '}
            <strong>{unconfigured.map((s) => s.name).join(', ')}</strong>. Notes work without them.
          </span>
        </div>
      )}

      <SettingsForms />
    </div>
  );
}
