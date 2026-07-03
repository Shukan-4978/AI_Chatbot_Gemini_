import { GoogleGenerativeAI } from '@google/generative-ai';
import Chat from '../models/Chat.js';
import Message from '../models/Message.js';
import User from '../models/User.js';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "AIzaSyAaGE4HNhri5kdZPD0JGs9Xp8a3wtMsY4M");

// User Registration Flow
export const registerUser = async (req, res) => {
  try {
    const { name, gender, dob, avatar, language, contactNo, email, city } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already registered.' });
    }

    // Generate unique 4-digit password
    let password = '';
    let isUnique = false;
    while (!isUnique) {
      password = Math.floor(1000 + Math.random() * 9000).toString();
      const duplicate = await User.findOne({ password });
      if (!duplicate) {
        isUnique = true;
      }
    }

    const newUser = await User.create({
      name,
      gender,
      dob,
      avatar: avatar || 'male',
      language: language || 'English',
      contactNo,
      email,
      city,
      password
    });

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User Login via 4-Digit Passcode
export const loginUser = async (req, res) => {
  try {
    const { password } = req.body;
    if (!password || password.length !== 4) {
      return res.status(400).json({ error: 'Please enter a valid 4-digit passcode.' });
    }

    const user = await User.findOne({ password });
    if (!user) {
      return res.status(404).json({ error: 'Passcode not found. Please register first.' });
    }

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get profile details of specific user
export const getUserProfile = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update profile details of specific user
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { name, gender, dob, avatar, language, contactNo, email, city } = req.body;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.name = name ?? user.name;
    user.gender = gender ?? user.gender;
    user.dob = dob ?? user.dob;
    user.avatar = avatar ?? user.avatar;
    user.language = language ?? user.language;
    user.contactNo = contactNo ?? user.contactNo;
    user.email = email ?? user.email;
    user.city = city ?? user.city;

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create new chat session for user
export const createChat = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const chat = await Chat.create({ userId, title: 'New Chat' });
    res.status(201).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Retrieve all chat sessions for user
export const getChats = async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const chats = await Chat.find({ userId }).sort({ updatedAt: -1 });
    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Retrieve messages of a specific chat session
export const getChatMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await Message.find({ chatId: id }).sort({ createdAt: 1 });
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update chat session title
export const updateChat = async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;
    const chat = await Chat.findByIdAndUpdate(id, { title }, { new: true });
    if (!chat) return res.status(404).json({ error: 'Chat session not found' });
    res.status(200).json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete chat session and its messages
export const deleteChat = async (req, res) => {
  try {
    const { id } = req.params;
    await Chat.findByIdAndDelete(id);
    await Message.deleteMany({ chatId: id });
    res.status(200).json({ message: 'Chat deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Send message & generate AI response with context + language + multimodal file support
export const sendMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { content, image } = req.body;
    const userId = req.headers['x-user-id'];

    if (!content) {
      return res.status(400).json({ error: 'Message content is required' });
    }

    // 1. Fetch user to check preferred language
    let preferredLanguage = 'English';
    if (userId) {
      const user = await User.findById(userId);
      if (user) preferredLanguage = user.language;
    }

    // 2. Save user message with optional attachment
    const userMessage = await Message.create({
      chatId: id,
      sender: 'user',
      content,
      attachment: image && image.base64 ? { base64: image.base64, mimeType: image.mimeType } : null
    });

    // 3. Fetch conversation history for context
    const previousMessages = await Message.find({ chatId: id }).sort({ createdAt: 1 });

    // Format history for Gemini API
    const history = [];
    for (let i = 0; i < previousMessages.length - 1; i++) {
      const msg = previousMessages[i];
      const parts = [];

      if (msg.attachment && msg.attachment.base64) {
        const rawData = msg.attachment.base64.split(',')[1] || msg.attachment.base64;
        parts.push({
          inlineData: {
            data: rawData,
            mimeType: msg.attachment.mimeType
          }
        });
      }
      parts.push({ text: msg.content });

      history.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts
      });
    }

    // 4. Setup Gemini with systemInstruction to enforce user's selected language
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: `You are a helpful and intelligent AI assistant. The user's preferred language is ${preferredLanguage}. You MUST formulate all replies in the language: ${preferredLanguage}.`
    });

    // Determine current message parts (include media if present)
    const currentParts = [];
    if (image && image.base64) {
      const currentRawData = image.base64.split(',')[1] || image.base64;
      currentParts.push({
        inlineData: {
          data: currentRawData,
          mimeType: image.mimeType
        }
      });
    }
    currentParts.push({ text: content });

    // Send session message
    const result = await model.generateContent({
      contents: [
        ...history,
        {
          role: 'user',
          parts: currentParts
        }
      ]
    });

    const aiText = result.response.text();

    // 5. Save AI response
    const aiMessage = await Message.create({
      chatId: id,
      sender: 'model',
      content: aiText
    });

    // 6. Update Chat session title if needed
    const chat = await Chat.findById(id);
    if (chat) {
      let updateFields = {};
      if (chat.title === 'New Chat') {
        const firstWords = content.split(' ').slice(0, 5).join(' ');
        updateFields.title = firstWords.length > 30 ? firstWords.substring(0, 27) + '...' : firstWords;
      }
      await Chat.findByIdAndUpdate(id, updateFields, { new: true });
    }

    res.status(200).json({ userMessage, aiMessage });
  } catch (error) {
    console.error('Gemini API Error:', error);
    res.status(500).json({ error: 'Failed to communicate with AI model' });
  }
};
