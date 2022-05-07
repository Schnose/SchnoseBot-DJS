import { Client } from "discord.js";
import mongoose from "mongoose";
import { commandHandler } from "./handlers/commandHandler";
import { eventHandler } from "./handlers/eventHandler";
require("dotenv").config();

const Bot = new Client({ intents: 34595 });
commandHandler(Bot);
eventHandler(Bot);

Bot.login(process.env.BOT_TOKEN).then(() => {
	if (!process.env.DATABASE_TOKEN) return console.log("No Database found.");

	mongoose
		.connect(process.env.DATABASE_TOKEN)
		.then(() => console.log("Schnose is now connected to his Database."))
		.catch((e: any) => console.error(e));
});
