const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const aiRoute = require('./routes/ai');

const app = express();
dotenv.config();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGOOSEDB_URL, () => {
    console.log('CONNECT MONGOOSE SUCCESS!');
});

app.use(cookieParser());
app.use(express.json());

//ROUTES
app.use('/v1/auth', authRoute);
app.use('/v1/user', userRoute);
app.use('/v1/ai', aiRoute);


console.log('GEMINI_API_KEY loaded?', !!process.env.GEMINI_API_KEY);

app.listen(port, () => {
    console.log(`SERVER IS RUNNING! http://localhost:${port}`);
});
