const express = require('express')
const app = express()
const https = require('https');
const events = require('events');
const fs = require('fs');
const { WebSocketServer, WebSocket } = require("ws");
require('dotenv').config();
const productMode = process.env.NODE_PRODUCTION_MODE;

// const options = {
//     key: fs.readFileSync('./ssl/private.pem'),
//     cert: fs.readFileSync('./ssl/certificate.pem')
// }
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/frush.franticpro.com/privkey.pem', 'utf-8'),
    cert: fs.readFileSync('/etc/letsencrypt/live/frush.franticpro.com/fullchain.pem', 'utf-8'),
};

const server = https.createServer(options, app);
const wss = new WebSocketServer({ server });
const emitter = new events.EventEmitter();
module.exports = { app, server, emitter }