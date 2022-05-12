import { CommandInteraction as Interaction, EmbedFieldData, MessageEmbed } from 'discord.js';
import sheetSchema from '../../../database/schemas/sheetSchema';
import { errDB, getFilters } from '../../../globalFunctions';
require('dotenv').config();

export async function mapData(interaction: Interaction, data: any, map: any, kzgoMaps: any) {
	/* Get Filters */
	let filters = await getFilters(interaction, map.id, 0);

	/* Get Data from KZGO */
	let mapKZGO: any = {};
	kzgoMaps.forEach((m: any) => {
		if (m.name === map.name) return (mapKZGO = m);
	});

	let [skzTier, kztTier, vnlTier] = ['', '', ''];

	const dbMap = data.mapList[map.name].main;
	[skzTier, kztTier, vnlTier] = [
		`${dbMap.SKZ?.tpTier || 'X'} | ${dbMap.SKZ?.proTier || 'X'}`,
		`${dbMap.KZT?.tpTier || 'X'} | ${dbMap.KZT?.proTier || 'X'}`,
		`${dbMap.VNL?.tpTier || 'X'} | ${dbMap.VNL?.proTier || 'X'}`,
	];

	let jsArea = '';
	switch (data.mapList[map.name].jsArea) {
		case 'true':
			jsArea = 'Yes';
			break;
		case 'false':
			jsArea = 'No';
			break;
		case 'maybe':
			jsArea = 'Maybe';
	}

	const Map = {
		name: map.name,
		apiTier: map.difficulty,
		id: map.id,
		workshopID: mapKZGO.workshopId,
		mapperNames: mapKZGO.mapperNames,
		mapperIDs: mapKZGO.mapperIds,
		releaseDate: Date.parse(mapKZGO.date),
		filters: filters,
		bonuses: mapKZGO.bonuses,
		jumpstats: jsArea,
	};

	let mappers = [];
	for (let i = 0; i < Map.mapperNames.length; i++) {
		mappers.push(`[${Map.mapperNames[i]}](https://steamcommunity.com/profiles/${Map.mapperIDs[i]})`);
	}

	let mapEmbed = new MessageEmbed()
		.setColor('#7480C2')
		.setTitle(`${Map.name}`)
		.setURL(`https://kzgo.eu/maps/${Map.name}`)
		.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
		.setDescription(
			`
				🢂 API Tier: ${Map.apiTier}
				🢂 [Community Tiers](https://tiers.schnose.eu) (TP | PRO):
				> SKZ: ${skzTier}
				> KZT: ${kztTier}
				> VNL: ${vnlTier}
				🢂 Mapper(s): ${mappers.join(', ')}
				🢂 Bonuses: ${Map.bonuses}
				🢂 LJ Room? ${Map.jumpstats}
				🢂 Globalled: <t:${Map.releaseDate / 1000}:d>
				
				🢂 Filters:
				`
		)
		.addFields([
			{
				name: filters.KZT.displayMode,
				value: filters.KZT.icon,
				inline: true,
			},
			{
				name: filters.SKZ.displayMode,
				value: filters.SKZ.icon,
				inline: true,
			},
			{
				name: filters.VNL.displayMode,
				value: filters.VNL.icon,
				inline: true,
			},
		])
		.setFooter({
			text: `(͡ ͡° ͜ つ ͡͡°)7 | ${Map.workshopID} | schnose.eu/church`,
			iconURL: process.env.ICON,
		});
	return mapEmbed;
}
