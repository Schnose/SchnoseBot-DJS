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
		async function answer(input) {
			await interaction.reply(input);
		}

		let approx = interaction.options.getNumber("distance") + (interaction.options.getNumber("max") / 128) * 4;

		answer({ content: `Approximated Distance: \`${approx.toFixed(4)}\`` });
	},
};
