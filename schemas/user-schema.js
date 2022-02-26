const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userId: String,
    steamId: String,
    mode: String,
    List: Object,
});

module.exports = mongoose.model('users', userSchema);
