import { CommandInteraction as Interaction, MessageEmbed } from 'discord.js';
import { convertmin, getTop } from '../../../globalFunctions';
require('dotenv').config();

export async function fetchLeaderboard(interaction: Interaction, mode: string, stages: number[], runtype: boolean) {
	let top: any = await getTop(interaction, mode, stages, runtype);
	const modes = {
		api: mode,
		fancy: '',
		link: '',
	};
	if (mode === 'kz_timer') {
		modes.fancy = 'KZTimer';
		modes.link = 'kzt';
	} else if (mode === 'kz_simple') {
		modes.fancy = 'SimpleKZ';
		modes.link = 'skz';
	} else {
		modes.fancy = 'Vanilla';
		modes.link = 'vnl';
	}

	const leaderboard: any[] = [];

	for (let i = 0; i < top.length; i++) {
		leaderboard.push({
			name: `[#${i + 1}] ${top[i].player_name}`,
			value: `${top[i].count}`,
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
			.setTitle(stages.length > 1 ? `Top 100 Bonus Record Holders` : `Top 100 Record Holders`)
			.setURL(`https://kzgo.eu/leaderboards?${modes.link}`)
			.setDescription(`Mode: ${modes.fancy} | Runtype: ${runtype ? 'TP' : 'PRO'}`)
			.addFields(pageEntries)
			.setFooter({
				text: '(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church',
				iconURL: process.env.ICON,
			});
		embeds.push(embed);
	}
	return embeds;
}
