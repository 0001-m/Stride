import { useEffect, useState } from 'react';

const STATUSES = [
  { value: 'todo', label: 'To do' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'done', label: 'Done' },
];

/**
 * Create or edit a task (title, description, status for Kanban later).
 */
export function TaskFormModal({ open, mode, initial, error, onClose, onSubmit, submitting }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initial) {
      setTitle(initial.title || '');
      setDescription(initial.description || '');
      setStatus(initial.status || 'todo');
    } else {
      setTitle('');
      setDescription('');
      setStatus('todo');
    }
  }, [open, mode, initial]);

  if (!open) return null;

  const heading = mode === 'create' ? 'New task' : 'Edit task';

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ title, description, status });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card-lg ring-1 ring-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="task-form-title" className="text-lg font-semibold text-slate-900">
            {heading}
          </h2>
          <button
            type="button"
            onClick={() => {
              if (!submitting) onClose();
            }}
            disabled={submitting}
            className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            aria-label="Close"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {error ? (
            <div className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">
              {error}
            </div>
          ) : null}

          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              id="task-title"
              required
              maxLength={200}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="What needs to be done?"
            />
          </div>

          <div>
            <label htmlFor="task-status" className="block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              id="task-status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
            >
              {STATUSES.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">This column is shown on the project Kanban board.</p>
          </div>

          <div>
            <label htmlFor="task-desc" className="block text-sm font-medium text-slate-700">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="task-desc"
              rows={4}
              maxLength={5000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Acceptance criteria, links, notes…"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60"
            >
              {submitting ? 'Saving…' : mode === 'create' ? 'Create task' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function CloseIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
