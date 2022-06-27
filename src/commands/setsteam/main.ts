import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { getPlayer, isKZPlayer } from "../../lib/gokz";
import { answer, errDB, isSteamID } from "../../lib/functions";
import userSchema from "../../schemas/user";

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

		const User = await userSchema.find({ discordID: interaction.user.id });
		if (User[0]) {
			try {
				await userSchema.findOneAndUpdate(
					{ discordID: interaction.user.id },
					{ steamID: userInput }
				);
				return answer(interaction, {
					content: `Successfully updated \`${userInput}\` for \`${User[0].name}\`.`,
				});
			} catch (err: unknown) {
				const { message } = await errDB(err);
				return answer(interaction, { content: message });
			}
		} else {
			try {
				const steamUser = await getPlayer(userInput);
				console.log(steamUser);
				await userSchema.create({
					name: steamUser.data![0].name,
					discordID: interaction.user.id,
					steamID: steamUser.data![0].steam_id,
					mode: null,
				});

				return answer(interaction, {
					content: `Successfully registered \`${userInput}\` for \`${
						steamUser.data![0].name
					}\`.`,
				});
			} catch (err: unknown) {
				const { message } = await errDB(err);
				return answer(interaction, { content: message });
			}
		}
	},
};
