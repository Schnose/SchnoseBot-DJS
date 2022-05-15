import { Collection, MessageEmbed } from 'discord.js';
import { REST } from '@discordjs/rest';
import { Routes } from 'discord-api-types/v9';
import { MODE } from '../config.json';
import { getFiles } from '../globalFunctions';
require('dotenv').config();

export async function commandHandler(client: any) {
	const commands: any[] = [];
	const commandList: any[] = [];
	const suffix = '.js';
	const commandFiles = getFiles(`${process.cwd()}/dist/commands/main`, suffix);
	client.commands = new Collection();

	for (const command of commandFiles) {
		let commandFile = require(command);
		if (commandFile.default) commandFile = commandFile.default;
		if (MODE !== 'PROD' && MODE !== 'DEV') return console.log('Invalid config.json');

		commands.push(commandFile.data.toJSON());
		commandList.push(commandFile.data.name);
		client.commands.set(commandFile.data.name, commandFile);
	}

	client.once('ready', () => {
		const CLIENT_ID = client.user.id;
		const rest = new REST({ version: '9' }).setToken(process.env.BOT_TOKEN!);

		// Registering Commands
		(async () => {
			try {
				switch (MODE) {
					case 'DEV':
						await rest.put(Routes.applicationGuildCommands(CLIENT_ID, process.env.DEV_SERVER!), { body: commands });
						console.log('Sucessfully registered commands locally.');
						console.log(commandList);
						break;
					case 'PROD':
						await rest.put(Routes.applicationCommands(CLIENT_ID), { body: commands });
						console.log('Successfully registered commands globally.');
						console.log(commandList);
						break;
					default:
						return console.log('Failed to register commands.');
				}
			} catch (e) {
				console.error(e);
			}
		})();
	});

	client.on('interactionCreate', async (interaction: any) => {
		// Executing Commands
		if (interaction.isCommand() || interaction.isContextMenu()) {
			const command = client.commands.get(interaction.commandName);
			if (!command) return;

			try {
				await command.execute(interaction);
			} catch (e) {
				console.error(e);
			}
		}

		if (interaction.isSelectMenu()) {
			if (interaction.customId === 'commands-menu') {
				let embedTitle = '';
				let embedDescription = '';

				// interaction.values is an array, but always only has 1 element (for now)
				switch (interaction.values[0]) {
					case 'apistatus-value':
						embedTitle = `/apistatus`;
						embedDescription = `This command will tell you whether the GlobalAPI is up or not.`;
						break;

					case 'bmaptop-value':
						embedTitle = `/bmaptop`;
						embedDescription = `This command will give you a list of the top 100 times set on a bonus course.\nYou can specify the following parameters:\n> map*\n> course\n> mode\n> runtype\n\n*required`;
						break;

					case 'bpb-value':
						embedTitle = `/bpb`;
						embedDescription = `This command will show you your (or another player's) best time on a bonus course.\nYou can specify the following parameters:\n> map*\n> course\n> target\n> mode\n\n*required`;
						break;

					case 'btop-value':
						embedTitle = `/btop`;
						embedDescription = `This command will give you a list of the top 100 BWR holders.\nYou can specify the following parameters:\n> mode\n> runtype`;
						break;

					case 'bwr-value':
						embedTitle = `/bwr`;
						embedDescription = `This command will show you the WR of a given bonus course.\nYou can specify the following parameters:\n> map*\n> course\n> mode\n\n*required`;
						break;

					case 'db-value':
						embedTitle = `/db`;
						embedDescription = `This command will show you your current database entries.\nExample output:\n> userID: 291585142164815873\n> steamID: STEAM_1:1:161178172\n> mode: kz_simple`;
						break;

					case 'invite-value':
						embedTitle = `/invite`;
						embedDescription = `This command will give you a link to invite the bot to your own Discord Server.`;
						break;

					case 'map-value':
						embedTitle = `/map`;
						embedDescription = `This command will give you detailed information on a map, such as it's name, tier, mappers, etc.`;
						break;

					case 'maptop-value':
						embedTitle = `/maptop`;
						embedDescription = `This command will give you a list of the top 100 times set on a map.\nYou can specify the following parameters:\n> map*\n> mode\n> runtype\n\n*required`;
						break;

					case 'mode-value':
						embedTitle = `/mode`;
						embedDescription = `This command will either show you your current mode preference or you can specify a mode and overwrite your previous preference. This will allow you to use a lot of other commands without needing to specify a mode everytime.`;
						break;

					case 'nocrouch-value':
						embedTitle = `/nocrouch`;
						embedDescription = `If you LongJump without crouching at the end, you will lose a lot of distance; typically around 11 units. This command will give you a close approximation of how far your jump could have been if you had crouched. The command assumes that your jump was done on 128t and that your \`max\` was the speed you had at the end of your jump.`;
						break;

					case 'pb-value':
						embedTitle = `/pb`;
						embedDescription = `This command will show you your (or another player's) best time on a map.\nYou can specify the following parameters:\n> map*\n> target\n> mode\n\n*required`;
						break;

					/*
						* this will be added later
					case 'profile-value':
						embedTitle = `/profile`;
						embedDescription = `This command will give you an overview of your (or another player's) map completion, current points, WR count and mode preference.`;
						break;
						*/

					case 'random-value':
						embedTitle = `/random`;
						embedDescription = `This command will give you a random KZ map to play. You can sort by tiers as well, if you want to.`;
						break;
					case 'recent-value':
						embedTitle = `/recent`;
						embedDescription = `This command will show you your (or another player's) most recent PB.`;
						break;

					case 'setsteam-value':
						embedTitle = `/setsteam`;
						embedDescription = `This command will store your steamID in Schnose's database so that it can be used in other commands to check player specific information.`;
						break;

					case 'top-value':
						embedTitle = `/top`;
						embedDescription = `This command will give you a list of the top 100 WR holders.\nYou can specify the following parameters:\n> mode\n> runtype`;
						break;

					case 'unfinished-value':
						embedTitle = `/unfinished`;
						embedDescription = `This command will give you a list of maps you have not yet completed.\nYou can specify the following parameters:\n> tier\n> runtype\n> target\n> mode`;
						break;

					case 'wr-value':
						embedTitle = `/wr`;
						embedDescription = `This command will show you the World Record of a given map.\nYou can specify the following parameters:\n> map*\n> mode\n\n*required`;
						break;
				}

				let helpEmbed = new MessageEmbed()
					.setColor('#7480C2')
					.setTitle(embedTitle)
					.setDescription(embedDescription)
					.setFooter({ text: '(͡ ͡° ͜ つ ͡͡°)7', iconURL: process.env.ICON });

				return interaction.update({ embeds: [helpEmbed], ephemeral: true });
			}
		}
	});
}
