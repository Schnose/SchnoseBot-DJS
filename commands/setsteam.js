const { SlashCommandBuilder } = require("@discordjs/builders");
const axios = require("axios");
const userSchema = require("../database/user-schema");

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
			if (!result.data[0]) {
				reply = "No API Data for this player.";
				return answer({ content: reply, ephemeral: true });
			}

			userSchema.findOne(async (err, data) => {
				if (err) return console.error(err);

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

			reply = `steamID \`${steamid}\` set for player: \`${result.data[0].name}\``;
		} catch (e) {
			console.error(e);
			console.log(
				`Command: ${__filename}\nServer: ${interaction.guild.name} | ${interaction.guild.id}\nUser: ${interaction.user.tag} | ${interaction.user.id}\nChannel: ${interaction.channel.name} | ${interaction.channel.id}`
			);
			return answer({ content: "Database Error.", ephemeral: true });
		}

		answer({ content: reply, ephemeral: true });
	},
};
