const { SlashCommandBuilder } = require("@discordjs/builders");
const globalFunctions = require("../globalFunctions");
const userSchema = require("../database/user-schema");
const { icon } = require("../config.json");
const { MessageEmbed } = require("discord.js");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("filters")
		.setDescription("Check a map's Filters")
		.addStringOption((o) => o.setName("map").setDescription("Select a map.").setRequired(true))
		.addIntegerOption((o) => o.setName("course").setDescription("Specify a course.").setRequired(false))
		.setDefaultPermission(true),

	async execute(interaction) {
		interaction.deferReply();
		async function answer(input) {
			await interaction.editReply(input);
		}

		userSchema.findOne(async (err, data) => {
			if (err) return console.error(err);

			let map = interaction.options.getString("map").toLowerCase();
			let course = interaction.options.getInteger("course") || 0;

			/* Validate Map */
			const globalMaps = await globalFunctions.getMapsAPI();
			if (globalMaps === "bad") return answer({ content: "API Error. Please try again later." });
			const mapsMap = new Map();

			for (let i = 0; i < globalMaps.length; i++) {
				if (globalMaps[i].name.includes(map)) {
					map = globalMaps[i].name;
					mapsMap.set(globalMaps[i].name, globalMaps[i].id);
					break;
				}
			}
			if (!mapsMap.get(map)) return answer({ content: "Please enter a valid map." });

			let [filterSKZ, filterKZT, filterVNL] = ["❌", "❌", "❌"];

			let [mapFilter, kzgoData] = await Promise.all([
				globalFunctions.checkFilters(mapsMap.get(map), 0),
				globalFunctions.kzgoMaps(),
			]);

			if ([mapFilter, kzgoData].includes("bad")) return answer({ content: "API Error. Please try again later." });

			let SKZ, KZT, VNL;

			mapFilter.forEach((i) => {
				if (i.mode_id === 200) KZT = true;
				else if (i.mode_id === 201) SKZ = true;
				else if (i.mode_id === 202) VNL = true;
			});

			if (SKZ) filterSKZ = "✅";
			if (KZT) filterKZT = "✅";
			if (VNL) filterVNL = "✅";

			let title;
			if (course > 0) {
				title = `${map} - Filters [B${course}]`;
			} else title = `${map} - Filters`;

			const embed = new MessageEmbed()
				.setColor("#7480c2")
				.setTitle(`${title}`)
				.setURL(`https://kzgo.eu/maps/${map}`)
				.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map}.jpg`)
				.addFields(
					{
						name: "SimpleKZ",
						value: `${filterSKZ}`,
						inline: true,
					},
					{
						name: "KZTimer",
						value: `${filterKZT}`,
						inline: true,
					},
					{
						name: "Vanilla",
						value: `${filterVNL}`,
						inline: true,
					}
				)
				.setFooter({
					text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
					iconURL: icon,
				});

			return answer({ embeds: [embed] });
		});
	},
};
