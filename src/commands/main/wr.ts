import { CommandInteraction as Interaction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { answer, errDB, getMapsAPI, validateMap, validateMode } from '../../globalFunctions';
import { specifiedMode } from '../modules/wr/specifiedMode';
import { unspecifiedMode } from '../modules/wr/unspecifiedMode';
import userSchema from '../../database/schemas/userSchema';
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('wr')
		.setDescription('Check the World Record of a map.')
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName('map').setDescription('Select a Map.').setRequired(true))
		.addStringOption((o) =>
			o
				.setName('mode')
				.setDescription('Select a Mode.')
				.setRequired(false)
				.addChoices({ name: 'KZT', value: 'KZTimer' })
				.addChoices({ name: 'SKZ', value: 'SimpleKZ' })
				.addChoices({ name: 'VNL', value: 'Vanilla' })
				.addChoices({ name: 'ALL', value: 'All 3 Modes' })
		),

	async execute(interaction: Interaction) {
		interaction.deferReply();

		userSchema.findOne(async (err: any, data: any) => {
			if (err) return errDB(interaction, err);

			let map: any = interaction.options.getString('map')!.toLowerCase();
			let mode = interaction.options.getString('mode') || null;
			const globalMaps = await getMapsAPI(interaction);
			let response: any = {};

			/* Validate Map */
			map = await validateMap(map, globalMaps);
			if (!map.name) return answer(interaction, { content: 'Please specify a valid map.' });

			/* Validate Mode */
			const modeVal = await validateMode(interaction, mode, data, interaction.user.id);

			/* Execute API Requests */
			if (modeVal.specified) response = await specifiedMode(interaction, map, 0, modeVal.mode);
			else response = await unspecifiedMode(interaction, map, 0);

			/* Reply to the user */
			answer(interaction, { embeds: [response] });
		});
	},
};
