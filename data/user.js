const mongoose = require('mongoose');

let schema = mongoose.Schema({
    email: { type: String, index: true, required: true, unique: true },
    hash: String,

    firstname: { type: String, index: true, require: true},
    lastname: { type: String, index: true, require: true},
    address: { type: String, index: true},
    phone: { type: String, index: true},

    lastLogin: Date,
    createdAt: Date,

    isDisabled: { type: Boolean, required: true },

    data: Object
});

module.exports = mongoose.model('user', schema);