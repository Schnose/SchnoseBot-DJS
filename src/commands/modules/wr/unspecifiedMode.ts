import { CommandInteraction as Interaction, MessageEmbed } from 'discord.js';
import { answer, convertmin, getWR } from '../../../globalFunctions';
require('dotenv').config();

export async function unspecifiedMode(interaction: Interaction, map: any, course: number) {
	let Player: any = {
		name: '',
		KZT: {
			TP: {},
			PRO: {},
		},
		SKZ: {
			TP: {},
			PRO: {},
		},
		VNL: {
			TP: {},
			PRO: {},
		},
	};

	[Player.KZT.TP, Player.KZT.PRO, Player.SKZ.TP, Player.SKZ.PRO, Player.VNL.TP, Player.VNL.PRO] = await Promise.all([
		getWR(interaction, map.name, 0, 'kz_timer', true),
		getWR(interaction, map.name, 0, 'kz_timer', false),
		getWR(interaction, map.name, 0, 'kz_simple', true),
		getWR(interaction, map.name, 0, 'kz_simple', false),
		getWR(interaction, map.name, 0, 'kz_vanilla', true),
		getWR(interaction, map.name, 0, 'kz_vanilla', false),
	]);

	if (!Player.KZT.TP && !Player.KZT.PRO && !Player.SKZ.TP && !Player.SKZ.PRO && !Player.VNL.TP && !Player.VNL.PRO)
		return answer(interaction, { content: `No PB found for ${map.name}` });

	const embed = new MessageEmbed()
		.setColor('#7480C2')
		.setTitle(course > 0 ? `${map.name} - BWR ${course}` : `${map.name} - WR`)
		.setURL(`https://kzgo.eu/maps/${map.name}`)
		.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
		.addFields(
			{
				name: 'KZTimer',
				value: `TP: ${convertmin(Player.KZT.TP.time)} (${Player.KZT.TP.player_name || ''})\n\nPRO: ${convertmin(
					Player.KZT.PRO.time
				)} (${Player.KZT.PRO.player_name || ''})`,
				inline: true,
			},
			{
				name: 'SimpleKZ',
				value: `TP: ${convertmin(Player.SKZ.TP.time)} (${Player.SKZ.TP.player_name || ''})\n\nPRO: ${convertmin(
					Player.SKZ.PRO.time
				)} (${Player.SKZ.PRO.player_name || ''})`,
				inline: true,
			},
			{
				name: 'Vanilla',
				value: `TP: ${convertmin(Player.VNL.TP.time)} (${Player.VNL.TP.player_name || ''})\n\nPRO: ${convertmin(
					Player.VNL.PRO.time
				)} (${Player.VNL.PRO.player_name || ''})`,
				inline: true,
			}
		)
		.setFooter({
			text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
			iconURL: process.env.ICON,
		});
	return embed;
}
