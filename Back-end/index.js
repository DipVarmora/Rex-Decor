const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const contactRoutes = require('./routes/contact');
const authRoutes = require('./routes/auth');
const paymentRoutes = require('./routes/payment');
const profileRoutes = require('./routes/profile');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.status(200).json({ status: 'ok', service: 'rex-decor-api' });
});

let mongoConnect;

function connectMongo() {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve();
  }

  if (!process.env.MONGO_URI) {
    return Promise.reject(new Error('MONGO_URI is not set'));
  }

  if (!mongoConnect) {
    mongoConnect = mongoose.connect(process.env.MONGO_URI).catch((error) => {
      mongoConnect = null;
      throw error;
    });
  }

  return mongoConnect;
}

app.use(async (req, res, next) => {
  try {
    await connectMongo();
    next();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    res.status(503).json({ message: 'Database connection failed' });
  }
});

app.use('/api/auth', authRoutes);
app.use('/api', contactRoutes);
app.use('/api', paymentRoutes);
app.use('/api/profile', profileRoutes);

if (!process.env.VERCEL) {
  const port = process.env.PORT || 5000;
  connectMongo()
    .then(() => {
      app.listen(port, () => {
        console.log(`Server running on http://localhost:${port}`);
      });
    })
    .catch((error) => {
      console.error(error.message);
    });
}

module.exports = app;
