const mongoose = require('mongoose');

const NewsSchema = new mongoose.Schema({
    author: {
        type: String,
        require: true,
    },
    category: {
        type: String,
        require: true,
    },
    title: {
        type: String,
        require: true,
    },
    titlePhoto: {
        type: String,
        require: true,
    },

    eyes: {
        type: Number,
        require: true,
    },
    subTitle: {
        type: String,
        require: true,
    },
    content: {
        type: String,
        require: true,
    },
    dateCreate: {
        type: Date,
        require: true,
    },
    dateUpdate: {
        type: Date,
        require: true,
    },
});

module.exports = mongoose.model('News', NewsSchema);
