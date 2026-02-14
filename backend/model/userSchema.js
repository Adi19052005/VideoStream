const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },

  avatar: { type: String, default: "" },

  followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

  posts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Video' }]

}, { timestamps: true });   // ✅ IMPORTANT FIX

/* ✅ Performance indexes */
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });

module.exports = mongoose.model('User', userSchema);
