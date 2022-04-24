const { SlashCommandBuilder } = require("@discordjs/builders");
const globalFunctions = require("../globalFunctions");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("apistatus")
		.setDescription("Check the current Status of the GlobalAPI")
		.setDefaultPermission(true),

	async execute(interaction) {
		async function answer(input) {
			await interaction.reply(input);
		}

		const status = await globalFunctions.checkAPI();
		if (status === "bad") return answer({ content: "no 😔" });
		else return answer({ content: "chilling 🍦" });
	},
};
