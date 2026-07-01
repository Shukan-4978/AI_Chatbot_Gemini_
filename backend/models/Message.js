import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema(
  {
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['user', 'model'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    attachment: {
      base64: { type: String, default: null },
      mimeType: { type: String, default: null },
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model('Message', MessageSchema);
