const { Collection } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { AlphaKeks, testServer, mode } = require("../config.json");
const globalFunctions = require("../globalFunctions");
const { helpEmbedOptions, helpEmbed } = require("../helpMenu");
require("dotenv").config();

async function cmdHandler(client) {
	const commands = [];
	const cmdList = [];
	const suffix = ".js";
	const cmdFiles = globalFunctions.getFiles(`${process.cwd()}/commands`, suffix);

	client.commands = new Collection();

	for (const cmd of cmdFiles) {
		let cmdFile = require(cmd);
		if (cmdFile.default) cmdFile = cmdFile.default;
		if (mode !== "PROD" && mode !== "DEV")
			return console.log("[1] Failed to register commands. Please check config.json");

		commands.push(cmdFile.data.toJSON());
		cmdList.push(cmdFile.data.name);
		client.commands.set(cmdFile.data.name, cmdFile);
	}

	client.once("ready", () => {
		const CLIENT_ID = client.user.id;
		const rest = new REST({ version: "9" }).setToken(process.env.BOT_TOKEN);

		// Registering Commands
		(async () => {
			try {
				// Dev mode
				if (mode === "DEV") {
					await rest.put(Routes.applicationGuildCommands(CLIENT_ID, testServer), {
						body: commands,
					});

					console.log("Successfully registered commands locally.");
					console.log(cmdList);
				}

				// Deploy mode
				else if (mode === "PROD") {
					await rest.put(Routes.applicationCommands(CLIENT_ID), {
						body: commands,
					});

					console.log("Successfully registered commands globally.");
					console.log(cmdList);
				}

				// Error in config.json
				else {
					return console.log("[2] Failed to register commands. Please check config.json");
				}
			} catch (e) {
				console.error(e);
			}
		})();
	});

	// Executing commands
	client.on("interactionCreate", async (interaction) => {
		if (interaction.isCommand() || interaction.isContextMenu()) {
			const cmd = client.commands.get(interaction.commandName);
			if (!cmd) return;

			try {
				await cmd.execute(interaction);
			} catch (e) {
				console.error(e);
			}
		}

		if (interaction.isSelectMenu()) {
			if (interaction.customId === "commands-menu") {
				if (interaction.values === "setsteam-value") {
					helpEmbedOptions.title = "/setsteam";
					helpEmbedOptions.description =
						"You can use this command to store your steamID in Schnose's database so that it can be used for other commands automatically.";
				} else if (interaction.values === "mode-value") {
					helpEmbedOptions.title = "/mode";
					helpEmbedOptions.description =
						"You can use this command to store your personal mode preference in Schnose's database so that it can be used for other commands automatically.";
				} else if (interaction.values === "invite-value") {
					helpEmbedOptions.title = "/invite";
					helpEmbedOptions.description = "You can use this command to get an invite link for Schnose.";
				}

				return interaction.update({ embeds: [helpEmbed], ephemeral: helpEmbedOptions.ephemeral });
			}
		}
	});
}

module.exports = cmdHandler;
