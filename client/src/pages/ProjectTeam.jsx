import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { ConfirmDeleteModal } from '../components/projects/ConfirmDeleteModal.jsx';

/**
 * Project detail + team: list members, add by email (owner only), remove member (owner only).
 */
export function ProjectTeam() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState('');

  const [removeOpen, setRemoveOpen] = useState(false);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [removeSubmitting, setRemoveSubmitting] = useState(false);

  const [roleSubmittingId, setRoleSubmittingId] = useState('');

  const load = useCallback(async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await api.get(`/projects/${projectId}`);
      setProject(data.project);
    } catch (err) {
      setProject(null);
      setError(err.response?.data?.message || 'Could not load project.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddError('');
    setAdding(true);
    try {
      const { data } = await api.post(`/projects/${projectId}/members`, { email });
      setProject(data.project);
      setEmail('');
    } catch (err) {
      const body = err.response?.data;
      const msg =
        body?.message ||
        body?.errors?.map((x) => x.msg).join(' ') ||
        'Could not add member.';
      setAddError(msg);
    } finally {
      setAdding(false);
    }
  };

  const openRemove = (member) => {
    setRemoveTarget(member);
    setRemoveOpen(true);
  };

  const closeRemove = () => {
    if (removeSubmitting) return;
    setRemoveOpen(false);
    setRemoveTarget(null);
  };

  const confirmRemove = async () => {
    if (!removeTarget) return;
    setRemoveSubmitting(true);
    try {
      const { data } = await api.delete(`/projects/${projectId}/members/${removeTarget.userId}`);
      setProject(data.project);
      setRemoveOpen(false);
      setRemoveTarget(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not remove member.';
      setRemoveOpen(false);
      setRemoveTarget(null);
      setError(msg);
    } finally {
      setRemoveSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-800">
        {error}{' '}
        <Link to="/projects" className="font-semibold text-red-900 underline">
          Back to projects
        </Link>
      </div>
    );
  }

  if (!project) return null;

  const canManageTeam = Boolean(project.access?.canManageTeam);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/projects"
            className="text-sm font-medium text-indigo-600 transition hover:text-indigo-500"
          >
            ← All projects
          </Link>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{project.name}</h2>
          <p className="mt-2 max-w-2xl text-sm text-slate-600">
            {project.description?.trim()
              ? project.description
              : 'No description. The owner can edit this from the projects list.'}
          </p>
          {!canManageTeam ? (
            <p className="mt-2 inline-flex rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
              Your role: {project.access?.role || 'member'} — only admins can change the team.
            </p>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              to={`/projects/${projectId}/tasks`}
              className="inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            >
              View tasks
            </Link>
            <Link
              to={`/projects/${projectId}/board`}
              className="inline-flex rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-semibold text-indigo-800 shadow-sm transition hover:bg-indigo-100"
            >
              Kanban board
            </Link>
            <Link
              to={`/projects/${projectId}/analytics`}
              className="inline-flex rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
            >
              Analytics
            </Link>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}
        </div>
      ) : null}

      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
        <h3 className="text-sm font-semibold text-slate-900">Owner</h3>
        <div className="mt-3 flex items-center gap-3 rounded-lg bg-slate-50 px-4 py-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
            {(project.owner?.name || '?').slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate font-medium text-slate-900">{project.owner?.name || 'Unknown'}</p>
            <p className="truncate text-sm text-slate-500">{project.owner?.email}</p>
          </div>
          <span className="ml-auto inline-flex shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700 ring-1 ring-indigo-100">
            Admin
          </span>
        </div>
      </section>

      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Team members</h3>
            <p className="mt-1 text-sm text-slate-500">
              {project.members?.length ?? 0} collaborator
              {(project.members?.length ?? 0) === 1 ? '' : 's'} (excluding owner).
            </p>
          </div>
        </div>

        {canManageTeam ? (
          <form onSubmit={handleAddMember} className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end">
            <div className="flex-1">
              <label htmlFor="member-email" className="block text-sm font-medium text-slate-700">
                Add by email
              </label>
              <p className="mt-0.5 text-xs text-slate-500">They must already have a Stride account.</p>
              <input
                id="member-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="teammate@company.com"
                className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
            <button
              type="submit"
              disabled={adding}
              className="rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-60 sm:mb-0.5"
            >
              {adding ? 'Adding…' : 'Add member'}
            </button>
          </form>
        ) : null}

        {addError ? (
          <p className="mt-3 text-sm text-red-600" role="alert">
            {addError}
          </p>
        ) : null}

        <ul className="mt-6 divide-y divide-slate-100">
          {!project.members || project.members.length === 0 ? (
            <li className="py-8 text-center text-sm text-slate-500">No members yet.</li>
          ) : (
            project.members.map((m) => (
              <li key={m.userId} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600">
                    {(m.name || '?').slice(0, 1).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-900">{m.name}</p>
                    <p className="truncate text-sm text-slate-500">{m.email}</p>
                    <div className="mt-1 inline-flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${
                          m.role === 'admin'
                            ? 'bg-indigo-50 text-indigo-700 ring-indigo-100'
                            : 'bg-slate-50 text-slate-700 ring-slate-100'
                        }`}
                      >
                        {m.role === 'admin' ? 'Admin' : 'Member'}
                      </span>
                      {m.addedAt ? (
                        <p className="text-xs text-slate-400">
                          Added {new Date(m.addedAt).toLocaleDateString()}
                        </p>
                      ) : null}
                    </div>
                  </div>
                </div>
                {canManageTeam ? (
                  <div className="flex flex-wrap items-center gap-2 self-start sm:self-center">
                    <button
                      type="button"
                      disabled={roleSubmittingId === m.userId}
                      onClick={async () => {
                        setError('');
                        setRoleSubmittingId(m.userId);
                        try {
                          const newRole = m.role === 'admin' ? 'member' : 'admin';
                          const { data } = await api.put(`/projects/${projectId}/members/${m.userId}/role`, {
                            role: newRole,
                          });
                          setProject(data.project);
                        } catch (err) {
                          setError(err.response?.data?.message || 'Could not update role.');
                        } finally {
                          setRoleSubmittingId('');
                        }
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
                    >
                      {roleSubmittingId === m.userId ? 'Saving…' : m.role === 'admin' ? 'Make member' : 'Make admin'}
                    </button>
                    <button
                      type="button"
                      onClick={() => openRemove(m)}
                      className="rounded-lg border border-red-100 px-3 py-1.5 text-sm font-medium text-red-600 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                ) : null}
              </li>
            ))
          )}
        </ul>
      </section>

      <ConfirmDeleteModal
        open={removeOpen}
        title="Remove team member?"
        body={
          removeTarget ? (
            <p>
              Remove{' '}
              <span className="font-semibold text-slate-900">
                {removeTarget.name} ({removeTarget.email})
              </span>{' '}
              from this project? They will lose access until added again.
            </p>
          ) : null
        }
        confirmLabel="Remove"
        submittingLabel="Removing…"
        projectName=""
        onClose={closeRemove}
        onConfirm={confirmRemove}
        submitting={removeSubmitting}
      />
    </div>
  );
}
