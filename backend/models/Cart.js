const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            require: true,
        },
        productId: {
            type: String,
            require: true,
        },
        description: {
            type: String,
            require: true,
        },
        avatar: {
            type: String,
            require: true,
        },
        price: {
            type: Number,
            require: true,
        },
        count: {
            type: Number,
            require: true,
        },
        productTotal: {
            type: Number,
            require: true,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Cart', cartSchema);
