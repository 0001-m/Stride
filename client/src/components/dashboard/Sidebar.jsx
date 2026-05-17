import { NavLink, useLocation } from 'react-router-dom';

const navClass = ({ isActive }) =>
  [
    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition',
    isActive
      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-100'
      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  ].join(' ');

const upcomingNav = [{ label: 'Analytics' }];

/**
 * Primary navigation: logo, dashboard + projects, future modules (disabled).
 */
export function Sidebar({ open, onNavigate }) {
  const location = useLocation();
  const projectsActive = location.pathname === '/projects' || location.pathname.startsWith('/projects/');

  return (
    <aside
      id="app-sidebar"
      className={[
        'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white shadow-card-lg transition-transform duration-200 ease-out lg:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
      ].join(' ')}
    >
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-100 px-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-sm font-bold text-white shadow-sm">
          S
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-900">Stride</p>
          <p className="text-xs text-slate-500">Team workspace</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4" onClick={onNavigate}>
        <p className="px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Menu</p>
        <NavLink to="/dashboard" end className={navClass}>
          {({ isActive }) => (
            <>
              <LayoutIcon className={`h-5 w-5 shrink-0 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              Dashboard
            </>
          )}
        </NavLink>

        <p className="mt-6 px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Workspace
        </p>
        <NavLink
          to="/projects"
          className={() =>
            navClass({
              isActive: projectsActive,
            })
          }
        >
          <FolderIcon
            className={`h-5 w-5 shrink-0 ${projectsActive ? 'text-indigo-600' : 'text-slate-400'}`}
          />
          Projects
        </NavLink>
        {upcomingNav.map((item) => (
          <div
            key={item.label}
            title="Coming in a later feature"
            className="flex cursor-not-allowed items-center justify-between rounded-lg px-3 py-2.5 text-sm text-slate-400"
          >
            <span className="flex items-center gap-3">
              <span className="h-5 w-5 rounded border border-dashed border-slate-200" />
              {item.label}
            </span>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
              Soon
            </span>
          </div>
        ))}
      </nav>

      <div className="border-t border-slate-100 p-4">
        <p className="text-xs leading-relaxed text-slate-500">
          {
            "Open a project for tasks, team, and the Kanban board. Analytics is next."
          }
        </p>
      </div>
    </aside>
  );
}

function LayoutIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25v-2.25z"
      />
    </svg>
  );
}

function FolderIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z"
      />
    </svg>
  );
}
