const mongoose = require('mongoose'),
    passportLocalMongoose = require('passport-local-mongoose');

let userSchema = new mongoose.Schema ({
    HRN_Number: {type: String, required: true, unique: true},
    site_account_number: {type: String, required: true, unique: true},
    firstName: {type: String, required: true},
    surname: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    email: {type: String, required: true, unique: true},
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    isSuperUser: {type: Boolean, default: false},
    isClientAdmin: {type: Boolean, default: false},
    clientID: {type: String}
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('user', userSchema);