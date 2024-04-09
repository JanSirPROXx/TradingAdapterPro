
//import express from 'express';
const express = require('express');
//import cors from 'cors';
const cors = require('cors');

const controller = require('./API/controller');

const app = express();

app.use(cors()); // Enable CORS
app.use(express.json()); // Middleware for parsing JSON

app.get('/',  (req, res) => {
    res.send('Welcome to the API');
});

app.get('/hello', (req, res) => {
    res.send('Hello Jan, whats up?');
});

app.post('/editPosition', controller.editPosition);

//open port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});