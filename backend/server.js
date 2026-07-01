import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import chatRoutes from './routes/chatRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 1111;

// Connect to Database
connectDB();

app.use(cors({
  origin: [
    process.env.FRONTEND_URL,
    'http://localhost:5173',
    'https://ai-chatbot-gemini-frontend.vercel.app'
  ].filter(Boolean),
  credentials: true
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
  res.send('AI Chatbot Backend is running successfully!');
});

// Routes
app.use('/api/chats', chatRoutes);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
