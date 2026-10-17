const Item = require('../models/Item');

const THRESHOLD = 40; // minimum score (0-100) to call it a "Potential Match"
const MAX_MATCHES = 5;
const DAY = 24 * 60 * 60 * 1000;
const STOP_WORDS = new Set(['the', 'a', 'an', 'of', 'my', 'and', 'with', 'in', 'on', 'for', 'lost', 'found']);

const tokenize = (s = '') =>
  s.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((w) => w && !STOP_WORDS.has(w));

// Jaccard similarity of two word lists: 0 (nothing shared) → 1 (identical)
function jaccard(a, b) {
  const A = new Set(a);
  const B = new Set(b);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  A.forEach((w) => B.has(w) && shared++);
  return shared / (A.size + B.size - shared);
}

function nameScore(a, b) {
  const x = a.toLowerCase().trim();
  const y = b.toLowerCase().trim();
  const base = jaccard(tokenize(x), tokenize(y));
  // "wallet" vs "black wallet" → one contains the other, treat as a strong match
  return x.includes(y) || y.includes(x) ? Math.max(base, 0.8) : base;
}

// Lost item should be lost on/before the day it was found (1 day slack); score fades over 14 days
function dateScore(lostDate, foundDate) {
  const diffDays = (new Date(foundDate) - new Date(lostDate)) / DAY;
  if (diffDays < -1) return 0;
  return Math.max(0, 1 - Math.max(diffDays, 0) / 14);
}

/**
 * Score how well two items (one lost, one found) match. Category must be equal.
 * 60 pts name  +  20 pts location  +  20 pts date
 */
function scorePair(a, b) {
  const [lost, found] = a.status === 'lost' ? [a, b] : [b, a];
  const name = nameScore(a.itemName, b.itemName);
  const loc = jaccard(tokenize(a.location), tokenize(b.location));
  const date = dateScore(lost.date, found.date);
  return Math.round(60 * name + 20 * loc + 20 * date);
}

/**
 * Run after saving a new item. Finds opposite-status items in the same category,
 * scores them, and links the best ones both ways. Returns [{ item, score }].
 */
async function runAutoMatch(newItem) {
  const oppositeStatus = newItem.status === 'found' ? 'lost' : 'found';

  const candidates = await Item.find({ status: oppositeStatus, category: newItem.category });

  const matched = candidates
    .map((c) => ({ item: c, score: scorePair(newItem, c) }))
    .filter((m) => m.score >= THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_MATCHES);

  if (matched.length) {
    newItem.matches = matched.map((m) => m.item._id);
    await newItem.save();
    // flag the old items too, so the person who LOST it sees the "Potential Match!" badge
    await Item.updateMany(
      { _id: { $in: matched.map((m) => m.item._id) } },
      { $addToSet: { matches: newItem._id } }
    );
  }
  return matched;
}

module.exports = { runAutoMatch, scorePair };
