const mongoose = require('mongoose');

let newsSchema = new mongoose.Schema ({
    author: {type: String, required: true},
    title: {type: String, required: true},
    subHeading: {type: String},
    mainImage: {type: String, required: true},
    additionalImages: {type: Array},
    article: {type: String, required: true},
    date: {type: String, required: true}
});

module.exports = mongoose.model('news', newsSchema);