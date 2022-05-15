import { SlashCommandBuilder } from '@discordjs/builders';
import { MessageButton } from 'discord.js';
import { CommandInteraction as Interaction } from 'discord.js';
//@ts-ignore
import paginationEmbed from 'discordjs-button-pagination';
import userSchema from '../../database/schemas/userSchema';
import { answer, errDB, validateMode } from '../../globalFunctions';
import { fetchLeaderboard } from '../modules/top/fetchLeaderboard';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('btop')
		.setDescription('Check who has the most Bonus World Records.')
		.setDefaultPermission(true)
		.addStringOption((o) =>
			o
				.setName('mode')
				.setDescription('Select a Mode.')
				.setRequired(false)
				.addChoices({ name: 'KZT', value: 'KZTimer' })
				.addChoices({ name: 'SKZ', value: 'SimpleKZ' })
				.addChoices({ name: 'VNL', value: 'Vanilla' })
				.addChoices({ name: 'ALL', value: 'All 3 Modes' })
		)
		.addStringOption((o) =>
			o
				.setName('runtype')
				.setDescription('TP/PRO')
				.addChoices({ name: 'TP', value: 'true' })
				.addChoices({ name: 'PRO', value: 'false' })
		),

	async execute(interaction: Interaction) {
		interaction.deferReply();

		userSchema.findOne(async (err: any, data: any) => {
			if (err) return errDB(interaction, err);

			let mode = interaction.options.getString('mode') || null;
			let runtype = interaction.options.getString('runtype') === 'true' ? true : false;
			let response: any;
			let stages: number[] = [];
			for (let i = 1; i < 101; i++) {
				stages.push(i);
			}

			/* Validate Mode */
			const modeVal = await validateMode(interaction, mode, data, interaction.user.id);

			/* Execute API Requests */
			if (modeVal.specified) {
				response = await fetchLeaderboard(interaction, modeVal.mode, stages, runtype);
			} else return answer(interaction, { content: 'Please specify a mode or set a default one with `/mode`.' });

			/* Reply to the user */
			const [button1, button2] = [
				new MessageButton().setCustomId('previousbtn').setLabel('<').setStyle('PRIMARY'),
				new MessageButton().setCustomId('nextbtn').setLabel('>').setStyle('PRIMARY'),
			];

			paginationEmbed(interaction, response, [button1, button2], 1000 * 60 * 5);
		});
	},
};
