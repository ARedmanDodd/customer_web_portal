const mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

let userSchema = new mongoose.Schema ({
    firstName: {type: String, required: true},
    surname: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('user', userSchema);