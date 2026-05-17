import { useEffect, useState } from 'react';

/**
 * Modal to create a project or edit an existing one (controlled name + description).
 */
export function ProjectFormModal({ open, mode, initial, error, onClose, onSubmit, submitting }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!open) return;
    if (mode === 'edit' && initial) {
      setName(initial.name || '');
      setDescription(initial.description || '');
    } else {
      setName('');
      setDescription('');
    }
  }, [open, mode, initial]);

  if (!open) return null;

  const title = mode === 'create' ? 'New project' : 'Edit project';

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ name, description });
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
        aria-labelledby="project-form-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card-lg ring-1 ring-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="project-form-title" className="text-lg font-semibold text-slate-900">
              {title}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {mode === 'create' ? 'Give your project a clear name your team will recognize.' : 'Update details anytime.'}
            </p>
          </div>
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
            <label htmlFor="project-name" className="block text-sm font-medium text-slate-700">
              Name
            </label>
            <input
              id="project-name"
              required
              maxLength={120}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="e.g. Website redesign"
            />
          </div>
          <div>
            <label htmlFor="project-desc" className="block text-sm font-medium text-slate-700">
              Description <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="project-desc"
              rows={4}
              maxLength={2000}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 w-full resize-y rounded-lg border border-slate-200 px-3 py-2.5 text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              placeholder="Goals, scope, or links…"
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
              {submitting ? 'Saving…' : mode === 'create' ? 'Create' : 'Save changes'}
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
