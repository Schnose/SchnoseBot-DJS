import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction as Interaction } from 'discord.js';
import { answer, errAPI, errDB, getMapsAPI, getSteamID_DB, validateMode, validateTarget } from '../../globalFunctions';
import userSchema from '../../database/schemas/userSchema';
import { unfinishedMaps } from '../modules/unfinished/unfinishedMaps';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unfinished')
		.setDescription('Check which maps you still have to complete.')
		.setDefaultPermission(true)
		.addIntegerOption((o) =>
			o
				.setName('tier')
				.setDescription('Filter for a specific tier.')
				.setRequired(false)
				.addChoices({ name: '1 (Very Easy)', value: 1 })
				.addChoices({ name: '2 (Easy)', value: 2 })
				.addChoices({ name: '3 (Medium)', value: 3 })
				.addChoices({ name: '4 (Hard)', value: 4 })
				.addChoices({ name: '5 (Very Hard)', value: 5 })
				.addChoices({ name: '6 (Extreme)', value: 6 })
				.addChoices({ name: '7 (Death)', value: 7 })
		)
		.addStringOption((o) =>
			o
				.setName('mode')
				.setDescription('Select a Mode.')
				.setRequired(false)
				.addChoices({ name: 'KZTimer', value: 'kz_timer' })
				.addChoices({ name: 'SimpleKZ', value: 'kz_simple' })
				.addChoices({ name: 'Vanilla', value: 'kz_vanilla' })
		)
		.addStringOption((o) =>
			o
				.setName('runtype')
				.setDescription('TP/PRO')
				.setRequired(false)
				.addChoices({ name: 'TP', value: 'true' })
				.addChoices({ name: 'PRO', value: 'false' })
		)
		.addStringOption((o) => o.setName('target').setDescription('Select a Player.').setRequired(false)),

	async execute(interaction: Interaction) {
		interaction.deferReply();

		const embed = userSchema.findOne(async (err: any, data: any) => {
			if (err) return errDB(interaction, err);

			let tier = interaction.options.getInteger('tier') || 0;
			let mode = interaction.options.getString('mode') || null;
			let runtype = interaction.options.getString('runtype') === 'true';
			let target = interaction.options.getString('target') || null;
			let user: any = {
				discordID: null,
				steam_id: null,
			};
			const globalMaps = await getMapsAPI(interaction);

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
			if (modeVal.mode === 'kz_timer') modeVal.mode = { name: 'kz_timer', displayName: 'KZTimer', id: 200 };
			else if (modeVal.mode === 'kz_simple') modeVal.mode = { name: 'kz_simple', displayName: 'SimpleKZ', id: 201 };
			else modeVal.mode = { name: 'kz_vanilla', displayName: 'Vanilla', id: 202 };

			/* Execute API Requests */
			const response = await unfinishedMaps(interaction, tier, modeVal.mode, runtype, user.steam_id, globalMaps);
			if (!response)
				return errAPI(interaction, {
					user: interaction.user.username,
					command: '/unfinished [1]',
					date: Date.now(),
					args: interaction.options,
				});

			/* Reply to the user */
			if (typeof response === 'object') return answer(interaction, { embeds: [response] });
			else if (typeof response === 'string')
				return answer(interaction, { content: "You don't have any maps left to complete! Good job!" });
			else
				errAPI(interaction, {
					user: interaction.user.username,
					command: '/unfinished [2]',
					date: Date.now(),
					args: interaction.options,
				});
		});
	},
};
