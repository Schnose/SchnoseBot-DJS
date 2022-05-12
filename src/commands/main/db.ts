import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction as Interaction, MessageEmbed } from 'discord.js';
import userSchema from '../../database/schemas/userSchema';
import { answer, errDB } from '../../globalFunctions';
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('db')
		.setDescription('Check your current Database entries.')
		.setDefaultPermission(true),

	async execute(interaction: Interaction) {
		userSchema.findOne(async (err: any, data: any) => {
			if (err) return errDB(interaction, err);

			if (!data) return answer(interaction, { content: "You don't have any Database entries." });

			let [USERID, STEAMID, MODE] = '';
			if (data.List[interaction.user.id].userId) USERID = data.List[interaction.user.id].userId;
			else USERID = '?';
			if (data.List[interaction.user.id].steamId) STEAMID = data.List[interaction.user.id].steamId;
			else STEAMID = '?';
			if (data.List[interaction.user.id].mode) MODE = data.List[interaction.user.id].mode;
			else MODE = '?';

			let embed = new MessageEmbed()
				.setColor('#7480C2')
				.setTitle('Your current Database entries:')
				.setDescription(`> userID: ${USERID}\n> steamID: ${STEAMID}\n> mode: ${MODE}`)
				.setFooter({
					text: '(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church',
					iconURL: process.env.ICON,
				});
			answer(interaction, { embeds: [embed], ephemeral: true });
		});
	},
};
