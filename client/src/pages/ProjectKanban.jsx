import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { KanbanColumn } from '../components/kanban/KanbanColumn.jsx';
import { TaskFiltersBar } from '../components/tasks/TaskFiltersBar.jsx';
import { useDebouncedValue } from '../hooks/useDebouncedValue.js';
import { taskListParams } from '../utils/taskListParams.js';

const COLUMNS = [
  { status: 'todo', title: 'To do', subtitle: 'Not started yet' },
  { status: 'in_progress', title: 'In progress', subtitle: 'Actively being worked on' },
  { status: 'done', title: 'Done', subtitle: 'Shipped or complete' },
];

/**
 * Kanban board: columns + drag-drop; optional server filters match the list view.
 */
export function ProjectKanban() {
  const { projectId } = useParams();
  const [projectName, setProjectName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const debouncedSearch = useDebouncedValue(search.trim(), 400);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [moveError, setMoveError] = useState('');
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
  };

  const reloadBoard = useCallback(async () => {
    const params = taskListParams(statusFilter, debouncedSearch);
    const [projRes, tasksRes] = await Promise.all([
      api.get(`/projects/${projectId}`),
      api.get(`/projects/${projectId}/tasks`, { params }),
    ]);
    setProjectName(projRes.data.project?.name || 'Project');
    setTasks(tasksRes.data.tasks || []);
  }, [projectId, statusFilter, debouncedSearch]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      setError('');
      setMoveError('');
      setLoading(true);
      try {
        await reloadBoard();
      } catch (err) {
        if (!ignore) {
          setTasks([]);
          setProjectName('');
          setError(err.response?.data?.message || 'Could not load board.');
        }
      } finally {
        if (!ignore) setLoading(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [reloadBoard]);

  useEffect(() => {
    const clearDrag = () => setDragOverColumn(null);
    document.addEventListener('dragend', clearDrag);
    return () => document.removeEventListener('dragend', clearDrag);
  }, []);

  const grouped = useMemo(() => {
    const g = { todo: [], in_progress: [], done: [] };
    for (const t of tasks) {
      const key = ['todo', 'in_progress', 'done'].includes(t.status) ? t.status : 'todo';
      g[key].push(t);
    }
    return g;
  }, [tasks]);

  const moveTask = useCallback(
    async (taskId, newStatus) => {
      const task = tasks.find((t) => t.id === taskId);
      if (!task || task.status === newStatus) return;

      const snapshot = tasks;
      setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
      setMoveError('');

      try {
        await api.put(`/projects/${projectId}/tasks/${taskId}`, {
          title: task.title,
          description: task.description || '',
          status: newStatus,
        });
        const params = taskListParams(statusFilter, debouncedSearch);
        const { data } = await api.get(`/projects/${projectId}/tasks`, { params });
        setTasks(data.tasks || []);
      } catch (err) {
        setTasks(snapshot);
        setMoveError(err.response?.data?.message || 'Could not move task.');
      }
    },
    [tasks, projectId, statusFilter, debouncedSearch]
  );

  const handleDragOver = (e, columnStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(columnStatus);
  };

  const handleDrop = (e, newStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    const raw = e.dataTransfer.getData('application/json');
    if (!raw) return;
    try {
      const { taskId } = JSON.parse(raw);
      if (taskId) moveTask(taskId, newStatus);
    } catch {
      /* ignore malformed payload */
    }
  };

  if (loading && !projectName && !error) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
      </div>
    );
  }

  if (error && !projectName) {
    return (
      <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-4 text-sm text-red-800">
        {error}{' '}
        <Link to="/projects" className="font-semibold text-red-900 underline">
          Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 lg:flex-row lg:items-start lg:justify-between">
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
              to={`/projects/${projectId}/tasks`}
              className="font-medium text-indigo-600 transition hover:text-indigo-500"
            >
              List view
            </Link>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{projectName}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            Drag cards to change status. Filters query the server — a status filter may hide empty columns
            until you clear it.
          </p>
        </div>
        <button
          type="button"
          onClick={async () => {
            setLoading(true);
            setError('');
            try {
              await reloadBoard();
            } catch (err) {
              setError(err.response?.data?.message || 'Could not refresh.');
            } finally {
              setLoading(false);
            }
          }}
          className="self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Refresh
        </button>
      </div>

      <TaskFiltersBar
        search={search}
        onSearchChange={setSearch}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        onClear={clearFilters}
        disabled={loading}
        showHint={false}
      />

      {moveError ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
          {moveError}
        </div>
      ) : null}

      <div className={`relative ${loading ? 'min-h-[200px]' : ''}`}>
        {loading ? (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-white/50 backdrop-blur-[1px]">
            <div className="h-9 w-9 animate-spin rounded-full border-2 border-slate-200 border-t-indigo-600" />
          </div>
        ) : null}

        <div className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.status}
              title={col.title}
              subtitle={col.subtitle}
              tasks={grouped[col.status] || []}
              highlight={dragOverColumn === col.status}
              onDragOver={(e) => handleDragOver(e, col.status)}
              onDrop={(e) => handleDrop(e, col.status)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
