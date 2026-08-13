// Main Express Server Entry Point
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const socketIO = require('socket.io');
const http = require('http');

// Load environment variables
dotenv.config();

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.FRONTEND_URL,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// MongoDB Connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('MongoDB Connected Successfully'))
.catch(err => console.log('MongoDB Connection Error:', err));

// Routes
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/players', require('./routes/player.routes'));
app.use('/api/contests', require('./routes/contest.routes'));
app.use('/api/teams', require('./routes/team.routes'));
app.use('/api/matches', require('./routes/match.routes'));
app.use('/api/wallet', require('./routes/wallet.routes'));
app.use('/api/admin', require('./routes/admin.routes'));
app.use('/api/referral', require('./routes/referral.routes'));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Root Route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Prime11 Fantasy Sports API',
    version: '1.0.0',
    status: 'Active'
  });
});

// Socket.IO Events
io.on('connection', (socket) => {
  console.log('New user connected:', socket.id);

  // Join room for live match updates
  socket.on('join-match', (matchId) => {
    socket.join(`match-${matchId}`);
    console.log(`User ${socket.id} joined match ${matchId}`);
  });

  // Real-time score updates
  socket.on('update-score', (data) => {
    io.to(`match-${data.matchId}`).emit('score-updated', data);
  });

  // Team updates
  socket.on('team-created', (data) => {
    io.emit('team-notification', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});

module.exports = server;
