import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction as Interaction } from 'discord.js';
import { answer } from '../../globalFunctions';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('nocrouch')
		.setDescription('Approximate potential distance of a nocrouch jump.')
		.setDefaultPermission(true)
		.addNumberOption((o) => o.setName('distance').setDescription('The distance of your nocrouch jump').setRequired(true))
		.addNumberOption((o) => o.setName('max').setDescription('The max speed of your nocrouch jump').setRequired(true)),

	async execute(interaction: Interaction) {
		const distance = interaction.options.getNumber('distance');
		const maxSpeed = interaction.options.getNumber('max');
		const approxDistance = distance! + (maxSpeed! / 128) * 4;
		return answer(interaction, { content: `Approximated distance: \`${approxDistance.toFixed(4)}\`` });
	},
};
