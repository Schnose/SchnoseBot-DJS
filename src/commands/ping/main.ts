import { SlashCommandBuilder } from "@discordjs/builders";
import { CommandInteraction } from "discord.js";
import { answer } from "../../lib/functions";
import * as g from "../../lib/gokz";

module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Pong!"),

	async execute(interaction: CommandInteraction) {
		await interaction.deferReply();
		const steamID = "STEAM_1:1:161178172";
		const globalMaps = await g.getMapsAPI();
		const penis = await g.isGlobal("kz_micropenis", globalMaps.data);
		console.log(penis);
		return answer(interaction, {
			content: `Pong! \`[${Date.now() - interaction.createdTimestamp}ms]\``,
		});
	},
};
