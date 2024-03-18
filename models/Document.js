const mongoose = require('mongoose')

const DocumentSchema = new mongoose.Schema({
  annex: {
    type: Buffer,
    required: true,
  },
  invoice: {
    type: Buffer,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    required: true,
    default: 'pending',
    enum: [ 'pending' || 'accepted' || 'rejected' ]
  }
})

module.exports = mongoose.model('Document', DocumentSchema)