const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const userSchema = require("../database/user-schema");
const globalFunctions = require("../globalFunctions");
const { icon } = require("../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("newprofile")
		.setDescription("▸")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName("target").setDescription("Select a Player.").setRequired(false))
		.addStringOption((o) =>
			o
				.setName("mode")
				.setDescription("Select a Mode.")
				.setRequired(false)
				.addChoice("SKZ", "SimpleKZ")
				.addChoice("KZT", "KZTimer")
				.addChoice("VNL", "Vanilla")
		),

	async execute(interaction) {
		interaction.deferReply();
		async function answer(input) {
			await interaction.editReply(input);
		}

		userSchema.findOne(async (err, data) => {
			if (err) return console.error(err);

			let target = interaction.options.getString("target") || null;
			let displayMode = interaction.options.getString("mode") || null;
			let preferenceMode;
			let mode;
			let modeID;
			let steamID;

			/* Validate Target */

			if (!target) target = interaction.user.id;
			else steamID = await globalFunctions.validateTarget(target);

			// No Target specified and also no DB entries
			if (!steamID) {
				if (!data.List[target])
					return answer({
						contenet: `You either have to specify a target or set your steamID using the following command:\n \`\`\`\n/setsteam\n\`\`\``,
					});
				steamID = data.List[target].steamId;
			}

			/* Validate Mode */
			switch (displayMode) {
				// no Mode specified
				case null:
					// no Mode in DB
					if (!data.List[target])
						return answer({
							content: `You either have to specify a mode or set a default mode using the following command:\n \`\`\`\n/mode\n\`\`\``,
						});
					mode = data.List[target].mode;
					switch (mode) {
						case "kz_simple":
							displayMode = "SimpleKZ";
							modeID = 201;
							break;

						case "kz_timer":
							displayMode = "KZTimer";
							modeID = 200;
							break;

						case "kz_vanilla":
							displayMode = "Vanilla";
							modeID = 202;
							break;

						case "all":
							return answer({
								content: `You either have to specify a mode or set a default mode using the following command:\n \`\`\`\n/mode\n\`\`\``,
							});
					}
					break;

				// Mode specified
				case "SimpleKZ":
					mode = "kz_simple";
					modeID = 201;
					break;

				case "KZTimer":
					mode = "kz_timer";
					modeID = 200;
					break;

				case "Vanilla":
					mode = "kz_vanilla";
					modeID = 202;
					break;
			}

			// Check for mode preference
			if (data.List[target]) {
				if (data.List[target].mode) {
					preferenceMode = data.List[target].mode;
					switch (preferenceMode) {
						case "kz_simple":
							preferenceMode = "SKZ";
							break;

						case "kz_timer":
							preferenceMode = "KZT";
							break;

						case "kz_vanilla":
							preferenceMode = "VNL";
							break;

						case "all":
							preferenceMode = "None";
					}
				} else preferenceMode = "None";
			}

			const steamID64 = (await globalFunctions.getPlayerAPI_steamID(steamID)).steamid64;
			const apiPlayer = await globalFunctions.getPlayerPointsAPI(steamID64, modeID, true);
			const proPoints = await globalFunctions.getPlayerPointsAPI(steamID64, modeID, false);

			const Player = {
				name: apiPlayer.player_name,
				steamID: apiPlayer.steamid,
				steamID64: apiPlayer.steamid64,
				points: apiPlayer.points + proPoints.points,
				avg: apiPlayer.average,
				favMode: preferenceMode,
			};

			console.log(Player);
			console.log(apiPlayer);

			const title = `
      Profile - ${Player.name}
      `;

			const description = `
      ▸ Points: ${Player.points}\n
      ▸ Average: ${Player.avg}\n
      ▸ SteamID: ${Player.steamID}\n
      ▸ Favorite Mode: ${Player.favMode}
      `;

			const embed = new MessageEmbed()
				.setColor("#7480c2")
				.setTitle(title)
				.setURL(`https://steamcommunity.com/profiles/${Player.steamID64}`)
				.setDescription(description)
				.setFooter({
					text: "(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church",
					iconURL: icon,
				});

			return answer({ embeds: [embed] });
		});
	},
};
