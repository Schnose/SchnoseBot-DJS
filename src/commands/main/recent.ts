import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction as Interaction } from 'discord.js';
import userSchema from '../../database/schemas/userSchema';
import { answer, errDB, getSteamID_DB, validateTarget } from '../../globalFunctions';
import { getMostRecentPB } from '../modules/recent/getMostRecentPB';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('recent')
		.setDescription("Get a player's most recent Personal Best.")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName('target').setDescription('Select a Player.').setRequired(false)),

	async execute(interaction: Interaction) {
		interaction.deferReply();

		userSchema.findOne(async (err: any, data: any) => {
			if (err) errDB(interaction, err);

			let target = interaction.options.getString('target') || null;

			let user: any = {
				discordID: null,
				steam_id: null,
			};
			let response: any = {};

			/* Validate Target */
			if (!target) user.discordID = interaction.user.id;
			else user = await validateTarget(interaction, target);
			if (!user.steam_id) user.steam_id = await getSteamID_DB(interaction, data, user.discordID);

			/* Execute API Requests */
			response = await getMostRecentPB(interaction, user.steam_id);
			if (!response) return answer(interaction, { content: "This player doesn't have any recent times." });

			/* Reply to the user */
			answer(interaction, { embeds: [response] });
		});
	},
};
