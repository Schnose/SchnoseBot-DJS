const { SlashCommandBuilder } = require("@discordjs/builders");
const globalFunctions = require("../globalFunctions");
const userSchema = require("../database/user-schema");
const { MessageEmbed } = require("discord.js");
const { icon } = require("../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("pb")
		.setDescription("'Check someone's Personal Best on a map.")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName("map").setDescription("Select a Map.").setRequired(true))
		.addStringOption((o) => o.setName("target").setDescription("Select a Player.").setRequired(false))
		.addStringOption((o) =>
			o
				.setName("mode")
				.setDescription("Select a Mode.")
				.setRequired(false)
				.addChoice("SKZ", "SimpleKZ")
				.addChoice("KZT", "KZTimer")
				.addChoice("VNL", "Vanilla")
				.addChoice("ALL", "All 3 Modes")
		),

	async execute(interaction) {
		async function answer(input) {
			await interaction.reply(input);
		}

		userSchema.findOne(async (err, data) => {
			if (err)
				return console.error(err), answer({ content: "Database Error. Please contact `AlphaKeks#9826` about this." });

			let map = interaction.options.getString("map");
			let target = interaction.options.getString("target") || null;
			let displayMode = interaction.options.getString("mode") || null;
			let mode;
			let steamID;

			/* Validate Map */
			const globalMaps = await globalFunctions.getMapcycle();
			if (globalMaps === "bad") return answer({ content: "API Error. Please try again later." });
			for (let i = 0; i < globalMaps.length; i++) {
				if (globalMaps[i].includes(map)) {
					map = globalMaps[i];
					break;
				}
				if (!globalMaps[i]) return answer({ content: "Please enter a valid map." });
			}

			/* Validate Target */

			// Target unspecified, targetting user
			if (target === null) target = interaction.user.id;
			// Target specified with @mention
			else if (target.startsWith("<@") && target.endsWith(">")) target = globalFunctions.getIDFromMention(target);
			// Target specified with Name or steamID
			else {
				// Try #1: steamID
				let result = globalFunctions.getSteamID(target);
				if (result === "bad") return answer({ content: "API Error. Please try again later." });

				// Try #2: Name
				if (!result) {
					result = globalFunctions.getName(target);
					if (result === "bad") return answer({ content: "API Error. Please try again later." });
				}

				// Player doesn't exist
				if (!result) return answer({ content: "That player has never played KZ before!" });
				steamID = result;
			}

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
							break;

						case "kz_timer":
							displayMode = "KZTimer";
							break;

						case "kz_vanilla":
							displayMode = "Vanilla";
							break;

						case "all":
							displayMode = "All 3 Modes";
					}
					break;

				// Mode specified
				case "SimpleKZ":
					mode = "kz_simple";
					break;

				case "KZTimer":
					mode = "kz_timer";
					break;

				case "Vanilla":
					mode = "kz_vanilla";
					break;

				// Mode unspecified
				case "All 3 Modes":
					let [skzTP, skzPRO, kztTP, kztPRO, vnlTP, vnlPRO] = await Promise.all([
						globalFunctions.getDataPB(steamID, true, "kz_simple", map, 0),
						globalFunctions.getDataPB(steamID, false, "kz_simple", map, 0),
						globalFunctions.getDataPB(steamID, true, "kz_timer", map, 0),
						globalFunctions.getDataPB(steamID, false, "kz_timer", map, 0),
						globalFunctions.getDataPB(steamID, true, "kz_vanilla", map, 0),
						globalFunctions.getDataPB(steamID, false, "kz_vanilla", map, 0),
					]);

					if ([skzTP, skzPRO, kztTP, kztPRO, vnlTP, vnlPRO].includes("bad"))
						return answer({ content: "API Error. Please try again later." });

					if (
						skzTP.time == 0 &&
						skzPRO.time == 0 &&
						kztTP.time == 0 &&
						kztPRO.time == 0 &&
						vnlTP.time == 0 &&
						vnlPRO.time == 0
					)
						return answer({ content: `No PB found for \`${map}\`.` });

					function name(mode) {
						return mode.player_name;
					}
					function time(mode) {
						return globalFunctions.convertmin(mode.time);
					}

					let embed = new MessageEmbed()
						.setColor("#7480c2")
						.setTitle(`${map} - PB`)
						.setURL(`https://kzgo.eu/maps/${map}`)
						.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map}.jpg`)
						.addFields(
							{
								name: "SimpleKZ",
								value: `TP: ${time(skzTP)}\nPRO: ${time(skzPRO)}`,
								inline: true,
							},
							{
								name: "KZTimer",
								value: `TP: ${time(kztTP)}\nPRO: ${time(kztPRO)}`,
								inline: true,
							},
							{
								name: "Vanilla",
								value: `TP: ${time(vnlTP)}\nPRO: ${time(vnlPRO)}`,
								inline: true,
							}
						)
						.setFooter({
							text: `(͡ ͡° ͜ つ ͡͡°)7 | Player: ${
								name(skzTP) || name(skzPRO) || name(kztTP) || name(kztPRO) || name(vnlTP) || name(vnlPRO)
							} | schnose.eu/church`,
							iconURL: icon,
						});
					return answer({ embeds: [embed] });
			}

			// Mode specified
			let [TP, PRO] = await Promise.all([
				globalFunctions.getDataPB(steamID, true, mode, map, 0),
				globalFunctions.getDataPB(steamID, false, mode, map, 0),
			]);

			if ([TP, PRO].includes("bad")) return answer({ content: "API Error. Please try again later." });
			if (TP.time == 0 && PRO.time == 0) return answer({ content: `No PB found for \`${map}\`` });

			let tpTime = globalFunctions.convertmin(TP.time);
			let tpName = TP.player_name;
			let tpPlace;
			if (TP.time !== 0) tpPlace = await globalFunctions.getPlace(PRO);

			let proTime = globalFunctions.convertmin(PRO.time);
			let proName = PRO.player_name;
			let proPlace;
			if (PRO.time !== 0) proPlace = await globalFunctions.getPlace(TP);

			let embed = new MessageEmbed()
				.setColor("#7480c2")
				.setTitle(`${map} - PB`)
				.setURL(`https://kzgo.eu/maps/${map}`)
				.setDescription(`Mode: ${displayMode}`)
				.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map}.jpg`)
				.addFields(
					{
						name: "TP",
						value: `${tpTime || "None"} ${tpPlace || ""}`,
						inline: true,
					},
					{
						name: "PRO",
						value: `${proTime || "None"} ${proPlace || ""}`,
						inline: true,
					}
				)
				.setFooter({
					text: `(͡ ͡° ͜ つ ͡͡°)7 | Player: ${tpName || proName} | schnose.eu/church`,
					iconURL: icon,
				});

			return answer({ embeds: [embed] });
		});
	},
};
