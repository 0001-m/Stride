import { Link } from 'react-router-dom';

/**
 * One project summary with team link; edit/delete only for owners.
 */
export function ProjectCard({ project, onEdit, onDelete }) {
  const preview =
    project.description && project.description.trim().length > 0
      ? project.description.length > 140
        ? `${project.description.slice(0, 140)}…`
        : project.description
      : 'No description yet.';

  const updated = project.updatedAt
    ? new Date(project.updatedAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const canManage = Boolean(project.isOwner);
  const memberCount = typeof project.memberCount === 'number' ? project.memberCount : 0;

  return (
    <article className="flex flex-col rounded-xl border border-slate-100 bg-white p-5 shadow-card ring-1 ring-slate-100 transition hover:shadow-card-lg">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">{project.name}</h3>
          {updated ? <p className="mt-0.5 text-xs text-slate-400">Updated {updated}</p> : null}
          <p className="mt-1 text-xs text-slate-500">
            {memberCount} team member{memberCount === 1 ? '' : 's'}
            {!canManage ? ' · You are a member' : ''}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          {canManage ? (
            <>
              <button
                type="button"
                onClick={() => onEdit(project)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-indigo-600"
                aria-label={`Edit ${project.name}`}
              >
                <PencilIcon className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => onDelete(project)}
                className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                aria-label={`Delete ${project.name}`}
              >
                <TrashIcon className="h-4 w-4" />
              </button>
            </>
          ) : null}
        </div>
      </div>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-slate-600">{preview}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          to={`/projects/${project.id}`}
          className="inline-flex items-center rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Team & details
        </Link>
        <Link
          to={`/projects/${project.id}/tasks`}
          className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
        >
          Tasks
        </Link>
        <Link
          to={`/projects/${project.id}/board`}
          className="inline-flex items-center rounded-lg border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-800 shadow-sm transition hover:bg-indigo-100"
        >
          Board
        </Link>
      </div>
    </article>
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
