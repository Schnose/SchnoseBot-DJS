import { CommandInteraction as Interaction, MessageEmbed } from "discord.js";
import { convertmin, getWR } from "../../../globalFunctions";

export async function specifiedMode(interaction: Interaction, map: any, course: number, mode: string) {
	let TP: any = {};
	let PRO: any = {};

	let [tpRequest, proRequest]: any[] = await Promise.all([
		getWR(interaction, map.name, course, mode, true),
		getWR(interaction, map.name, course, mode, false),
	]);

	if (tpRequest) {
		TP = {
			name: tpRequest.player_name,
			time: convertmin(tpRequest.time),
		};
	}

	if (proRequest) {
		PRO = {
			name: proRequest.player_name,
			time: convertmin(proRequest.time),
		};
	}

	if (mode === "kz_timer") mode = "KZTimer";
	else if (mode === "kz_simple") mode = "SimpleKZ";
	else mode = "Vanilla";

	const embed = new MessageEmbed()
		.setColor("#7480C2")
		.setTitle(`${map.name} - WR`)
		.setURL(`https://kzgo.eu/maps/${map.name}`)
		.setDescription(`Mode: ${mode}`)
		.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
		.addFields(
			{
				name: "TP",
				value: `${TP.time || "None"} ${TP.place || ""}`,
				inline: true,
			},
			{
				name: "PRO",
				value: `${PRO.time || "None"} ${PRO.place || ""}`,
				inline: true,
			}
		)
		.setFooter({
			text: `(͡ ͡° ͜ つ ͡͡°)7 | Player: ${TP.name || PRO.name || "None"} | schnose.eu/church`,
			iconURL: process.env.ICON,
		});
	return embed;
}
