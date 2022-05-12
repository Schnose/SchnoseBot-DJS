import { CommandInteraction as Interaction, MessageButton } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
//@ts-ignore
import paginationEmbed from 'discordjs-button-pagination';
import { answer, errDB, getMapsAPI, validateCourse, validateMap, validateMode } from '../../globalFunctions';
import userSchema from '../../database/schemas/userSchema';
import { fetchLeaderboard } from '../modules/maptop/fetchLeaderboard';
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bmaptop')
		.setDescription('Check a bonus Top 100.')
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName('map').setDescription('Select a Map.').setRequired(true))
		.addIntegerOption((o) => o.setName('course').setDescription('Select a Course.').setRequired(false))
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

			let map: any = interaction.options.getString('map')!.toLowerCase();
			const course = interaction.options.getInteger('course') || 1;
			let mode = interaction.options.getString('mode') || null;
			let runtype = interaction.options.getString('runtype') === 'true' ? true : false;
			const globalMaps = await getMapsAPI(interaction);
			let response: any = [{}];

			/* Validate Map */
			map = await validateMap(map, globalMaps);
			if (!map.name) return answer(interaction, { content: 'Please specify a valid map.' });

			/* Validate Course */
			if (!(await validateCourse(map.name, globalMaps, course)))
				return answer(interaction, { content: 'Please specify a valid course.' });

			/* Validate Mode */
			const modeVal = await validateMode(interaction, mode, data, interaction.user.id);

			/* Execute API Requests */
			if (modeVal.specified) {
				response = await fetchLeaderboard(interaction, map, modeVal.mode, course, runtype);
				if (!response[0]) return answer(interaction, { content: 'This map seems to have 0 completions.' });
			} else return answer(interaction, { content: 'Please specify a mode or set a default one with `/mode`' });

			/* Reply to the user */
			const [button1, button2] = [
				new MessageButton().setCustomId('previousbtn').setLabel('<').setStyle('PRIMARY'),
				new MessageButton().setCustomId('nextbtn').setLabel('>').setStyle('PRIMARY'),
			];

			paginationEmbed(interaction, response, [button1, button2], 1000 * 60 * 5);
		});
	},
};
