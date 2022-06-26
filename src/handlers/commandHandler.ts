import {
	Client,
	Collection,
	CommandInteraction,
	Interaction,
	MessageEmbed,
} from "discord.js";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v9";
import { getFiles } from "../lib/functions";
import "dotenv/config";

export async function commandHandler(client: Client) {
	const commands: JSON[] = [];
	const commandList: string[] = [];
	const suffix = ".js";
	const commandFiles = await getFiles(
		`${process.cwd()}/dist/commands/**/main`,
		suffix
	);
	client.commands = new Collection();

	for (const command of commandFiles) {
		let commandFile = require(command);
		if (commandFile.default) commandFile = commandFile.default;
		if (process.env.MODE !== "DEV" && process.env.MODE !== "PROD")
			return console.log("Please configure your .env properly. (MODE)");

		commands.push(commandFile.data.toJSON());
		commandList.push(commandFile.data.name);
		client.commands.set(commandFile.data.name, commandFile);
	}

	// startup
	(async () => {
		const rest = new REST({ version: "9" }).setToken(process.env.BOT!);

		try {
			switch (process.env.MODE) {
				case "DEV":
					await rest.put(
						Routes.applicationGuildCommands(
							client.user!.id,
							process.env.DEV_GUILD!
						),
						{ body: commands }
					);
					console.log("[LOCAL] Successfully registered commands:");
					console.log(commandList);
					break;

				case "PROD":
					await rest.put(Routes.applicationCommands(client.user!.id), {
						body: commands,
					});
					console.log("[GLOBAL] Successfully registered commands:");
					console.log(commandList);
					break;

				default:
					return console.error(
						"Please configure your .env properly. (MODE / DEV_GUILD)"
					);
			}
		} catch (err: unknown) {
			return console.error(err);
		}
	})();

	// listening for commands
	client.on("interactionCreate", async (interaction: Interaction) => {
		if (interaction.isCommand()) {
			const command = client.commands.get(interaction.commandName);
			if (!command) return;

			try {
				await command.execute(interaction);
			} catch (err: unknown) {
				console.error(err);
			}
		}
	});
}
