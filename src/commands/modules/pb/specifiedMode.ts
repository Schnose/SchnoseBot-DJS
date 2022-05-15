import { CommandInteraction as Interaction, MessageEmbed } from 'discord.js';
import { convertmin, getPB, getPlace } from '../../../globalFunctions';
require('dotenv').config();

export async function specifiedMode(interaction: Interaction, steamID: string, map: any, course: number, mode: string) {
	let TP: any = {};
	let PRO: any = {};

	let [tpRequest, proRequest]: any[] = await Promise.all([
		getPB(interaction, steamID, map.name, course, mode, true),
		getPB(interaction, steamID, map.name, course, mode, false),
	]);
	if (!tpRequest && !proRequest) return null;

	if (tpRequest) {
		TP = {
			name: tpRequest.player_name,
			time: convertmin(tpRequest.time),
			place: '',
		};
		if (tpRequest.time && tpRequest.time !== 0) TP.place = await getPlace(interaction, tpRequest);
	}

	if (proRequest) {
		PRO = {
			name: proRequest.player_name,
			time: convertmin(proRequest.time),
			place: '',
		};
		if (proRequest.time && proRequest.time !== 0) PRO.place = await getPlace(interaction, proRequest);
	}

	if (mode === 'kz_timer') mode = 'KZTimer';
	else if (mode === 'kz_simple') mode = 'SimpleKZ';
	else mode = 'Vanilla';

	const embed = new MessageEmbed()
		.setColor('#7480C2')
		.setTitle(course > 0 ? `${map.name} - BPB ${course}` : `${map.name} - PB`)
		.setURL(`https://kzgo.eu/maps/${map.name}`)
		.setDescription(`Mode: ${mode}`)
		.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
		.addFields(
			{
				name: 'TP',
				value: `${TP.time || 'None'} ${TP.place || ''}`,
				inline: true,
			},
			{
				name: 'PRO',
				value: `${PRO.time || 'None'} ${PRO.place || ''}`,
				inline: true,
			}
		)
		.setFooter({
			text: `(͡ ͡° ͜ つ ͡͡°)7 | Player: ${TP.name || PRO.name} | schnose.eu/church`,
			iconURL: process.env.ICON,
		});
	return embed;
}
