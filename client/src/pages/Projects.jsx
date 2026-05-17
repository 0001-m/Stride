import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client.js';
import { ProjectCard } from '../components/projects/ProjectCard.jsx';
import { ProjectFormModal } from '../components/projects/ProjectFormModal.jsx';
import { ConfirmDeleteModal } from '../components/projects/ConfirmDeleteModal.jsx';

/**
 * Lists the signed-in user's projects and supports create / edit / delete via modals.
 */
export function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState('create');
  const [formProject, setFormProject] = useState(null);
  const [formSubmitting, setFormSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const loadProjects = useCallback(async () => {
    setListError('');
    setLoading(true);
    try {
      const { data } = await api.get('/projects');
      setProjects(data.projects || []);
    } catch (err) {
      setListError(err.response?.data?.message || 'Could not load projects.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const openCreate = () => {
    setFormError('');
    setFormMode('create');
    setFormProject(null);
    setFormOpen(true);
  };

  const openEdit = (project) => {
    setFormError('');
    setFormMode('edit');
    setFormProject(project);
    setFormOpen(true);
  };

  const closeForm = () => {
    if (formSubmitting) return;
    setFormError('');
    setFormOpen(false);
    setFormProject(null);
  };

  const handleFormSubmit = async ({ name, description }) => {
    setFormError('');
    setFormSubmitting(true);
    try {
      if (formMode === 'create') {
        const { data } = await api.post('/projects', { name, description });
        setProjects((prev) => [data.project, ...prev]);
      } else if (formProject) {
        const { data } = await api.put(`/projects/${formProject.id}`, { name, description });
        setProjects((prev) => prev.map((p) => (p.id === data.project.id ? data.project : p)));
      }
      setFormOpen(false);
      setFormProject(null);
    } catch (err) {
      const body = err.response?.data;
      const msg =
        body?.errors?.[0]?.msg ||
        body?.message ||
        (Array.isArray(body?.errors) ? body.errors.map((e) => e.msg).join(' ') : null) ||
        'Something went wrong.';
      setFormError(msg);
    } finally {
      setFormSubmitting(false);
    }
  };

  const openDelete = (project) => {
    setDeleteTarget(project);
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
      await api.delete(`/projects/${deleteTarget.id}`);
      setProjects((prev) => prev.filter((p) => p.id !== deleteTarget.id));
      setDeleteOpen(false);
      setDeleteTarget(null);
    } catch (err) {
      const msg = err.response?.data?.message || 'Could not delete project.';
      setDeleteOpen(false);
      setDeleteTarget(null);
      setListError(msg);
    } finally {
      setDeleteSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-slate-500">Workspace</p>
          <h2 className="text-xl font-bold text-slate-900 sm:text-2xl">Projects</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Create projects and invite teammates. Use <strong>Board</strong> for Kanban, <strong>Tasks</strong> for the list, and <strong>Team & details</strong> for access.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
        >
          New project
        </button>
      </div>

      {listError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          {listError}{' '}
          <button type="button" className="font-semibold underline" onClick={loadProjects}>
            Retry
          </button>
        </div>
      ) : null}

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
        </div>
      ) : projects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-16 text-center">
          <p className="text-sm font-medium text-slate-900">No projects yet</p>
          <p className="mt-1 text-sm text-slate-500">Create your first project to get started.</p>
          <button
            type="button"
            onClick={openCreate}
            className="mt-6 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            New project
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {projects.map((p) => (
            <ProjectCard key={p.id} project={p} onEdit={openEdit} onDelete={openDelete} />
          ))}
        </div>
      )}

      <ProjectFormModal
        open={formOpen}
        mode={formMode}
        initial={formProject}
        error={formError}
        onClose={closeForm}
        onSubmit={handleFormSubmit}
        submitting={formSubmitting}
      />

      <ConfirmDeleteModal
        open={deleteOpen}
        projectName={deleteTarget?.name || ''}
        onClose={closeDelete}
        onConfirm={confirmDelete}
        submitting={deleteSubmitting}
      />
    </div>
  );
}
