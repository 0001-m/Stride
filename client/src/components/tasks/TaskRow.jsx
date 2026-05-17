const STATUS_LABELS = {
  todo: 'To do',
  in_progress: 'In progress',
  done: 'Done',
};

const STATUS_STYLES = {
  todo: 'bg-slate-100 text-slate-700 ring-slate-200',
  in_progress: 'bg-amber-50 text-amber-800 ring-amber-100',
  done: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
};

/**
 * One task row with status pill and edit/delete actions.
 */
export function TaskRow({ task, onEdit, onDelete }) {
  const label = STATUS_LABELS[task.status] || task.status;
  const style = STATUS_STYLES[task.status] || STATUS_STYLES.todo;
  const author = task.createdBy?.name || 'Unknown';

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/80">
      <td className="px-4 py-3 align-top">
        <p className="font-medium text-slate-900">{task.title}</p>
        {task.description?.trim() ? (
          <p className="mt-1 line-clamp-2 text-sm text-slate-600">{task.description}</p>
        ) : null}
        <p className="mt-2 sm:hidden">
          <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}>
            {label}
          </span>
        </p>
        <p className="mt-1 text-xs text-slate-400">Created by {author}</p>
      </td>
      <td className="hidden px-4 py-3 align-middle sm:table-cell">
        <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${style}`}>
          {label}
        </span>
      </td>
      <td className="px-4 py-3 align-middle text-right">
        <div className="inline-flex gap-1">
          <button
            type="button"
            onClick={() => onEdit(task)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-indigo-600"
            aria-label={`Edit ${task.title}`}
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-red-600"
            aria-label={`Delete ${task.title}`}
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function PencilIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z"
      />
    </svg>
  );
}

function TrashIcon({ className }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
      />
    </svg>
  );
}
