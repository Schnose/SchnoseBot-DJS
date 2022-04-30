const { SlashCommandBuilder } = require("@discordjs/builders");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("nocrouch")
		.setDescription("Approximate potential distance of a nocrouch jump.")
		.setDefaultPermission(true)
		.addNumberOption((o) =>
			o.setName("distance").setDescription("The distance of your nocrouch jump").setRequired(true)
		)
		.addNumberOption((o) => o.setName("max").setDescription("The max speed of your nocrouch jump").setRequired(true)),

	async execute(interaction) {
		await interaction.deferReply();
		async function answer(input) {
			await interaction.editReply(input);
		}

		let reply = "";
		let approx = interaction.options.getNumber("distance") + (interaction.options.getNumber("max") / 128) * 4;
		reply = `Approximated Distance: \`${approx.toFixed(4)}\``;

		answer({ content: reply });
	},
};
