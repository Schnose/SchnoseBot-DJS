const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("invite")
		.setDescription("Invite Schnose to your server!")
		.setDefaultPermission(true),

	async execute(interaction) {
		async function answer(input) {
			await interaction.reply(input);
		}

		let reply = "https://schnose.eu/bot";

		answer({ content: reply });
	},
};
