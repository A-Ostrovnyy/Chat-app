import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  user_id: {
    type: String,
    required: true
  },
  room_id: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },

}, {timestamps: true });

export const Message = mongoose.model('message ', messageSchema);
