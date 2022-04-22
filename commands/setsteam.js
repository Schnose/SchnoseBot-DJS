const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require("axios");
const userSchema = require("../database/user-schema");
const globalFunctions = require("../globalFunctions");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("setsteam")
		.setDescription("Save your steamID in Schnose's database.")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName("steamid").setDescription("e.g. STEAM_1:1:161178172").setRequired(true)),

	async execute(interaction) {
		let reply = "";
		let steamid = interaction.options.getString("steamid");
		console.log(`New steamID: ${steamid}`);

		async function answer(input) {
			await interaction.reply(input);
		}

		try {
			const result = await axios.get(
				`https://kztimerglobal.com/api/v2.0/players/steamid/${encodeURIComponent(steamid)}`
			);
			if (!result.data[0]) return answer({ content: "No API Data for this player.", ephemeral: true });

			userSchema.findOne(async (err, data) => {
				if (err) {
					console.error(err);
					answer({ content: "Database Error.", ephemeral: true });
					return globalFunctions.errMsg();
				}

				if (!data) {
					new userSchema({
						List: {
							[interaction.user.id]: {
								userId: interaction.user.id,
								steamId: steamid,
								mode: "all",
							},
						},
					}).save();
				} else if (data.List[interaction.user.id]) {
					data.List[interaction.user.id] = {
						userId: interaction.user.id,
						steamId: steamid,
						mode: data.List[interaction.user.id].mode,
					};

					await userSchema.findOneAndUpdate(data);
				} else {
					data.List[interaction.user.id] = {
						userId: interaction.user.id,
						steamId: steamid,
						mode: "all",
					};
					await userSchema.findOneAndUpdate(data);
				}
			});
			return answer({ content: `steamID \`${steamid}\` set for player: \`${result.data[0].name}\``, ephemeral: true });
		} catch (e) {
			console.error(e);
			answer({ content: "Database Error.", ephemeral: true });
			globalFunctions.errMsg();
		}
	},
};
