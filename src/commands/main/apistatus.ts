import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageEmbed } from 'discord.js';
import { CommandInteraction as Interaction } from 'discord.js';
import { answer, checkAPI } from '../../globalFunctions';

module.exports = {
	data: new SlashCommandBuilder().setName('apistatus').setDescription('Check the GlobalAPI Status.').setDefaultPermission(true),

	async execute(interaction: Interaction) {
		const apiStatus: any = await checkAPI(interaction);
		const description = apiStatus[1].latest ? `**Latest Incident**\n${apiStatus[1].latest}\n` : '';

		const statusEmbed = new MessageEmbed()
			.setColor('#7480C2')
			.setTitle(`${apiStatus[0]!.status}`)
			.setThumbnail('https://dka575ofm4ao0.cloudfront.net/pages-transactional_logos/retina/74372/kz-icon.png')
			.setDescription(description)
			.addFields(
				{
					name: 'FrontEnd',
					value: `${apiStatus[0]!.frontend}`,
					inline: true,
				},
				{
					name: 'BackEnd',
					value: `${apiStatus[0]!.backend}`,
					inline: true,
				}
			)
			.setFooter({
				text: '(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church',
				iconURL: process.env.ICON,
			});
		return answer(interaction, { embeds: [statusEmbed] });
	},
};
