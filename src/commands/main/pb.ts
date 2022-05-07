import { CommandInteraction as Interaction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import userSchema from "../../database/schemas/userSchema";
import { answer, errDB, getMapsAPI, getSteamID_DB, validateMap, validateMode, validateTarget } from "../../globalFunctions";
import { specifiedMode } from "../modules/pb/specifiedMode";
import { unspecifiedMode } from "../modules/pb/unspecifiedMode";
require("dotenv").config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pb")
		.setDescription("Check someone's personal best on a map.")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName("map").setDescription("Select a Map.").setRequired(true))
		.addStringOption((o) => o.setName("target").setDescription("Select a Player.").setRequired(false))
		.addStringOption((o) =>
			o
				.setName("mode")
				.setDescription("Select a Mode.")
				.setRequired(false)
				.addChoices({ name: "KZT", value: "KZTimer" })
				.addChoices({ name: "SKZ", value: "SimpleKZ" })
				.addChoices({ name: "VNL", value: "Vanilla" })
				.addChoices({ name: "ALL", value: "All 3 Modes" })
		),

	async execute(interaction: Interaction) {
		interaction.deferReply();

		userSchema.findOne(async (err: any, data: any) => {
			if (err) return errDB(interaction, err);

			let map: any = interaction.options.getString("map")!.toLowerCase();
			let target = interaction.options.getString("target") || null;
			let mode = interaction.options.getString("mode") || null;
			let steamID = null;
			const globalMaps = await getMapsAPI(interaction);
			let response: any = {};

			/* Validate Map */
			map = await validateMap(map, globalMaps);
			if (map === {}) return answer(interaction, { content: "Please specify a valid map." });

			/* Validate Target */
			if (!target) target = interaction.user.id;
			else steamID = (await validateTarget(interaction, target)).steam_id;
			if (!steamID) steamID = await getSteamID_DB(interaction, data, target);

			/* Validate Mode */
			const modeVal = await validateMode(interaction, mode, data, target);

			/* Execute API Requests */
			if (modeVal.specified) response = await specifiedMode(interaction, steamID, map, 0, modeVal.mode);
			else response = await unspecifiedMode(interaction, steamID, map, 0);

			/* Reply to the user */
			answer(interaction, { embeds: [response] });
		});
	},
};
