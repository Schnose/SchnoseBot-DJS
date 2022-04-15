const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder().setName("ping").setDescription("Pong!").setDefaultPermission(true),

	async execute(interaction) {
		let reply = "Pong!";
		async function answer(input) {
			await interaction.reply({ content: input });
		}
		answer(reply);
	},
};
