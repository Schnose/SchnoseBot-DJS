import { CommandInteraction as Interaction, MessageEmbed } from 'discord.js';
import { convertmin, getWR } from '../../../globalFunctions';
require('dotenv').config();

export async function unspecifiedMode(interaction: Interaction, map: any, course: number) {
	let playerName = '';

	let [KZT, SKZ, VNL]: any = [
		await Promise.all([
			getWR(interaction, map.name, course, 'kz_timer', true),
			getWR(interaction, map.name, course, 'kz_timer', false),
		]),
		await Promise.all([
			getWR(interaction, map.name, course, 'kz_simple', true),
			getWR(interaction, map.name, course, 'kz_simple', false),
		]),
		await Promise.all([
			getWR(interaction, map.name, course, 'kz_vanilla', true),
			getWR(interaction, map.name, course, 'kz_vanilla', false),
		]),
	];

	if (!KZT && !SKZ && !VNL) return null;

	[KZT, SKZ, VNL].forEach((i) => {
		if (i[0].player_name) return (playerName = i[0].player_name);
		if (i[1].player_name) return (playerName = i[1].player_name);
	});

	const embed = new MessageEmbed()
		.setColor('#7480C2')
		.setTitle(course > 0 ? `${map.name} - BWR ${course}` : `${map.name} - WR`)
		.setURL(`https://kzgo.eu/maps/${map.name}`)
		.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
		.addFields(
			{
				name: 'KZTimer',
				value: `TP: ${convertmin(KZT[0].time)} (${KZT[0].player_name || ''})\n\nPRO: ${convertmin(KZT[1].time)} (${
					KZT[1].player_name || ''
				})`,
				inline: true,
			},
			{
				name: 'SimpleKZ',
				value: `TP: ${convertmin(SKZ[0].time)} (${SKZ[0].player_name || ''})\n\nPRO: ${convertmin(SKZ[1].time)} (${
					SKZ[1].player_name || ''
				})`,
				inline: true,
			},
			{
				name: 'Vanilla',
				value: `TP: ${convertmin(VNL[0].time)} (${VNL[0].player_name || ''})\n\nPRO: ${convertmin(VNL[1].time)} (${
					VNL[1].player_name || ''
				})`,
				inline: true,
			}
		)
		.setFooter({
			text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
			iconURL: process.env.ICON,
		});
	return embed;
}
