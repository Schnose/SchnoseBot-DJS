import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction as Interaction } from "discord.js";
import userSchema from "../../database/schemas/userSchema";
import { answer, errDB, getMapsAPI, getRecent, getSteamID_DB, validateTarget } from "../../globalFunctions";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("recent")
		.setDescription("Get a player's most recent Personal Best.")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName("target").setDescription("Select a Player.").setRequired(false)),

	async execute(interaction: Interaction) {
		interaction.deferReply();

		userSchema.findOne(async (err: any, data: any) => {
			if (err) errDB(interaction, err);

			let target = interaction.options.getString("target") || null;
			let runtype: boolean, mode: string;

			let user: any = {
				discordID: null,
				steam_id: null,
			};
			const globalMaps = await getMapsAPI(interaction);
			let response: any = {};

			/* Validate Target */
			if (!target) user.discordID = interaction.user.id;
			else user = await validateTarget(interaction, target);
			if (!user.steam_id) user.steam_id = await getSteamID_DB(interaction, data, user.discordID);

			console.log(user);

			/* Execute API Requests */
			let [TP, PRO] = await Promise.all([
				getRecent(interaction, user.steam_id, true),
				getRecent(interaction, user.steam_id, false),
			]);

			console.log(TP, PRO);

			/* Reply to the user */
			//answer(interaction, { embeds: [response] });
			answer(interaction, { content: "Hi" });
		});
	},
};
