const mongoose = require('mongoose');

let faqSchema = new mongoose.Schema ({
    question: {type: String, required: true},
    answer: {type: String, required: true},
    postedBy: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }],
    edits: {type: Array}
});

module.exports = mongoose.model('faq', faqSchema);