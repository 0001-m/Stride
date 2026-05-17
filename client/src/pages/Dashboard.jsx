import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

/**
 * Dashboard home content — rendered inside DashboardLayout (sidebar + navbar).
 * Feature 3+ will add project cards and stats here.
 */
export function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-700 p-6 text-white shadow-card-lg sm:p-8">
        <p className="text-sm font-medium text-indigo-100">Good to see you</p>
        <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">Hello, {user?.name}</h2>
        <p className="mt-2 max-w-xl text-sm text-indigo-100 sm:text-base">
          Manage initiatives under Projects, then layer on team members and tasks in upcoming features.
        </p>
        <Link
          to="/projects"
          className="mt-5 inline-flex items-center rounded-lg bg-white/15 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/30 transition hover:bg-white/25"
        >
          Open projects
        </Link>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-card ring-1 ring-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Account</h3>
          <p className="mt-2 text-sm text-slate-600">Signed in as</p>
          <p className="mt-1 truncate text-sm font-medium text-indigo-600">{user?.email}</p>
        </article>
        <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-card ring-1 ring-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Projects</h3>
          <p className="mt-2 text-sm text-slate-600">
            {
              "Create workspaces, invite teammates, then track work on each project's Tasks page."
            }
          </p>
          <Link to="/projects" className="mt-3 inline-block text-sm font-semibold text-indigo-600 hover:text-indigo-500">
            Go to Projects →
          </Link>
        </article>
        <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-card ring-1 ring-slate-100 sm:col-span-2 lg:col-span-1">
          <h3 className="text-sm font-semibold text-slate-900">Layout</h3>
          <p className="mt-2 text-sm text-slate-600">
            Resize the window or open devtools device mode: the sidebar collapses to a drawer with a
            dimmed overlay.
          </p>
        </article>
      </div>
    </div>
  );
}
