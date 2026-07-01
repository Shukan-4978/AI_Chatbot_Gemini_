import express from 'express';
import {
  createChat,
  getChats,
  getChatMessages,
  updateChat,
  deleteChat,
  sendMessage,
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile
} from '../controllers/chatController.js';

const router = express.Router();

// Authentication routes
router.post('/register', registerUser);
router.post('/login', loginUser);

// Profile routes
router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Chat CRUD routes
router.post('/', createChat);
router.get('/', getChats);
router.get('/:id/messages', getChatMessages);
router.put('/:id', updateChat);
router.delete('/:id', deleteChat);
router.post('/:id/messages', sendMessage);

export default router;
