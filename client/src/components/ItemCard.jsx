const STATUS_STYLES = {
  lost: 'bg-red-100 text-red-700',
  found: 'bg-green-100 text-green-700',
};

export default function ItemCard({ item }) {
  const hasMatch = item.matches?.length > 0;
  const date = new Date(item.date).toLocaleDateString(undefined, {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200 transition hover:shadow-md">
      <div className="relative aspect-[4/3] bg-slate-100">
        {item.imageUrl ? (
          <img src={item.imageUrl} alt={item.itemName} loading="lazy" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-5xl">📦</div>
        )}
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold uppercase ${STATUS_STYLES[item.status]}`}>
          {item.status}
        </span>
        {hasMatch && (
          <span className="absolute right-3 top-3 animate-pulse rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-amber-950">
            ⚡ Potential Match!
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="text-lg font-semibold text-slate-900">{item.itemName}</h3>
        <span className="w-fit rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-700">{item.category}</span>
        <p className="text-sm text-slate-600">📍 {item.location}</p>
        <p className="text-sm text-slate-500">📅 {date}</p>
        {item.description && <p className="line-clamp-2 text-sm text-slate-500">{item.description}</p>}

        {hasMatch && (
          <div className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">
            <p className="font-semibold">
              {item.status === 'found' ? 'Possible owner report:' : 'Possibly found:'}
            </p>
            {item.matches.map((m) => (
              <p key={m._id} className="mt-1">
                • {m.itemName} @ {m.location}
                {m.contact && <span className="font-medium"> — {m.contact}</span>}
              </p>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}
