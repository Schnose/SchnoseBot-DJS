import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction as Interaction } from 'discord.js';
import { answer } from '../../globalFunctions';

module.exports = {
	data: new SlashCommandBuilder().setName('invite').setDescription('Invite Schnose to your server!').setDefaultPermission(true),

	async execute(interaction: Interaction) {
		answer(interaction, { content: 'https://bot.schnose.eu/' });
	},
};
