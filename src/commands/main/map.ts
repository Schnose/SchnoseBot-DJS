import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction as Interaction, MessageEmbed } from 'discord.js';
import { answer, errDB, getMapsAPI, getMapsKZGO, validateMap } from '../../globalFunctions';
import sheetSchema from '../../database/schemas/sheetSchema';
import { mapData } from '../modules/map/mapData';
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('map')
		.setDescription('Get detailed information on a map.')
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName('map').setDescription('Select a Map.').setRequired(true)),

	async execute(interaction: Interaction) {
		sheetSchema.findOne(async (err: any, data: any) => {
			if (err || !data) {
				errDB(interaction, err);
			}

			let map: any = interaction.options.getString('map')!.toLowerCase();
			const globalMaps = await getMapsAPI(interaction);
			const kzgoMaps = await getMapsKZGO(interaction);

			/* Vaildate Map */
			map = await validateMap(map, globalMaps);
			if (!map.name) return answer(interaction, { content: 'Please specify a valid map.' });

			/* Execute API Requests */
			const mapEmbed = await mapData(interaction, data, map, kzgoMaps);

			/* Reply to the user */
			answer(interaction, { embeds: [mapEmbed] });
		});
	},
};
