import { useEffect, useState } from 'react';
import { fetchItems } from '../api';
import useDebounce from '../hooks/useDebounce';
import SearchBar from './SearchBar';
import ItemCard from './ItemCard';

export default function Dashboard({ refreshKey }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [status, setStatus] = useState('all');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const debouncedSearch = useDebounce(search, 300); // real-time, but not one request per keystroke

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    fetchItems({ search: debouncedSearch, category, status }, controller.signal)
      .then(setItems)
      .catch((e) => e.name !== 'AbortError' && setError(e.message))
      .finally(() => !controller.signal.aborted && setLoading(false));

    return () => controller.abort(); // cancels stale requests
  }, [debouncedSearch, category, status, refreshKey]);

  return (
    <section className="space-y-5">
      <SearchBar {...{ search, setSearch, category, setCategory, status, setStatus }} />

      {error && <p className="rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
      {loading && <p className="py-10 text-center text-slate-500">Loading items…</p>}

      {!loading && !error && items.length === 0 && (
        <div className="py-16 text-center text-slate-500">
          <p className="text-4xl">🕵️</p>
          <p className="mt-2">No items found. Try a different search or report one!</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {items.map((item) => (
          <ItemCard key={item._id} item={item} />
        ))}
      </div>
    </section>
  );
}
