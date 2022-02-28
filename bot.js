// Package Imports
const { Client } = require('discord.js');
const mongoose = require('mongoose');
require('dotenv').config();

// Initiating the Bot Instance
const client = new Client({
    intents: 32767,
});

// Command & Event Handlers
const commandReg = require('./handlers/commandHandler');
commandReg(client);

const eventReg = require('./handlers/eventHandler');
eventReg(client);

// Bot Login & Database Connection

client.login(process.env.BOT_TOKEN).then(() => {
    if (!process.env.DATABASE_LOGIN) return console.log('No Database found.');
    mongoose
        .connect(process.env.DATABASE_LOGIN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        .then(() => {
            console.log(`Bot is now connected to the Database.`);
        })
        .catch((err) => console.log(err));
});
