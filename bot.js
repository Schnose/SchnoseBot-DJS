const { Client } = require("discord.js");
const mongoose = require("mongoose");
const cmdHandler = require("./handlers/commandHandler");
const eventHandler = require("./handlers/eventHandler");
require("dotenv").config();

const client = new Client({ intents: 34595 });

cmdHandler(client);
eventHandler(client);

client.login(process.env.BOT_TOKEN).then(() => {
	if (!process.env.DATABASE_TOKEN) return console.log("No database found.");

	mongoose
		.connect(process.env.DATABASE_TOKEN, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		})
		.then(() => console.log("Schnose is now connected to his database."))
		.catch((e) => console.error(e));
});
