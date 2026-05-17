import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client.js';
import { StatCard } from '../components/analytics/StatCard.jsx';

function statusLabel(status) {
  if (status === 'todo') return 'To do';
  if (status === 'in_progress') return 'In progress';
  if (status === 'done') return 'Done';
  return status;
}

function StatusPill({ status, count, total }) {
  const pct = total === 0 ? 0 : Math.round((count / total) * 100);
  const color =
    status === 'done'
      ? 'bg-emerald-50 text-emerald-800 ring-emerald-100'
      : status === 'in_progress'
        ? 'bg-amber-50 text-amber-900 ring-amber-100'
        : 'bg-slate-50 text-slate-700 ring-slate-100';

  return (
    <div className="flex items-center justify-between gap-3 rounded-lg bg-white px-4 py-3 ring-1 ring-slate-100">
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900">{statusLabel(status)}</p>
        <p className="mt-0.5 text-xs text-slate-500">
          {count} task{count === 1 ? '' : 's'} • {pct}%
        </p>
      </div>
      <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${color}`}>
        {pct}%
      </span>
    </div>
  );
}

function MiniBars({ data }) {
  const max = Math.max(1, ...data.map((d) => d.count || 0));
  return (
    <div className="mt-4 grid grid-cols-14 items-end gap-1">
      {data.map((d) => {
        const h = Math.round(((d.count || 0) / max) * 48);
        return (
          <div key={d.date} className="group flex flex-col items-center gap-2">
            <div
              className="w-full rounded-md bg-indigo-200/70 transition group-hover:bg-indigo-300"
              style={{ height: `${Math.max(4, h)}px` }}
              title={`${d.date}: ${d.count} created`}
            />
          </div>
        );
      })}
    </div>
  );
}

/**
 * Feature 8: Analytics Dashboard (per project)
 * Shows lightweight stats: task counts, completion rate, and a simple 14-day creation trend.
 */
export function ProjectAnalytics() {
  const { projectId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [project, setProject] = useState(null);
  const [stats, setStats] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get(`/projects/${projectId}/analytics`);
      setProject(data.project || null);
      setStats(data.stats || null);
    } catch (err) {
      setProject(null);
      setStats(null);
      setError(err.response?.data?.message || 'Could not load analytics.');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const statusCounts = stats?.statusCounts || { todo: 0, in_progress: 0, done: 0 };
  const totalTasks = stats?.totalTasks ?? 0;
  const completionRate = stats?.completionRate ?? 0;
  const teamSize = stats?.teamSize ?? 0;
  const createdSeries = stats?.tasksCreatedLast14Days || [];

  const last7 = useMemo(() => {
    const slice = createdSeries.slice(-7);
    return slice.reduce((sum, d) => sum + (d.count || 0), 0);
  }, [createdSeries]);

  if (loading && !project && !error) {
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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 border-b border-slate-100 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            <Link to={`/projects/${projectId}`} className="font-medium text-indigo-600 transition hover:text-indigo-500">
              ← Team
            </Link>
            <Link
              to={`/projects/${projectId}/tasks`}
              className="font-medium text-indigo-600 transition hover:text-indigo-500"
            >
              Tasks
            </Link>
            <Link
              to={`/projects/${projectId}/board`}
              className="font-medium text-indigo-600 transition hover:text-indigo-500"
            >
              Board
            </Link>
          </div>
          <h2 className="mt-2 text-2xl font-bold text-slate-900">{project?.name || 'Project'}</h2>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">
            High-level visibility for standups: task distribution, progress, and recent activity.
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="self-start rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          {loading ? 'Refreshing…' : 'Refresh'}
        </button>
      </div>

      {error ? (
        <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {error}{' '}
          <button type="button" className="font-semibold underline" onClick={load}>
            Retry
          </button>
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total tasks" value={totalTasks} hint="All statuses combined" />
        <StatCard label="Completion rate" value={`${completionRate}%`} hint="Done / total tasks" />
        <StatCard label="Team size" value={teamSize} hint="Owner + members" />
        <StatCard label="Created (7 days)" value={last7} hint="New tasks created recently" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6">
          <h3 className="text-sm font-semibold text-slate-900">Status breakdown</h3>
          <p className="mt-1 text-sm text-slate-500">Where work currently sits.</p>

          <div className="mt-5 space-y-2">
            <StatusPill status="todo" count={statusCounts.todo || 0} total={totalTasks} />
            <StatusPill status="in_progress" count={statusCounts.in_progress || 0} total={totalTasks} />
            <StatusPill status="done" count={statusCounts.done || 0} total={totalTasks} />
          </div>
        </section>

        <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-card ring-1 ring-slate-100 sm:p-6 lg:col-span-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Activity trend</h3>
              <p className="mt-1 text-sm text-slate-500">Tasks created in the last 14 days.</p>
            </div>
            <p className="text-xs font-medium text-slate-500">
              Tip: stable bars = steady intake; spikes = new scope or backlog grooming.
            </p>
          </div>

          {createdSeries.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center">
              <p className="text-sm font-medium text-slate-900">No recent activity</p>
              <p className="mt-1 text-sm text-slate-500">Create tasks to see this chart populate.</p>
            </div>
          ) : (
            <>
              <MiniBars data={createdSeries} />
              <div className="mt-4 flex justify-between text-xs text-slate-500">
                <span>{createdSeries[0]?.date}</span>
                <span>{createdSeries[createdSeries.length - 1]?.date}</span>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

