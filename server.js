require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const connectDB = require('./config/db');
const itemRoutes = require('./routes/itemRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/api/health', (req, res) => res.json({ ok: true }));
app.use('/api/items', itemRoutes);

// Central error handler (validation errors, multer errors, etc.)
app.use((err, req, res, next) => {
  console.error(err.message);
  const status = err.name === 'ValidationError' || err.name === 'MulterError' ? 400 : err.status || 500;
  res.status(status).json({ message: err.message || 'Something went wrong' });
});

const PORT = process.env.PORT || 5000;
connectDB().then(() => app.listen(PORT, () => console.log(`🚀 API running on http://localhost:${PORT}`)));
