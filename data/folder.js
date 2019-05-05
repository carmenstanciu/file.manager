const mongoose = require('mongoose');

let schema = mongoose.Schema({
    name: { type: String, index: true, required: true },
    folder: { type: mongoose.Schema.ObjectId, ref: 'folder' },
    user: { type: mongoose.Schema.ObjectId, ref: 'user' },
    timestamp: Date,
    createdAt: Date,
    isDeleted: { type: Boolean }
});

module.exports = mongoose.model('folder', schema);