const mongoose = require('mongoose');

let clientSchema = new mongoose.Schema ({
    businessName: {type: String, required: true},
    contactName: {type: String, required: true},
    contactEmail: {type: String, required: true},
    contactPhone: {type: String, required: true},
    add1: String,
    add2: String,
    addCity: String,
    addCounty: String,
    addPost: String,
    rootUser: {type: String, required: true, unique: true},
    basicCal: {type: Object}
});

module.exports = mongoose.model('client', clientSchema);