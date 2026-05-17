import { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { TaskFormModal } from '../components/tasks/TaskFormModal.jsx';
import { TaskRow } from '../components/tasks/TaskRow.jsx';
import { TaskFiltersBar } from '../components/tasks/TaskFiltersBar.jsx';
import { ConfirmDeleteModal } from '../components/projects/ConfirmDeleteModal.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { taskListParams } from '../utils/taskListParams.js';

/**
 * Task CRUD + filters (status + debounced search on title/description).
 */
export function ProjectTasks() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const [fatalError, setFatalError] = useState('');
  const [listError, setListError] = useState('');
  const [listLoading, setListLoading] = useState(true);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formTask, setFormTask] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const hasActiveFilters = Boolean(statusFilter || debouncedSearch);

  const refetchTasks = useCallback(async () => {
    setListError('');
    try {
      const params = taskListParams(statusFilter, debouncedSearch);
      const { data } = await api.get(`/projects/${projectId}/tasks`, { params });
      setTasks(data.tasks || []);
    } catch (err) {
      setListError(err.response?.data?.message || 'Could not refresh tasks.');
    }
  }, [projectId, statusFilter, debouncedSearch]);

  useEffect(() => {
    let ignore = false;
    const params = taskListParams(statusFilter, debouncedSearch);
    (async () => {
      setListLoading(true);
      setFatalError('');
      setListError('');
      try {
        const [projRes, tasksRes] = await Promise.all([
          api.get(`/projects/${projectId}`),
          api.get(`/projects/${projectId}/tasks`, { params }),
        ]);
        if (!ignore) {
          setProjectName(projRes.data.project?.name || 'Project');
          setTasks(tasksRes.data.tasks || []);
        }
      } catch (err) {
        if (!ignore) {
          setProjectName('');
          setTasks([]);
          setFatalError(err.response?.data?.message || 'Could not load project or tasks.');
        }
      } finally {
        if (!ignore) setListLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [projectId, statusFilter, debouncedSearch]);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
  };

  const openCreate = () => {
    setFormError('');
    setFormMode('create');
    setFormTask(null);
    setFormOpen(true);
  };

  const openEdit = (task) => {
    setFormError('');
    setFormMode('edit');
    setFormTask(task);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (formSubmitting) return;
    setFormError('');
    setFormOpen(false);
    setFormTask(null);
  };

  const handleFormSubmit = async ({ title, description, status }) => {
    setFormError('');
    setFormSubmitting(true);
    try {
      if (formMode === 'create') {
        await api.post(`/projects/${projectId}/tasks`, { title, description, status });
      } else if (formTask) {
        await api.put(`/projects/${projectId}/tasks/${formTask.id}`, {
          title,
          description,
          status,
        });
      }
      setFormOpen(false);
      setFormTask(null);
      await refetchTasks();
    } catch (err) {
      const body = err.response?.data;
      const msg =
        body?.message ||
        body?.errors?.map((e) => e.msg).join(' ') ||
        'Something went wrong.';
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDelete = (task) => {
    setDeleteTarget(task);
    setDeleteOpen(true);
  };

  const closeDelete = () => {
    if (deleteSubmitting) return;
    setDeleteOpen(false);
    setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteSubmitting(true);
    try {
      await api.delete(`/projects/${projectId}/tasks/${deleteTarget.id}`);
      setDeleteOpen(false);
      setDeleteTarget(null);
      await refetchTasks();
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not delete task.';
      setDeleteOpen(false);
      setDeleteTarget(null);
      setListError(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  if (listLoading && !projectName && !fatalError) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  if (fatalError && !projectName) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-800">
        {fatalError}{' '}
        <Link to="/projects" className="font-semibold text-red-900 underline">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link
              to={`/projects/${projectId}`}
              className="font-medium text-indigo-600 transition hover:text-indigo-500"
            >
              ← Team
            </Link>
            <Link
              to={`/projects/${projectId}/analytics`}
              className="font-medium text-indigo-600 transition hover:text-indigo-500"
            >
              Analytics
            </Link>
            <Link
              to={`/projects/${projectId}/board`}
              className="font-medium text-indigo-600 transition hover:text-indigo-500"
            >
              Kanban board
            </Link>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{projectName}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Filter by status and search title or description. Changes use the same API as the board.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          New task
        </button>
      </div>

      <TaskFiltersBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClear={clearFilters}
        disabled={listLoading}
      />

      {listError ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {listError}{' '}
          <button type="button" className="font-semibold underline" onClick={() => refetchTasks()}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="relative">
        {listLoading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-white/60 backdrop-blur-[1px]">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          </div>
        ) : null}

        {tasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
            {hasActiveFilters ? (
              <>
                <p className="text-sm font-medium text-slate-900">No tasks match your filters</p>
                <p className="mt-1 text-sm text-slate-500">Try different keywords or clear filters.</p>
                <button
                  type="button"
                  onClick={clearFilters}
                  className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm hover:bg-slate-50"
                >
                  Clear filters
                </button>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-slate-900">No tasks yet</p>
                <p className="mt-1 text-sm text-slate-500">Break work into tasks your team can track.</p>
                <button
                  type="button"
                  onClick={openCreate}
                  className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  New task
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-card ring-1 ring-slate-100">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Task</th>
                    <th className="hidden px-4 py-3 sm:table-cell">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((t) => (
                    <TaskRow key={t.id} task={t} onEdit={openEdit} onDelete={openDelete} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <TaskFormModal
        open={formOpen}
        mode={formMode}
        initial={formTask}
        error={formError}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        submitting={formSubmitting}
      />

      <ConfirmDeleteModal
        open={deleteOpen}
        title="Delete task?"
        body={
          deleteTarget ? (
            <p>
              Permanently delete{' '}
              <span className="font-semibold text-slate-900">{deleteTarget.title}</span>? This cannot be
              undone.
            </p>
          ) : null
        }
        confirmLabel="Delete"
        submittingLabel="Deleting…"
        projectName=""
        onClose={closeDelete}
        onConfirm={confirmDelete}
        submitting={deleteSubmitting}
      />
    </div>
  );
}
