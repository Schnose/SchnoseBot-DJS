const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const globalFunctions = require("../globalFunctions");
const { icon } = require("../config.json");
const sheetSchema = require("../database/sheet-schema");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("map")
		.setDescription("Get detailed information on a map.")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName("map").setDescription("Enter a global map.").setRequired(true)),

	async execute(interaction) {
		let map = interaction.options.getString("map").toLowerCase();
		await interaction.deferReply();

		async function answer(input) {
			await interaction.editReply(input);
		}

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

		for (let i = 0; i < kzgoData.length; i++) {
			if (kzgoData[i].name == map) {
				kzgoData = kzgoData[i];
				break;
			}
		}

		const createdAt = Date.parse(kzgoData.date);
		const apiTier = kzgoData.tier;
		let displayTier;
		switch (apiTier) {
			case 1:
				displayTier = "Very Easy";
				break;

			case 2:
				displayTier = "Easy";
				break;

			case 3:
				displayTier = "Medium";
				break;

			case 4:
				displayTier = "Hard";
				break;

			case 5:
				displayTier = "Very Hard";
				break;

			case 6:
				displayTier = "Extreme";
				break;

			case 7:
				displayTier = "Death";
				break;
		}

		let [skzTier, kztTier, vnlTier] = ["", "", ""];

		sheetSchema.findOne(async (err, data) => {
			if (err || !data) {
				console.error(err);
				[skzTier, kztTier, vnlTier] = ["N/A", "N/A", "N/A"];
			}

			const dbMap = data.mapList[map].main;
			[skzTier, kztTier, vnlTier] = [
				`${dbMap.SKZ?.tpTier || "X"} | ${dbMap.SKZ?.proTier || "X"}`,
				`${dbMap.KZT?.tpTier || "X"} | ${dbMap.KZT?.proTier || "X"}`,
				`${dbMap.VNL?.tpTier || "X"} | ${dbMap.VNL?.proTier || "X"}`,
			];

			let jsArea;
			switch (data.mapList[map].jsArea) {
				case "true":
					jsArea = "Yes";
					break;
				case "false":
					jsArea = "No";
					break;
				case "maybe":
					jsArea = "Maybe";
			}

			let mappers = [];
			for (let i = 0; i < kzgoData.mapperNames.length; i++) {
				mappers.push(`[${kzgoData.mapperNames[i]}](https://steamcommunity.com/profiles/${kzgoData.mapperIds[i]})`);
			}

			const embed = new MessageEmbed()
				.setColor("#7480c2")
				.setTitle(map)
				.setURL(`https://kzgo.eu/maps/${map}`)
				.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map}.jpg`)
				.setDescription(
					`> API Tier: ${apiTier} (${displayTier})\n> [Community Tiers](https://tiers.schnose.eu) (TP | PRO):\n> SKZ: ${skzTier}\n> KZT: ${kztTier}\n> VNL: ${vnlTier}\n> Mapper(s): ${mappers.join(
						", "
					)}\n> Bonuses: ${kzgoData.bonuses}\n> LJ Room? ${jsArea}\n> Globalled: <t:${createdAt / 1000}:d>\n\nFilters:`
				)
				.addFields(
					{
						name: "SimpleKZ",
						value: filterSKZ,
						inline: true,
					},
					{
						name: "KZTimer",
						value: filterKZT,
						inline: true,
					},
					{
						name: "Vanilla",
						value: filterVNL,
						inline: true,
					}
				)
				.setFooter({
					text: `(͡ ͡° ͜ つ ͡͡°)7 | workshopID: ${kzgoData.workshopId} | schnose.eu/church`,
					iconURL: icon,
				});

			return answer({ embeds: [embed] });
		});
	},
};
