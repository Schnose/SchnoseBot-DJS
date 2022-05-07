import { CommandInteraction as Interaction } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { answer, getMapsAPI, validateMap } from "../../globalFunctions";
import { specifiedMode } from "../modules/wr/specifiedMode";
import { unspecifiedMode } from "../modules/wr/unspecifiedMode";
require("dotenv").config();

module.exports = {
	data: new SlashCommandBuilder()
		.setName("wr")
		.setDescription("Check the World Record of a map.")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName("map").setDescription("Select a Map.").setRequired(true))
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

		let map: any = interaction.options.getString("map")!.toLowerCase();
		let mode = interaction.options.getString("mode") || null;
		const globalMaps = await getMapsAPI(interaction);
		let response: any = {};

		/* Validate Map */
		map = await validateMap(map, globalMaps);
		if (map === {}) return answer(interaction, { content: "Please specify a valid map." });

		/* Execute API Requests */
		if (mode) response = await specifiedMode(interaction, map, 0, mode);
		else response = await unspecifiedMode(interaction, map, 0);

		/* Reply to the user */
		answer(interaction, { embeds: [response] });
	},
};
