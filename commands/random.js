const { SlashCommandBuilder } = require("@discordjs/builders");
const globalFunctions = require("../globalFunctions");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("random")
		.setDescription("Get a random KZ map.")
		.setDefaultPermission(true)
		.addIntegerOption((o) =>
			o
				.setName("tier")
				.setDescription("Filter for a specific tier.")
				.setRequired(false)
				.addChoice("1 (Very Easy)", 1)
				.addChoice("2 (Easy)", 2)
				.addChoice("3 (Medium)", 3)
				.addChoice("4 (Hard)", 4)
				.addChoice("5 (Very Hard)", 5)
				.addChoice("6 (Extreme)", 6)
				.addChoice("7 (Death)", 7)
		),

	async execute(interaction) {
		async function answer(input) {
			await interaction.reply(input);
		}

		let tier = interaction.options.getInteger("tier") || null;
		const globalMaps = await globalFunctions.getMapsAPI();
		const maps = [];

		if (tier !== null) {
			globalMaps.forEach((x) => {
				if (x.difficulty === tier) maps.push(x.name);
			});

			const map = maps[Math.floor(Math.random() * maps.length)];
			return answer({ content: `🎲 \`${map}\`` });
		} else {
			const map = globalMaps[Math.floor(Math.random() * globalMaps.length)].name;
			return answer({ content: `🎲 \`${map}\`` });
		}
	},
};
