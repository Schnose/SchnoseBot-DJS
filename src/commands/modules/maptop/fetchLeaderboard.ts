import { CommandInteraction as Interaction, MessageEmbed } from 'discord.js';
import { convertmin, getMaptop } from '../../../globalFunctions';
require('dotenv').config();

export async function fetchLeaderboard(interaction: Interaction, map: any, mode: string, course: number, runtype: boolean) {
	let maptop: any = await getMaptop(interaction, map.name, mode, course, runtype);
	if (mode === 'kz_timer') mode = 'KZTimer';
	else if (mode === 'kz_simple') mode = 'SimpleKZ';
	else mode = 'Vanilla';

	const leaderboard: any[] = [];

	for (let i = 0; i < maptop.length; i++) {
		leaderboard.push({
			name: `[#${i + 1}] ${maptop[i].player_name}`,
			value: `${convertmin(maptop[i].time)}`,
			inline: true,
		});
	}

	const pages = Math.ceil(leaderboard.length / 15);
	const embeds = [];

	for (let i = 0; i < pages; i++) {
		let pageEntries = [];

		for (let j = i * 15; j < i * 15 + 15; j++) {
			if (leaderboard[j]) {
				pageEntries.push(leaderboard[j]);
			}
		}

		const embed = new MessageEmbed()
			.setColor('#7480c2')
			.setTitle(`${map.name} - Maptop`)
			.setURL(`https://kzgo.eu/maps/${map.name}`)
			.setDescription(`Mode: ${mode} | Runtype: ${runtype ? 'TP' : 'PRO'}`)
			.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
			.addFields(pageEntries)
			.setFooter({
				text: '(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church',
				iconURL: process.env.ICON,
			});
		embeds.push(embed);
	}
	return embeds;
}
