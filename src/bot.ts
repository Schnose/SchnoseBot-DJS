import { Client } from "discord.js";
import mongoose from "mongoose";
import { commandHandler } from "./handlers/commandHandler";
import { eventHandler } from "./handlers/eventHandler";
import "dotenv/config";

const schnose = new Client({ intents: 34595 });
eventHandler(schnose);

schnose.login(process.env.BOT).then(() => {
	commandHandler(schnose);

	if (!process.env.DATABASE) return console.log("No database was found.");

	mongoose
		.connect(process.env.DATABASE)
		.then(() =>
			console.log("Successfully established a connection to the database.")
		)
		.catch((err: unknown) => console.error(err));
});
