const express = require('express')
const { server, app } = require('./socket');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config()
const cors = require('cors');
const mongourl = "mongodb+srv://khan03117:khan03117@cluster0.qu09pn9.mongodb.net/letsmove";
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
const bannerRoutes = require('./routes/bannerRoutes');
const userroutes = require('./routes/user.routes');
const settingRouts = require('./routes/SettingRoutes');
const comRoute = require('./routes/community.routes');
const eventRoute = require('./routes/event.routes');
const policyRoute = require('./routes/policy.routes');
const faqRoute = require('./routes/faq.routes');
const challengeRoute = require('./routes/challange.route');
const adminRoutes = require('./routes/adminAuthRoutes');
const mealRoutes = require('./routes/mealRoutes');
const workoutRoutes = require('./routes/workoutRoute');
const uactivity = require('./routes/UserActivity');
const goalRoute = require('./routes/dailyGoal.route');

app.use('/api/v1/matadata', mroutes);
app.use('/api/v1/banner', bannerRoutes);
app.use('/api/v1/user', userroutes);
app.use('/api/v1/setting', settingRouts);
app.use('/api/v1/community', comRoute);
app.use('/api/v1/event', eventRoute);
app.use('/api/v1/policy', policyRoute);
app.use('/api/v1/challenge', challengeRoute);
app.use('/api/v1/faq', faqRoute);
app.use('/api/v1/letsmove', adminRoutes);
app.use('/api/v1/meal', mealRoutes);
app.use('/api/v1/workout', workoutRoutes);
app.use('/api/v1/user-activity', uactivity);
app.use('/api/v1/goal', goalRoute);


server.listen(port, () => {
    console.log(`Lets Move api Server running at https://localhost:${port}`);
});