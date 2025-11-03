const express = require('express')
const { server, app } = require('./socket');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config()
const cors = require('cors');
const mongourl = "mongodb+srv://franticnoida2016:franticnoida2016@cluster0.9n1kpyn.mongodb.net/refreshapp";
mongoose.connect(mongourl);
const database = mongoose.connection;
database.on('error', (error) => {
    console.log('database connection error')
});
database.on('connect', () => {
    console.log('database connection connected successfully')
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
const bannerRoutes = require('./routes/bannerRoutes')
app.use('/api/v1/matadata', mroutes);
app.use('/api/v1/banner', bannerRoutes);
server.listen(port, () => {
    console.log(`Lets Move api Server running at https://localhost:${port}`);
});
