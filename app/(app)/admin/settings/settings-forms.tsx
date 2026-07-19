'use client';

import { useState } from 'react';
import { mockServices } from '@/lib/mock-data';

export default function SettingsForms() {
  return (
    <div className="settings-grid">
      {mockServices.map((svc) => (
        <ServiceCard key={svc.key} service={svc} />
      ))}
    </div>
  );
}

function ServiceCard({ service }: { service: (typeof mockServices)[number] }) {
  const [saved, setSaved] = useState(false);

  // Mockup-only. The service agent wires this to PATCH /api/admin/settings
  // (upserts key/value pairs) and GET for masked current values.
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaved(true);
  }

  return (
    <form className="service-card" onSubmit={handleSubmit} data-testid={`service-${service.key}`}>
      <div className="service-head">
        <div className="service-title">
          <span className="service-ico" aria-hidden="true">{service.icon}</span>
          <h3>{service.name}</h3>
        </div>
        <span className={`badge ${service.configured ? 'badge-ok' : 'badge-off'}`}>
          <span className="dot" />
          {service.configured ? 'Configured' : 'Needs setup'}
        </span>
      </div>
      <p className="service-desc">{service.description}</p>

      <div className="cred-grid">
        {service.fields.map((f) => {
          const secret = /password|secret|key/i.test(f.key);
          return (
            <div className="field" key={f.key}>
              <label className="label" htmlFor={f.key}>{f.label}</label>
              <input
                id={f.key}
                className="input"
                type={secret ? 'password' : 'text'}
                defaultValue={secret ? '' : f.masked}
                placeholder={f.masked || f.placeholder}
                onChange={() => setSaved(false)}
              />
            </div>
          );
        })}
      </div>

      <div className="settings-actions">
        {saved && <span className="badge badge-ok" style={{ marginRight: 12 }}><span className="dot" />Saved</span>}
        <button className="btn btn-primary" type="submit">Save {service.name}</button>
      </div>
    </form>
  );
}
