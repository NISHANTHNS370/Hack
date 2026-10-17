const mongoose = require('mongoose');

const CATEGORIES = [
  'Electronics',
  'Books & Stationery',
  'ID & Cards',
  'Keys',
  'Clothing & Bags',
  'Wallets & Money',
  'Accessories',
  'Other',
];

const itemSchema = new mongoose.Schema(
  {
    itemName: { type: String, required: [true, 'Item name is required'], trim: true, maxlength: 100 },
    category: { type: String, required: true, enum: CATEGORIES },
    status: { type: String, required: true, enum: ['lost', 'found'] },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    location: { type: String, required: [true, 'Location is required'], trim: true },
    date: { type: Date, required: [true, 'Date is required'] },
    imageUrl: { type: String, default: '' },
    contact: { type: String, trim: true, default: '' }, // email / phone of the reporter

    // Auto-Match: ids of opposite-status items that look like this one
    matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Item' }],
  },
  { timestamps: true }
);

itemSchema.index({ category: 1, status: 1 });

// Convenience flag the frontend can read directly
itemSchema.virtual('isPotentialMatch').get(function () {
  return this.matches && this.matches.length > 0;
});
itemSchema.set('toJSON', { virtuals: true });

module.exports = mongoose.model('Item', itemSchema);
module.exports.CATEGORIES = CATEGORIES;
