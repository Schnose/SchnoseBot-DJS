import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { answer } from "../../lib/functions";

module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Pong!"),

	async execute(interaction: CommandInteraction) {
		return answer(interaction, {
			content: `Pong! \`[${Date.now() - interaction.createdTimestamp}ms]\``,
		});
	},
};
