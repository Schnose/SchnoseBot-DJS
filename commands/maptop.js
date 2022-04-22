const { SlashCommandBuilder } = require("@discordjs/builders");
const globalFunctions = require("../globalFunctions");
const userSchema = require("../database/user-schema");
const { MessageEmbed } = require("discord.js");
const { icon } = require("../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("maptop")
		.setDescription("Check a map's Top 100")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName("map").setDescription("Select a Map.").setRequired(true))
		.addStringOption((o) =>
			o.setName("runtype").setDescription("TP/PRO").setRequired(false).addChoice("TP", "true").addChoice("PRO", "false")
		)
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

			let map = interaction.options.getString("map").toLowerCase();
			let runtype = "true" === interaction.options.getString("runtype");
			let displayRuntype = "PRO";
			let displayMode = interaction.options.getString("mode") || null;
			let mode;

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

			/* Validate Mode */

			switch (displayMode) {
				// no Mode specified
				case null:
					if (!data.List[interaction.user.id])
						return answer({
							content: `You either have to specify a mode or set a default mode using the following command:\n \`\`\`\n/mode\n\`\`\`.`,
						});
					mode = data.List[interaction.user.id].mode;

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

						default:
							return answer({
								content: `You either have to specify a mode or set a default mode using the following command:\n \`\`\`\n/mode\n\`\`\`.`,
							});
					}
					break;

				case "SimpleKZ":
					mode = "kz_simple";
					break;
				case "KZTimer":
					mode = "kz_timer";
					break;
				case "Vanilla":
					mode = "kz_vanilla";
			}

			/* Runtype */
			if (runtype) displayRuntype = "TP";

			/* Maptop */
			let [Maptop] = await Promise.all([globalFunctions.getDataMaptop(runtype, mode, map, 0)]);

			if (Maptop === "bad") return answer({ content: "API Error. Please try again later." });
			if (Maptop === "no data") return answer({ content: "This Map seems to have 0 completions." });

			const Leaderboard = [];

			for (let i = 0; i < Maptop.length; i++) {
				Leaderboard.push({
					name: `[#${i + 1}] ${Maptop[i].player_name}`,
					value: `${globalFunctions.convertmin(Maptop[i].time)}`,
					inline: true,
				});
			}

			// TODO: create buttons
			const pages = Math.ceil(Leaderboard.length / 10);
			const embeds = [];

			for (let i = 0; i < pages; i++) {
				let pageEntries = [];

				for (let j = i * 10; j < i * 10 + 10; j++) {
					if (Leaderboard[j]) {
						pageEntries.push(Leaderboard[j]);
					}
				}

				const embed = new MessageEmbed()
					.setColor("#7480c2")
					.setTitle(`${map} - Maptop`)
					.setURL(`https://kzgo.eu/maps/${map}`)
					.setDescription(`Mode: ${displayMode} | Runtype: ${displayRuntype}`)
					.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map}.jpg`)
					.addFields(pageEntries)
					.setFooter({
						text: "(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church",
						iconURL: icon,
					});
				embeds.push(embed);
			}
		});
	},
};
