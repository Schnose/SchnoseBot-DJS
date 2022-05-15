import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction as Interaction, Guild, MessageEmbed } from 'discord.js';
import { answer } from '../../globalFunctions';
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder().setName('servers').setDescription('DEV ONLY').setDefaultPermission(true),

	async execute(interaction: Interaction) {
		const iBrahizy = '295966419261063168';
		if (interaction.user.id !== process.env.BOT_OWNER && interaction.user.id !== iBrahizy)
			return answer(interaction, { content: 'nt try', ephemeral: true });

		const guilds: Guild[] = [];

		await interaction.client.guilds.fetch();
		interaction.client.guilds.cache.forEach((guild: Guild) => {
			guilds.push(guild);
		});

		const embed = new MessageEmbed()
			.setColor('#7480C2')
			.setTitle('Servers:')
			.setDescription(`\n> ${guilds.join('\n> ')}`)
			.setFooter({
				text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
				iconURL: process.env.ICON,
			});

		return answer(interaction, { embeds: [embed], ephemeral: true });
	},
};
