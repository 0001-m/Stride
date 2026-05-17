const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

/**
 * Search + status filter controls for task list and Kanban.
 */
export function TaskFiltersBar({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  onClear,
  disabled,
  showHint = true,
}) {
  const hasFilters = Boolean(statusFilter || search.trim());

  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-card ring-1 ring-slate-100 sm:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="task-search" className="block text-sm font-medium text-slate-700">
            Search
          </label>
          <input
            id="task-search"
            type="search"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            disabled={disabled}
            placeholder="Search title or description…"
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
            autoComplete="off"
          />
          {showHint ? (
            <p className="mt-1 text-xs text-slate-500">Matches are case-insensitive. Results update shortly after you stop typing.</p>
          ) : null}
        </div>
        <div className="w-full sm:w-48">
          <label htmlFor="task-status-filter" className="block text-sm font-medium text-slate-700">
            Status
          </label>
          <select
            id="task-status-filter"
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            disabled={disabled}
            className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 disabled:bg-slate-50"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value || 'all'} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <button
          type="button"
          onClick={onClear}
          disabled={disabled || !hasFilters}
          className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Clear filters
        </button>
      </div>
    </div>
  );
}
