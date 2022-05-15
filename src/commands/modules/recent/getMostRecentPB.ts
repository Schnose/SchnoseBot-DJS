import { CommandInteraction as Interaction, MessageEmbed } from 'discord.js';
import { convertmin, getPlace, getRecent } from '../../../globalFunctions';
require('dotenv').config();

export async function getMostRecentPB(interaction: Interaction, steamID: string) {
	const recentTimes = new Map();
	let mode: string;

	let [KZT, SKZ, VNL]: any = [
		await Promise.all([getRecent(interaction, steamID, 'kz_timer', true), getRecent(interaction, steamID, 'kz_timer', false)]),
		await Promise.all([
			getRecent(interaction, steamID, 'kz_simple', true),
			getRecent(interaction, steamID, 'kz_simple', false),
		]),
		await Promise.all([
			getRecent(interaction, steamID, 'kz_vanilla', true),
			getRecent(interaction, steamID, 'kz_vanilla', false),
		]),
	];

	[KZT, SKZ, VNL].forEach((i) => {
		recentTimes.set(i[0].created_on, i[0]);
		recentTimes.set(i[1].created_on, i[1]);
	});

	const recent = recentTimes.get(Math.max(...recentTimes.keys()));

	switch (recent.mode) {
		case 'kz_timer':
			mode = 'KZT';
			break;
		case 'kz_simple':
			mode = 'SKZ';
			break;
		default:
			mode = 'VNL';
	}

	const place = await getPlace(interaction, recent);

	const embed = new MessageEmbed()
		.setColor('#7480C2')
		.setTitle(`${recent.map_name} - Recent`)
		.setURL(`https://kzgo.eu/maps/${recent.map_name}`)
		.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${recent.map_name}.jpg`)
		.addFields({
			name: `${mode}`,
			value: `${recent.teleports > 0 ? 'TP' : 'PRO'}: ${convertmin(recent.time)} ${place || ''}\n\n> <t:${
				recent.created_on / 1000
			}:R>`,
			inline: true,
		})
		.setFooter({
			text: `(͡ ͡° ͜ つ ͡͡°)7 | Player: ${recent.player_name} | schnose.eu/church`,
			iconURL: process.env.ICON,
		});

	return embed;
}
