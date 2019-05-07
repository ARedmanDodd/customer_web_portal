const mongoose = require('mongoose');

let selfHelpSchema = new mongoose.Schema ({
    title: {type: String, required: true},
    guide: {type: String},
    description: {type: String}
});

module.exports = mongoose.model('selfHelp', selfHelpSchema);