const express = require('express')
const { server, app } = require('./socket');
const mongoose = require('mongoose');
const path = require('path');
const database = mongoose.connection;
database.on('error', (error) => {
    console.log('database connection error')
});
process.env.TZ = "Asia/Kolkata";
const port = 6200;
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));
app.get('/', (req, res) => res.send('Lets Move api started successfully.'));
const mroutes = require('./routes/matadataRoutes');
app.use('/matadata', mroutes);
server.listen(port, () => {
    console.log(`Lets Move api Server running at https://localhost:${port}`);
});
