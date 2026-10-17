import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import ReportForm from './components/ReportForm';

export default function App() {
  const [showForm, setShowForm] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleSuccess = ({ matchCount }) => {
    setShowForm(false);
    setRefreshKey((k) => k + 1); // reload the feed
    setToast(
      matchCount > 0
        ? `🎉 ${matchCount} potential match${matchCount > 1 ? 'es' : ''} found! Check the highlighted cards.`
        : '✅ Report submitted. We\'ll flag it if a match shows up.'
    );
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <h1 className="text-xl font-extrabold text-indigo-600">🎒 Campus Lost &amp; Found</h1>
          <button
            onClick={() => setShowForm(true)}
            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
          >
            + Report Item
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <Dashboard refreshKey={refreshKey} />
      </main>

      {showForm && <ReportForm onClose={() => setShowForm(false)} onSuccess={handleSuccess} />}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 w-[90%] max-w-md -translate-x-1/2 rounded-xl bg-slate-900 px-4 py-3 text-center text-sm text-white shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
