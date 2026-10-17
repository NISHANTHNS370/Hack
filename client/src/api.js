const BASE = '/api/items';

export async function fetchItems(params, signal) {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v && v !== 'all')
  ).toString();
  const res = await fetch(`${BASE}?${qs}`, { signal });
  if (!res.ok) throw new Error('Could not load items');
  return res.json();
}

export async function createItem(formData) {
  const res = await fetch(BASE, { method: 'POST', body: formData }); // browser sets multipart headers
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Could not submit report');
  return data; // { item, matchCount }
}
