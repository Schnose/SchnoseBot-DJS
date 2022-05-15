import { CommandInteraction as Interaction, MessageEmbed } from 'discord.js';
import { convertmin, getPB } from '../../../globalFunctions';
require('dotenv').config();

export async function unspecifiedMode(interaction: Interaction, steamID: string, map: any, course: number) {
	let playerName = '';

	let [KZT, SKZ, VNL]: any = [
		await Promise.all([
			getPB(interaction, steamID, map.name, course, 'kz_timer', true),
			getPB(interaction, steamID, map.name, course, 'kz_timer', false),
		]),
		await Promise.all([
			getPB(interaction, steamID, map.name, course, 'kz_simple', true),
			getPB(interaction, steamID, map.name, course, 'kz_simple', false),
		]),
		await Promise.all([
			getPB(interaction, steamID, map.name, course, 'kz_vanilla', true),
			getPB(interaction, steamID, map.name, course, 'kz_vanilla', false),
		]),
	];

	if (!KZT && !SKZ && !VNL) return null;

	[KZT, SKZ, VNL].forEach((i) => {
		if (i[0].player_name) return (playerName = i[0].player_name);
		if (i[1].player_name) return (playerName = i[1].player_name);
	});

	const embed = new MessageEmbed()
		.setColor('#7480C2')
		.setTitle(course > 0 ? `${map.name} - BPB ${course}` : `${map.name} - PB`)
		.setURL(`https://kzgo.eu/maps/${map.name}`)
		.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
		.addFields(
			{
				name: 'KZTimer',
				value: `TP: ${convertmin(KZT[0].time)}\n\nPRO: ${convertmin(KZT[1].time)}`,
				inline: true,
			},
			{
				name: 'SimpleKZ',
				value: `TP: ${convertmin(SKZ[0].time)}\n\nPRO: ${convertmin(SKZ[1].time)}`,
				inline: true,
			},
			{
				name: 'Vanilla',
				value: `TP: ${convertmin(VNL[0].time)}\n\nPRO: ${convertmin(VNL[1].time)}`,
				inline: true,
			}
		)
		.setFooter({
			text: `(͡ ͡° ͜ つ ͡͡°)7 | Player: ${playerName} | schnose.eu/church`,
			iconURL: process.env.ICON,
		});
	return embed;
}
