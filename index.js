const { Client } = require('discord.js');
const mongoose = require('mongoose');
const commandReg = require('./handlers/commandHandler');
const eventReg = require('./handlers/eventHandler');
require('dotenv').config();

const client = new Client({
    intents: 32767,
});

commandReg(client);
eventReg(client);

client
    .login(process.env.LOGIN_TOKEN)
    .then(() => {
        if (!process.env.DATABASE_LINK) return console.log('No Database was found!');
        mongoose
            .connect(process.env.DATABASE_LINK, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            })
            .then(() => {
                console.log('(͡ ͡° ͜ つ ͡͡°) is now connected to his database!');
            })
            .catch((err) => console.log(err));
    })
    .catch((err) => console.log(err));
