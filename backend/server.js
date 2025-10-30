const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');  // ADD THIS LINE
const app = express();
const PORT = 3000;
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


const MONGODB_URI = 'mongodb://localhost:27017/smartwaste';
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

app.listen(PORT, () => {
  console.log(`🚀 SmartWaste server running on http://localhost:${PORT}`);
  console.log(`💚 Ready to serve Nairobi's waste management needs!`);
});