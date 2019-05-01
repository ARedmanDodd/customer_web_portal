const mongoose = require('mongoose');

let styleSchema = new mongoose.Schema ({
    logo: {type: String, default:"/assets/images/logo.svg"}
});

module.exports = mongoose.model('style', styleSchema);