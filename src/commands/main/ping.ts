import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction as Interaction } from "discord.js";
import { answer } from "../../globalFunctions";

module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Pong!").setDefaultPermission(true),

	async execute(interaction: Interaction) {
		answer(interaction, { content: "Pong!" });
	},
};
