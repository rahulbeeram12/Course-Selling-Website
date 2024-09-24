const express = require('express');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// routes
const userRoute = require('./routes/userRoute');
const creatorRoute = require('./routes/creatorRoute');

const app = express();
dotenv.config();

app.use(express.json());

app.use('/api/v1/user', userRoute);
app.use('/api/v1/creator', creatorRoute);

async function main() {
    await mongoose.connect(process.env.MONGODB_URL);
    app.listen(process.env.PORT || 5000);
}

main();