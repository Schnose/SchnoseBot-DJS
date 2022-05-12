import { CommandInteraction as Interaction } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import userSchema from '../../database/schemas/userSchema';
import {
	answer,
	errDB,
	getMapsAPI,
	getSteamID_DB,
	validateCourse,
	validateMap,
	validateMode,
	validateTarget,
} from '../../globalFunctions';
import { specifiedMode } from '../modules/pb/specifiedMode';
import { unspecifiedMode } from '../modules/pb/unspecifiedMode';
require('dotenv').config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName('bpb')
		.setDescription("Check someone's Personal Best on a bonus of a map.")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName('map').setDescription('Select a Map.').setRequired(true))
		.addIntegerOption((o) => o.setName('course').setDescription('Select a Course.').setRequired(false))
		.addStringOption((o) => o.setName('target').setDescription('Select a Player.').setRequired(false))
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
			const course = interaction.options.getInteger('course') || 1;
			let target = interaction.options.getString('target') || null;
			let mode = interaction.options.getString('mode') || null;
			let user: any = {
				discordID: null,
				steam_id: null,
			};
			const globalMaps = await getMapsAPI(interaction);
			let response: any = {};

			/* Validate Map */
			map = await validateMap(map, globalMaps);
			if (!map.name) return answer(interaction, { content: 'Please specify a valid map.' });

			/* Validate Course */
			if (!(await validateCourse(map.name, globalMaps, course)))
				return answer(interaction, { content: 'Please specify a valid course.' });

			/* Validate Target */
			if (!target) user.discordID = interaction.user.id;
			else user = await validateTarget(interaction, target);
			if (!user.steam_id) user.steam_id = await getSteamID_DB(interaction, data, user.discordID);

			/* Validate Mode */
			const modeVal = await validateMode(interaction, mode, data, user.discordID);
			if (!modeVal)
				return answer(interaction, {
					content: `You either have to specify a mode or set a default mode using the following command:\n \`\`\`\n/mode\n\`\`\``,
				});

			/* Execute API Requests */

			if (modeVal.specified) response = await specifiedMode(interaction, user.steam_id, map, course, modeVal.mode);
			else response = await unspecifiedMode(interaction, user.steam_id, map, course);

			/* Reply to the user */
			answer(interaction, { embeds: [response] });
		});
	},
};
