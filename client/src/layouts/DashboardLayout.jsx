import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/dashboard/Sidebar.jsx';
import { Navbar } from '../components/dashboard/Navbar.jsx';

/**
 * Shell for all authenticated app screens: fixed sidebar (desktop) / drawer (mobile)
 * and a sticky top navbar. Child routes render in <Outlet />.
 */
export function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      {/* Mobile overlay when drawer is open */}
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation menu"
          className="fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-[1px] lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <div className="lg:pl-64">
        <Navbar sidebarOpen={sidebarOpen} onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
