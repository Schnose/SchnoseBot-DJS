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
		.addIntegerOption((o) =>
			o.setName("course").setDescription("Specify which BWR you want to check.").setRequired(false)
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
		await interaction.deferReply();
		async function answer(input) {
			await interaction.editReply(input);
		}

		let map = interaction.options.getString("map").toLowerCase();
		let displayMode = interaction.options.getString("mode") || "All 3 Modes";
		let mode;
		let course = interaction.options.getInteger("course") || 1;

		/* Validate Map */
		map = await globalFunctions.validateMap(map);
		if (!map) return answer({ content: "Please enter a valid map." });

		/* Validate Course */
		const result = await globalFunctions.getMapsKZGO();
		let n;
		result.forEach((i) => {
			if (i.name === map.name) return (n = i.bonuses);
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
					globalFunctions.getWR(map.name, course, "kz_simple", true),
					globalFunctions.getWR(map.name, course, "kz_simple", false),
					globalFunctions.getWR(map.name, course, "kz_timer", true),
					globalFunctions.getWR(map.name, course, "kz_timer", false),
					globalFunctions.getWR(map.name, course, "kz_vanilla", true),
					globalFunctions.getWR(map.name, course, "kz_vanilla", false),
				]);

				if ([skzTP, skzPRO, kztTP, kztPRO, vnlTP, vnlPRO].includes(undefined))
					return answer({ content: "API Error. Please try again later." });

				function name(mode) {
					return mode.player_name;
				}
				function time(mode) {
					return globalFunctions.convertmin(mode.time);
				}

				let embed = new MessageEmbed()
					.setColor("#7480c2")
					.setTitle(`${map.name} - BWR ${course}`)
					.setURL(`https://kzgo.eu/maps/${map.name}`)
					.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
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
			globalFunctions.getWR(map.name, course, mode, true),
			globalFunctions.getWR(map.name, course, mode, false),
		]);

		if ([TP, PRO].includes(undefined)) return answer({ content: "API Error. Please try again later." });

		let tpTime, proTime;
		if (TP) tpTime = globalFunctions.convertmin(TP.time);
		if (PRO) proTime = globalFunctions.convertmin(PRO.time);

		let embed = new MessageEmbed()
			.setColor("#7480c2")
			.setTitle(`${map.name} - BWR ${course}`)
			.setURL(`https://kzgo.eu/maps/${map.name}`)
			.setDescription(`Mode: ${displayMode}`)
			.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
			.addFields(
				{
					name: "TP",
					value: `${tpTime || "None"} (*${TP.player_name || "None"}*)`,
					inline: true,
				},
				{
					name: "PRO",
					value: `${proTime || "None"} (*${PRO.player_name || "None"}*)`,
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
