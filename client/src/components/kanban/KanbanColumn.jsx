import { KanbanCard } from './KanbanCard.jsx';

/**
 * One Kanban column: droppable zone + list of cards.
 */
export function KanbanColumn({ title, subtitle, tasks, highlight, onDragOver, onDrop }) {
  return (
    <section
      className={[
        'flex min-h-[420px] flex-1 flex-col rounded-2xl border-2 border-dashed p-3 transition-colors sm:min-h-[520px] sm:p-4',
        highlight
          ? 'border-indigo-300 bg-indigo-50/50'
          : 'border-slate-200 bg-slate-50/80',
      ].join(' ')}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <header className="mb-3 shrink-0 border-b border-slate-200/80 pb-3">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <p className="text-xs text-slate-500">{subtitle}</p>
        <p className="mt-1 text-xs font-medium text-slate-400">{tasks.length} cards</p>
      </header>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {tasks.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-200 bg-white/60 px-3 py-6 text-center text-xs text-slate-400">
            Drop tasks here
          </p>
        ) : (
          tasks.map((t) => <KanbanCard key={t.id} task={t} />)
        )}
      </div>
    </section>
  );
}
