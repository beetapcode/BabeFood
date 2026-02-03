const mongoose = require('mongoose');

const commentsSchema = new mongoose.Schema({
    user: {
        type: Object,
        require: true,
    },
    rating: {
        type: Number,
        require: true,
    },
    comment: {
        type: String,
        require: true,
    },
    reComment: {
        type: String,
        require: true,
    },
    dateComment: {
        type: Date,
        require: true,
    },
    dateReComment: {
        type: Date,
        require: true,
    },
    currentProduct: {
        type: Object,
        require: true,
    },
});

module.exports = mongoose.model('Comments', commentsSchema);
