const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const globalFunctions = require("../globalFunctions");
const { icon } = require("../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("wr")
		.setDescription("Check the World Record of a map.")
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
		),

	async execute(interaction) {
		await interaction.deferReply();
		async function answer(input) {
			await interaction.editReply(input);
		}

		let map = interaction.options.getString("map").toLowerCase();
		let displayMode = interaction.options.getString("mode") || "All 3 Modes";
		let mode;

		/* Validate Map */

		map = await globalFunctions.validateMap(map);
		if (!map) return answer({ content: "Please enter a valid map." });

		// Check WR for specific modes
		if (displayMode !== "All 3 Modes") {
			switch (displayMode) {
				case "SimpleKZ":
					mode = "kz_simple";
					break;

				case "KZTimer":
					mode = "kz_timer";
					break;

				case "Vanilla":
					mode = "kz_vanilla";
			}

			let [TP, PRO] = await Promise.all([
				globalFunctions.getWR(map.name, 0, mode, true),
				globalFunctions.getWR(map.name, 0, mode, false),
			]);

			if ([TP, PRO].includes(undefined)) return answer({ content: "API Error. Please try again later." });
			let tpTime = globalFunctions.convertmin(TP.time);
			let proTime = globalFunctions.convertmin(PRO.time);

			let embed = new MessageEmbed()
				.setColor("#7480c2")
				.setTitle(`${map.name} - WR`)
				.setURL(`https://kzgo.eu/maps/${map.name}`)
				.setDescription(`Mode: ${displayMode}`)
				.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
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
		}

		//Check WR for all modes
		else {
			let [skzTP, skzPRO, kztTP, kztPRO, vnlTP, vnlPRO] = await Promise.all([
				globalFunctions.getWR(map.name, 0, "kz_simple", true),
				globalFunctions.getWR(map.name, 0, "kz_simple", false),
				globalFunctions.getWR(map.name, 0, "kz_timer", true),
				globalFunctions.getWR(map.name, 0, "kz_timer", false),
				globalFunctions.getWR(map.name, 0, "kz_vanilla", true),
				globalFunctions.getWR(map.name, 0, "kz_vanilla", false),
			]);
			let requests = [skzTP, skzPRO, kztTP, kztPRO, vnlTP, vnlPRO];

			if (requests.includes(undefined)) return answer({ content: "API Error. Please try again later." });

			const [skzTPTime, skzPROTime, kztTPTime, kztPROTime, vnlTPTime, vnlPROTime] = [
				globalFunctions.convertmin(skzTP?.time),
				globalFunctions.convertmin(skzPRO?.time),
				globalFunctions.convertmin(kztTP?.time),
				globalFunctions.convertmin(kztPRO?.time),
				globalFunctions.convertmin(vnlTP?.time),
				globalFunctions.convertmin(vnlPRO?.time),
			];

			const embed = new MessageEmbed()
				.setColor("#7480c2")
				.setTitle(`${map.name} - WR`)
				.setURL(`https://kzgo.eu/maps/${map.name}`)
				.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
				.addFields(
					{
						name: "SimpleKZ",
						value: `TP: ${skzTPTime} (*${skzTP?.player_name || "None"}*)\nPRO: ${skzPROTime} (*${
							skzPRO?.player_name || "None"
						}*)`,
						inline: false,
					},
					{
						name: "KZTimer",
						value: `TP: ${kztTPTime} (*${kztTP?.player_name || "None"}*)\nPRO: ${kztPROTime} (*${
							kztPRO?.player_name || "None"
						}*)`,
						inline: false,
					},
					{
						name: "Vanilla",
						value: `TP: ${vnlTPTime} (*${vnlTP?.player_name || "None"}*)\nPRO: ${vnlPROTime} (*${
							vnlPRO?.player_name || "None"
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
	},
};
