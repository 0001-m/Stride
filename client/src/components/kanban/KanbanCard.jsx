/**
 * Draggable task card for the board.
 */
export function KanbanCard({ task }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ taskId: task.id }));
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <article
      draggable
      onDragStart={handleDragStart}
      className="cursor-grab rounded-xl border border-slate-200 bg-white p-3 shadow-sm ring-1 ring-slate-100 transition hover:border-indigo-200 hover:shadow-md active:cursor-grabbing"
    >
      <h4 className="text-sm font-semibold text-slate-900">{task.title}</h4>
      {task.description?.trim() ? (
        <p className="mt-1 line-clamp-2 text-xs text-slate-600">{task.description}</p>
      ) : null}
      {task.createdBy?.name ? (
        <p className="mt-2 text-xs text-slate-400">{task.createdBy.name}</p>
      ) : null}
    </article>
  );
}
