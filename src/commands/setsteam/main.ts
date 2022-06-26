import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { isKZPlayer } from "../../lib/gokz";
import { answer, isSteamID } from "../../lib/functions";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("setsteam")
		.setDescription("Save your SteamID in our Database.")
		.addStringOption((o) =>
			o
				.setName("steamid")
				.setDescription("e.g. STEAM_1:1:161178172")
				.setRequired(true)
		),

	async execute(interaction: CommandInteraction) {
		const userInput = interaction.options.getString("steamid")!;

		if (!isSteamID(userInput))
			return answer(interaction, { content: "Please enter a valid SteamID." });
		if (!(await isKZPlayer(userInput)))
			return answer(interaction, {
				content: "That player has never played KZ before!",
			});

		return answer(interaction, {
			content: `SteamID ${userInput} registered for ${interaction.user.username}.`,
		});
	},
};
