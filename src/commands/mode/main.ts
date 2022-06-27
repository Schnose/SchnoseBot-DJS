import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { modeMap } from "../../lib/gokz";
import { answer } from "../../lib/functions";
import userSchema from "../../schemas/user";

module.exports = {
	data: new SlashCommandBuilder()
		.setName("mode")
		.setDescription("Save your preferred gamemode in our Database.")
		.addStringOption((o) =>
			o
				.setName("mode")
				.setDescription("Select a mode.")
				.setRequired(false)
				.addChoices({ name: "KZT", value: "kz_timer" })
				.addChoices({ name: "SKZ", value: "kz_simple" })
				.addChoices({ name: "VNL", value: "kz_vanilla" })
		),

	async execute(interaction: CommandInteraction) {
		const userInput = interaction.options.getString("mode") || null;
		const User = await userSchema.find({ discordID: interaction.user.id });

		if (!userInput) {
			if (!User[0]?.mode)
				return answer(interaction, {
					content: "You don't have a mode preference yet.",
					ephemeral: true,
				});
			else
				return answer(interaction, {
					content: `Your current mode preference is set to \`${User[0].mode}\`.`,
					ephemeral: true,
				});
		} else {
			if (!User[0])
				await userSchema.create({
					name: interaction.user.username,
					discordID: interaction.user.id,
					steamID: null,
					mode: userInput,
				});
			else
				await userSchema.findOneAndUpdate(
					{ discordID: interaction.user.id },
					{ mode: userInput }
				);

			return answer(interaction, {
				content: `Successfully set \`${modeMap.get(userInput)}\` for \`${
					interaction.user.username
				}\`.`,
				ephemeral: true,
			});
		}
	},
};
