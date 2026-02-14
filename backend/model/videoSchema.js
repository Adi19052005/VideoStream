const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },

  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  rawS3Url: { type: String },

  hlsKey: { type: String },
  thumbnailUrl: { type: String },

  status: {
    type: String,
    enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
    default: 'PENDING'
  },

  views: { type: Number, default: 0 },   // ✅ IMPORTANT FIX

  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    text: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],

  shareableLink: { type: String }

}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
