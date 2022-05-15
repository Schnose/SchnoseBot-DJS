import { CommandInteraction as Interaction, MessageEmbed } from 'discord.js';
import { getFilterDistAPI, getMapcycle, getMapsKZGO, getTimes } from '../../../globalFunctions';
require('dotenv').config();

export async function unfinishedMaps(
	interaction: Interaction,
	tier: number,
	mode: { name: string; displayName: string; id: number },
	runtype: boolean,
	steamID: string,
	mapList: any
) {
	//console.log(tier, mode, runtype, steamID);

	const displayRuntype = runtype ? 'TP' : 'PRO';
	const completedMaps: any = await getTimes(interaction, steamID, mode.name, runtype);
	const doableMaps: any = await getFilterDistAPI(interaction, runtype, mode.id);
	const uncompletedMaps: any[] = [];
	if (!completedMaps || !doableMaps) return null;
	const vanilla = mode.name === 'kz_vanilla';

	const mapIDs: number[] = [];
	if (!vanilla) doableMaps.forEach((map: any) => mapIDs.push(map.map_id));
	else {
		const kzgoMaps = await getMapsKZGO(interaction);
		kzgoMaps.forEach((map: any) => {
			if (map.vp) mapIDs.push(map.id);
		});
	}

	const playerName = completedMaps[0].player_name;

	for (let i = 0; i < completedMaps.length; i++) {
		completedMaps[i] = completedMaps[i].map_name;
	}

	mapList.forEach((map: any) => {
		if (
			mapIDs.includes(map.id) &&
			!completedMaps.includes(map.name) &&
			(tier === 0 ? true : map.difficulty === tier) &&
			(runtype ? !map.name.startsWith('kzpro_') : true)
		)
			uncompletedMaps.push(map.name);
	});

	if (uncompletedMaps.length === 0) return 'Pog';

	let text = ``;
	for (let i = 0; i < uncompletedMaps.length; i++) {
		if (i === 9) {
			text += `...${uncompletedMaps.length - 10} more`;
			break;
		}
		text += `> ${uncompletedMaps[i]}\n`;
	}

	const embed = new MessageEmbed()
		.setColor('#7480C2')
		.setTitle(`Uncompleted Maps - ${mode.displayName} ${displayRuntype} ${tier > 0 ? `[T${tier}]` : ''}`)
		.setDescription(text)
		.setFooter({
			text: `(͡ ͡° ͜ つ ͡͡°)7 | Player: ${playerName} | schnose.eu/church`,
			iconURL: process.env.ICON,
		});

	return embed;
}
