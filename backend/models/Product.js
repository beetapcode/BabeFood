const mongoose = require('mongoose');

const productsSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            require: true,
            minlenght: 1,
            maxlenght: 50,
            unique: false,
        },
        product: {
            number: {
                type: Number,
                require: true,
                minlenght: 1,
                maxlenght: 50,
            },
            avatar: {
                type: String,
                require: true,
                minlenght: 1,
                maxlenght: 150,
            },
            description: {
                type: String,
                require: true,
                minlenght: 1,
                maxlenght: 150,
            },
            price: {
                type: Number,
                require: true,
                minlenght: 1,
                maxlenght: 50,
            },
            cost: {
                type: Number,
                require: true,
                minlenght: 1,
                maxlenght: 50,
            },
            percent: {
                type: Number,
                require: true,
                minlenght: 1,
                maxlenght: 50,
            },
            brandOrigin: {
                type: String,
                require: true,
                minlenght: 1,
                maxlenght: 150,
            },
            madeIn: {
                type: String,
                require: true,
                minlenght: 2,
                maxlenght: 150,
            },
            producer: {
                type: String,
                require: true,
                minlenght: 1,
                maxlenght: 150,
            },
            appropriateAge: {
                type: String,
                require: true,
                minlenght: 1,
                maxlenght: 150,
            },
            userManual: {
                type: String,
                require: true,
                minlenght: 1,
                maxlenght: 500,
            },
            storageInstructions: {
                type: String,
                require: true,
                minlenght: 1,
                maxlenght: 500,
            },
            weight: {
                type: String,
                require: true,
                minlenght: 1,
                maxlenght: 150,
            },
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('Product', productsSchema);
