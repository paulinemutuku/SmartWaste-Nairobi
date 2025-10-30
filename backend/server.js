const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const feedbackRoutes = require('./routes/feedback');

app.use(cors());
app.use(express.json());
app.use('/api/reports', require('./routes/reports'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/collectors', require('./routes/collectors'));
app.use('/api/users', require('./routes/users'));
app.use('/api/schedules', require('./routes/schedules'));
app.use('/api/feedback', feedbackRoutes);
app.use('/uploads', express.static('uploads'));

const MONGODB_URI = 'mongodb+srv://smartwaste-admin:Starlin3%2E@cluster0.bqz6d8a.mongodb.net/smartwaste?retryWrites=true&w=majority';
mongoose.connect(MONGODB_URI)
  .then(() => console.log('💾 Connected to MongoDB'))
  .catch(err => console.log('❌ MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.json({ 
    message: '🌍 SmartWaste Nairobi Backend is running!',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 SmartWaste server running on port ${PORT}`);
});