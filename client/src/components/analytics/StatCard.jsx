export function StatCard({ label, value, hint }) {
  return (
    <article className="rounded-xl border border-slate-100 bg-white p-5 shadow-card ring-1 ring-slate-100">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">{value}</p>
      {hint ? <p className="mt-1 text-sm text-slate-500">{hint}</p> : null}
    </article>
  );
}

