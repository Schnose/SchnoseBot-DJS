const { SlashCommandBuilder } = require("@discordjs/builders");
const globalFunctions = require("../globalFunctions");
const userSchema = require("../database/user-schema");
const { MessageEmbed } = require("discord.js");
const { icon } = require("../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("bpb")
		.setDescription("Check someone's Personal Best on a bonus of a map.")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName("map").setDescription("Select a Map.").setRequired(true))
		.addIntegerOption((o) => o.setName("course").setDescription("Select a Course.").setRequired(false))
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
		interaction.deferReply();
		async function answer(input) {
			await interaction.editReply(input);
		}

		userSchema.findOne(async (err, data) => {
			if (err)
				return console.error(err), answer({ content: "Database Error. Please contact `AlphaKeks#9826` about this." });

			let map = interaction.options.getString("map").toLowerCase();
			let course = interaction.options.getInteger("course") || 1;
			let target = interaction.options.getString("target") || null;
			let displayMode = interaction.options.getString("mode") || null;
			let mode;
			let steamID;

			/* Validate Map */
			map = await globalFunctions.validateMap(map);
			if (!map) return answer({ content: "Please enter a valid map." });

			/* Validate Course */
			const isCourseValid = await globalFunctions.validateCourse(map.name, course);
			if (!isCourseValid) return answer({ content: "Please enter a valid course." });

			/* Validate Target */
			if (!target) target = interaction.user.id;
			else steamID = await globalFunctions.validateTarget(target);

			// No Target specified and also no DB entries
			if (!steamID) {
				if (!data.List[target])
					return answer({
						content: `You either have to specify a target or set your steamID using the following command:\n \`\`\`\n/setsteam\n\`\`\``,
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
						globalFunctions.getPB(steamID, map.name, course, "kz_simple", true),
						globalFunctions.getPB(steamID, map.name, course, "kz_simple", false),
						globalFunctions.getPB(steamID, map.name, course, "kz_timer", true),
						globalFunctions.getPB(steamID, map.name, course, "kz_timer", false),
						globalFunctions.getPB(steamID, map.name, course, "kz_vanilla", true),
						globalFunctions.getPB(steamID, map.name, course, "kz_vanilla", false),
					]);

					if ([skzTP, skzPRO, kztTP, kztPRO, vnlTP, vnlPRO].includes(undefined))
						return answer({ content: "API Error. Please try again later." });

					if (
						skzTP.time == 0 &&
						skzPRO.time == 0 &&
						kztTP.time == 0 &&
						kztPRO.time == 0 &&
						vnlTP.time == 0 &&
						vnlPRO.time == 0
					)
						return answer({ content: `No PB found for \`${map.name}\`.` });

					function name(mode) {
						return mode.player_name;
					}
					function time(mode) {
						return globalFunctions.convertmin(mode.time);
					}

					let embed = new MessageEmbed()
						.setColor("#7480c2")
						.setTitle(`${map.name} - BPB ${course}`)
						.setURL(`https://kzgo.eu/maps/${map.name}`)
						.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
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
				globalFunctions.getPB(steamID, map.name, course, mode, true),
				globalFunctions.getPB(steamID, map.name, course, mode, false),
			]);

			if ([TP, PRO].includes(undefined)) return answer({ content: "API Error. Please try again later." });

			let tpTime, tpName, tpPlace, proTime, proName, proPlace;

			if (TP) {
				tpTime = globalFunctions.convertmin(TP.time);
				tpName = TP.player_name;
				tpPlace;
				if (TP.time !== 0) tpPlace = await globalFunctions.getPlace(TP);
			}

			if (PRO) {
				proTime = globalFunctions.convertmin(PRO.time);
				proName = PRO.player_name;
				proPlace;
				if (PRO.time !== 0) proPlace = await globalFunctions.getPlace(PRO);
			}

			let embed = new MessageEmbed()
				.setColor("#7480c2")
				.setTitle(`${map.name} - BPB ${course}`)
				.setURL(`https://kzgo.eu/maps/${map.name}`)
				.setDescription(`Mode: ${displayMode}`)
				.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
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
