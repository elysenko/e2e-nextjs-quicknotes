import React from 'react';
import { AppNav, TabBar } from './app-nav';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="page">
      <AppNav />
      <main className="content">
        <div className="container">{children}</div>
      </main>
      <TabBar />
    </div>
  );
}
