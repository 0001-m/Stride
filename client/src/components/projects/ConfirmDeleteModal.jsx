/**
 * Generic confirm dialog (defaults copy for deleting a project).
 */
export function ConfirmDeleteModal({
  open,
  projectName,
  title,
  body,
  confirmLabel,
  submittingLabel,
  onClose,
  onConfirm,
  submitting,
}) {
  if (!open) return null;

  const resolvedTitle = title ?? 'Delete project?';
  const resolvedConfirm = confirmLabel ?? 'Delete';
  const resolvedSubmitting = submittingLabel ?? 'Deleting…';

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
        aria-labelledby="confirm-dialog-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-card-lg ring-1 ring-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-lg font-semibold text-slate-900">
          {resolvedTitle}
        </h2>
        <div className="mt-2 text-sm text-slate-600">
          {body ?? (
            <p>
              <span className="font-semibold text-slate-900">{projectName}</span> will be removed. This
              cannot be undone.
            </p>
          )}
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={submitting}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:opacity-60"
          >
            {submitting ? resolvedSubmitting : resolvedConfirm}
          </button>
        </div>
      </div>
    </div>
  );
}
