const { Collection } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");
const { icon, testServer, mode } = require("../config.json");
const globalFunctions = require("../globalFunctions");
const { MessageEmbed } = require("discord.js");
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
				let embedTitle = "";
				let embedDescription = "";

				// interaction.values is an array, but always only has 1 element (for now)
				switch (interaction.values[0]) {
					case "apistatus-value":
						embedTitle = `/apistatus`;
						embedDescription = `This command will tell you whether the GlobalAPI is up or not.`;
						break;

					case "bmaptop-value":
						embedTitle = `/bmaptop`;
						embedDescription = `This command will give you a list of the top 100 times set on a bonus course.\nYou can specify the following parameters:\n> map*\n> course\n> runtype\n> mode\n\n*required`;
						break;

					case "bpb-value":
						embedTitle = `/bpb`;
						embedDescription = `This command will show you your (or another player's) best time on a bonus course.\nYou can specify the following parameters:\n> map*\n> course\n> target\n> mode\n\n*required`;
						break;

					case "btop-value":
						embedTitle = `/btop`;
						embedDescription = `This command will give you a list of the top 100 BWR holders.\nYou can specify the following parameters:\n> runtype\n> mode`;
						break;

					case "bwr-value":
						embedTitle = `/bwr`;
						embedDescription = `This command will show you the WR of a given bonus course.\nYou can specify the following parameters:\n> map*\n> mode\n> course\n\n*required`;
						break;

					case "db-value":
						embedTitle = `/db`;
						embedDescription = `This command will show you your current database entries.\nExample output:\n> userID: 291585142164815873\n> steamID: STEAM_1:1:161178172\n> mode: kz_simple`;
						break;

					case "filters-value":
						embedTitle = `/filters`;
						embedDescription = `This command will show you the **record filters** for a given map. If a filter shows a ✅ you can submit times in that mode to the GlobalAPI.\nIf a filter shows a ❌ you cannot submit times in that mode to the GlobalAPI.`;
						break;

					case "invite-value":
						embedTitle = `/invite`;
						embedDescription = `This command will give you a link to invite the bot to your own Discord Server.`;
						break;

					case "map-value":
						embedTitle = `/map`;
						embedDescription = `This command will give you detailed information on a map, such as it's name, tier, mappers, etc.`;
						break;

					case "maptop-value":
						embedTitle = `/maptop`;
						embedDescription = `This command will give you a list of the top 100 times set on a map.\nYou can specify the following parameters:\n> map*\n> runtype\n> mode\n\n*required`;
						break;

					case "mode-value":
						embedTitle = `/mode`;
						embedDescription = `This command will either show you your current mode preference or you can specify a mode and overwrite your previous preference. This will allow you to use a lot of other commands without needing to specify a mode everytime.`;
						break;

					case "nocrouch-value":
						embedTitle = `/nocrouch`;
						embedDescription = `If you LongJump without crouching at the end, you will lose a lot of distance; typically around 11 units. This command will give you a close approximation of how far your jump could have been if you had crouched. The command assumes that your jump was done on 128t and that your \`max\` was the speed you had at the end of your jump.`;
						break;

					case "pb-value":
						embedTitle = `/pb`;
						embedDescription = `This command will show you your (or another player's) best time on a map.\nYou can specify the following parameters:\n> map*\n> target\n> mode\n\n*required`;
						break;

					case "profile-value":
						embedTitle = `/profile`;
						embedDescription = `This command will give you an overview of your (or another player's) map completion, current points, WR count and mode preference.`;
						break;

					case "random-value":
						embedTitle = `/random`;
						embedDescription = `This command will give you a random KZ map to play. You can sort by tiers as well, if you want to.`;
						break;
					case "recent-value":
						embedTitle = `/recent`;
						embedDescription = `This command will show you your (or another player's) most recent PB.`;
						break;

					case "setsteam-value":
						embedTitle = `/setsteam`;
						embedDescription = `This command will store your steamID in Schnose's database so that it can be used in other commands to check player specific information.`;
						break;

					case "top-value":
						embedTitle = `/top`;
						embedDescription = `This command will give you a list of the top 100 WR holders.\nYou can specify the following parameters:\n> runtype\n> mode`;
						break;

					case "unfinished-value":
						embedTitle = `/unfinished`;
						embedDescription = `This command will give you a list of maps you have not yet completed.\nYou can specify the following parameters:\n> tier\n> runtype\n> target\n> mode`;
						break;

					case "wr-value":
						embedTitle = `/wr`;
						embedDescription = `This command will show you the World Record of a given map.\nYou can specify the following parameters:\n> map*\n> mode\n\n*required`;
						break;
				}

				let helpEmbed = new MessageEmbed()
					.setColor("#7480C2")
					.setTitle(embedTitle)
					.setDescription(embedDescription)
					.setFooter({ text: "(͡ ͡° ͜ つ ͡͡°)7", iconURL: icon });

				console.log(interaction.values);
				return interaction.update({ embeds: [helpEmbed], ephemeral: true });
			}
		}
	});
}

module.exports = cmdHandler;
