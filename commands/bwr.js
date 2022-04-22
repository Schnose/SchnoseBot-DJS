const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const globalFunctions = require("../globalFunctions");
const { icon } = require("../config.json");
const { kzgoMaps } = require("../globalFunctions");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("bwr")
		.setDescription("Check a Bonus World Record on a map.")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName("map").setDescription("Select a Map.").setRequired(true))
		.addStringOption((o) =>
			o
				.setName("mode")
				.setDescription("Select a Mode.")
				.setRequired(false)
				.addChoice("SKZ", "SimpleKZ")
				.addChoice("KZT", "KZTimer")
				.addChoice("VNL", "Vanilla")
				.addChoice("ALL", "All 3 Modes")
		)
		.addIntegerOption((o) => o.setName("course").setDescription("Specify which BWR you want to check.")),

	async execute(interaction) {
		await interaction.deferReply();
		async function answer(input) {
			await interaction.editReply(input);
		}

		let map = interaction.options.getString("map").toLowerCase();
		let displayMode = interaction.options.getString("mode") || "All 3 Modes";
		let mode;
		let course = interaction.options.getInteger("course") || 1;

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

		/* Validate Course */
		const result = await kzgoMaps();
		let n;
		result.forEach((i) => {
			if (i.name === map) return (n = i.bonuses);
		});

		if (course > n) return answer({ content: "Please specify a valid course." });

		/* Validate Mode */
		switch (displayMode) {
			// Mode Specified
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
					globalFunctions.getDataWR(true, "kz_simple", map, course),
					globalFunctions.getDataWR(false, "kz_simple", map, course),
					globalFunctions.getDataWR(true, "kz_timer", map, course),
					globalFunctions.getDataWR(false, "kz_timer", map, course),
					globalFunctions.getDataWR(true, "kz_vanilla", map, course),
					globalFunctions.getDataWR(false, "kz_vanilla", map, course),
				]);

				if ([skzTP, skzPRO, kztTP, kztPRO, vnlTP, vnlPRO].includes("bad"))
					return answer({ content: "API Error. Please try again later." });

				function name(mode) {
					return mode.player_name;
				}
				function time(mode) {
					return globalFunctions.convertmin(mode.time);
				}

				let embed = new MessageEmbed()
					.setColor("#7480c2")
					.setTitle(`${map} - BWR ${course}`)
					.setURL(`https://kzgo.eu/maps/${map}`)
					.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map}.jpg`)
					.addFields(
						{
							name: "SimpleKZ",
							value: `TP: ${time(skzTP)} (*${name(skzTP) || "-"}*)\nPRO: ${time(skzPRO)} (*${name(skzPRO) || "None"}*)`,
							inline: false,
						},
						{
							name: "KZTimer",
							value: `TP: ${time(kztTP)} (*${name(kztTP) || "None"}*)\nPRO: ${time(kztPRO)} (*${
								name(kztPRO) || "None"
							}*)`,
							inline: false,
						},
						{
							name: "Vanilla",
							value: `TP: ${time(vnlTP)} (*${name(vnlTP) || "None"}*)\nPRO: ${time(vnlPRO)} (*${
								name(vnlPRO) || "None"
							}*)`,
							inline: false,
						}
					)
					.setFooter({
						text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
						iconURL: icon,
					});

				return answer({ embeds: [embed] });
		}

		// Mode specified
		let [TP, PRO] = await Promise.all([
			globalFunctions.getDataWR(true, mode, map, course),
			globalFunctions.getDataWR(false, mode, map, course),
		]);

		if ([TP, PRO].includes("bad")) return answer({ content: "API Error. Please try again later." });

		let tpTime = globalFunctions.convertmin(TP.time);
		let proTime = globalFunctions.convertmin(PRO.time);

		let embed = new MessageEmbed()
			.setColor("#7480c2")
			.setTitle(`${map} - BWR ${course}`)
			.setURL(`https://kzgo.eu/maps/${map}`)
			.setDescription(`Mode: ${displayMode}`)
			.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map}.jpg`)
			.addFields(
				{
					name: "TP",
					value: `${tpTime} (*${TP.player_name || "None"}*)`,
					inline: true,
				},
				{
					name: "PRO",
					value: `${proTime} (*${PRO.player_name || "None"}*)`,
					inline: true,
				}
			)
			.setFooter({
				text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
				iconURL: icon,
			});

		return answer({ embeds: [embed] });
	},
};
