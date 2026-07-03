import mongoose from 'mongoose';

const ChatSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      default: 'New Chat',
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Chat', ChatSchema);
