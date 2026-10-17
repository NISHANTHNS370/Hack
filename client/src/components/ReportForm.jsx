import { useState } from 'react';
import { CATEGORIES } from '../constants';
import { createItem } from '../api';

const today = new Date().toISOString().slice(0, 10);
const initial = {
  itemName: '', category: CATEGORIES[0], status: 'lost',
  description: '', location: '', date: today, contact: '',
};
const input =
  'w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200';

export default function ReportForm({ onClose, onSuccess }) {
  const [form, setForm] = useState(initial);
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return setError('Image must be under 5 MB');
    setError('');
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      const data = await createItem(fd);
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="max-h-[92vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-3xl"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900">Report an Item</h2>
          <button type="button" onClick={onClose} className="text-2xl leading-none text-slate-400 hover:text-slate-600">×</button>
        </div>

        {/* Lost / Found toggle */}
        <div className="grid grid-cols-2 gap-2 rounded-xl bg-slate-100 p-1">
          {['lost', 'found'].map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setForm((f) => ({ ...f, status: s }))}
              className={`rounded-lg py-2 text-sm font-semibold capitalize transition ${
                form.status === s
                  ? s === 'lost' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                  : 'text-slate-600'
              }`}
            >
              I {s} something
            </button>
          ))}
        </div>

        <input name="itemName" value={form.itemName} onChange={handleChange} placeholder="Item name (e.g. Black leather wallet)" required className={input} />

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <select name="category" value={form.category} onChange={handleChange} className={input}>
            {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
          </select>
          <input type="date" name="date" value={form.date} max={today} onChange={handleChange} required className={input} />
        </div>

        <input name="location" value={form.location} onChange={handleChange} placeholder="Location (e.g. Library, 2nd floor)" required className={input} />
        <textarea name="description" value={form.description} onChange={handleChange} rows={3} maxLength={500} placeholder="Description (colour, brand, marks…)" className={input} />
        <input name="contact" value={form.contact} onChange={handleChange} placeholder="Your contact (email / phone)" className={input} />

        <label className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-slate-300 p-4 text-sm text-slate-500 hover:border-indigo-400">
          {preview ? (
            <img src={preview} alt="Preview" className="h-32 rounded-lg object-cover" />
          ) : (
            <span>📷 Tap to upload a photo (max 5 MB)</span>
          )}
          <input type="file" accept="image/*" onChange={handleFile} className="hidden" />
        </label>

        {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
        >
          {submitting ? 'Submitting…' : 'Submit Report'}
        </button>
      </form>
    </div>
  );
}
