const mongoose = require('mongoose');

let schema = mongoose.Schema({
    email: { type: String, index: true, required: true, unique: true },
    hash: String,

    lastLogin: Date,
    createdAt: Date,

    isDisabled: { type: Boolean, required: true },

    data: Object
});

module.exports = mongoose.model('user', schema);