const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        fullname: {
            type: String,
            require: true,
            minlenght: 5,
            maxlenght: 30,
        },
        avatar: {
            type: String,
            maxlenght: 200,
            require: false,
        },
        email: {
            type: String,
            require: false,
            maxlenght: 40,
            unique: true,
        },
        phone: {
            type: String,
            require: false,
            maxlenght: 12,
            unique: true,
        },
        address: {
            type: String,
            maxlenght: 40,
            require: false,
        },
        username: {
            type: String,
            require: false,
            maxlenght: 40,
            unique: true,
        },
        password: {
            type: String,
            require: false,
            maxlenght: 40,
        },
        facebookUserId: {
            type: String,
            maxlenght: 100,
        },
        googleUserId: {
            type: String,
            maxlenght: 100,
        },
        admin: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

module.exports = mongoose.model('User', userSchema);
