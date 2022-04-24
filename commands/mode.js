const { SlashCommandBuilder } = require("@discordjs/builders");
const userSchema = require("../database/user-schema");
const globalFunctions = require("../globalFunctions");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("mode")
		.setDescription("Save your preferred gamemode in Schnose's database.")
		.setDefaultPermission(true)
		.addStringOption((o) =>
			o
				.setName("mode")
				.setDescription("Select a Mode.")
				.setRequired(false)
				.addChoice("SKZ", "skz")
				.addChoice("KZT", "kzt")
				.addChoice("VNL", "vnl")
				.addChoice("ALL", "all")
		),

	async execute(interaction) {
		let mode = interaction.options.getString("mode");
		let dbMode;
		let displayMode;
		async function answer(input) {
			await interaction.reply(input);
		}

		try {
			userSchema.findOne(async (err, data) => {
				if (err) {
					console.error(err);
					answer({ content: "Database Error.", ephemeral: true });
					return globalFunctions.errMsg();
				}

				if (!data) return answer({ content: "Database Error." });
				if (!data.List[interaction.user.id].steamId)
					return answer({ content: "You either need to specify a steamID or set a default with `/setsteam`" });

				// Checking current mode entry
				if (mode === null && !data.List[interaction.user.id].mode) {
					return answer({ content: "You don't have a mode preference yet. Set one by using `/mode`" });
				} else if (mode === null && data.List[interaction.user.id].mode) {
					switch (data.List[interaction.user.id].mode) {
						case "all":
							displayMode = "None";
							break;

						case "kz_simple":
							displayMode = "SimpleKZ";
							break;

						case "kz_timer":
							displayMode = "KZTimer";
							break;

						case "kz_vanilla":
							displayMode = "Vanilla";
					}

					return answer({ content: `Your current mode preference is set to: \`${displayMode}\`` });
				}

				// Setting new mode preference
				switch (mode) {
					case "all":
						dbMode = "all";
						displayMode = "None";
						break;

					case "skz":
						dbMode = "kz_simple";
						displayMode = "SimpleKZ";
						break;

					case "kzt":
						dbMode = "kz_timer";
						displayMode = "KZT";
						break;

					case "vnl":
						dbMode = "kz_vanilla";
						displayMode = "VNL";
				}

				data.List[interaction.user.id] = {
					userId: interaction.user.id,
					steamId: data.List[interaction.user.id].steamId,
					mode: dbMode,
				};

				await userSchema.findOneAndUpdate(data);

				return answer({ content: `Mode preference set to: \`${displayMode}\`` });
			});
		} catch (e) {
			console.error(e);
			answer({ content: "Something went wrong. Please contact `AlphaKeks#9826` and report the bug.", ephemeral: true });
			return globalFunctions.errMsg();
		}
	},
};
