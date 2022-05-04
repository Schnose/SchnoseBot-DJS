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

		let map = interaction.options.getString("map").toLowerCase();
		let course = interaction.options.getInteger("course") || 0;

		/* Validate Map */
		map = await globalFunctions.validateMap(map);
		if (!map) return answer({ content: "Please enter a valid map." });

		let [filterSKZ, filterKZT, filterVNL] = ["❌", "❌", "❌"];

		const mapFilters = await globalFunctions.getFiltersAPI(map.id, course);

		if (!mapFilters) return answer({ content: "API Error. Please try again later." });

		mapFilters.forEach((filter) => {
			if (filter.modeID === 200) filterKZT = "✅";
			if (filter.modeID === 201) filterSKZ = "✅";
			if (filter.modeID === 202) filterVNL = "✅";
		});

		const bonus = course > 0 ? ` B${course}` : "";

		const embed = new MessageEmbed()
			.setColor("#7480c2")
			.setTitle(`${map.name}${bonus} - Filters`)
			.setURL(`https://kzgo.eu/maps/${map.name}`)
			.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
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
	},
};
