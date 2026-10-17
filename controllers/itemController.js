const Item = require('../models/Item');
const { runAutoMatch } = require('../utils/matcher');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const POPULATE_FIELDS = 'itemName status imageUrl location date contact';

// POST /api/items  (multipart/form-data)
exports.createItem = async (req, res, next) => {
  try {
    const { itemName, category, status, description, location, date, contact } = req.body;

    const item = await Item.create({
      itemName, category, status, description, location, date, contact,
      imageUrl: req.file ? `/uploads/${req.file.filename}` : '',
    });

    const matched = await runAutoMatch(item); // 🔥 Smart Auto-Match

    const saved = await Item.findById(item._id).populate('matches', POPULATE_FIELDS);
    res.status(201).json({ item: saved, matchCount: matched.length });
  } catch (err) {
    next(err);
  }
};

// GET /api/items?search=&category=&status=
exports.getItems = async (req, res, next) => {
  try {
    const { search, category, status } = req.query;
    const filter = {};

    if (search && search.trim()) filter.itemName = { $regex: escapeRegex(search.trim()), $options: 'i' };
    if (category && category !== 'all') filter.category = category;
    if (status && status !== 'all') filter.status = status;

    const items = await Item.find(filter)
      .sort({ createdAt: -1 })
      .populate('matches', POPULATE_FIELDS);

    res.json(items);
  } catch (err) {
    next(err);
  }
};

// GET /api/items/:id/matches
exports.getMatches = async (req, res, next) => {
  try {
    const item = await Item.findById(req.params.id).populate('matches', POPULATE_FIELDS);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    res.json(item.matches);
  } catch (err) {
    next(err);
  }
};
