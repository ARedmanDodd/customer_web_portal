const mongoose = require('mongoose');

let hrnSchema = new mongoose.Schema ({
    number: {type: String, required: true, unique: true},
    houseNumber: {type: String, required: true},
    postcode: {type: String, required: true},
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    active: {type: Boolean, default: false}
});

module.exports = mongoose.model('hrn', hrnSchema);