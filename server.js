const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

dotenv.config();

const app = express();

const port = process.env.PORT || 5000
const mongo = process.env.MONGO_DB

app.use(express.json());

app.listen(port, async() => {
    console.log(`Server started on ${port}`);

    await mongoose.connect(mongo)
    console.log('MongoDB Connected Successfully');
})