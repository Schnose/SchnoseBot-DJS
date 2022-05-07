import { CommandInteraction as Interaction, MessageEmbed } from "discord.js";
import { answer, convertmin, getPB } from "../../../globalFunctions";
require("dotenv").config();

export async function unspecifiedMode(interaction: Interaction, steamID: string, map: any, course: number) {
	let Player: any = {
		name: "",
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
		getPB(interaction, steamID, map.name, course, "kz_timer", true),
		getPB(interaction, steamID, map.name, course, "kz_timer", false),
		getPB(interaction, steamID, map.name, course, "kz_simple", true),
		getPB(interaction, steamID, map.name, course, "kz_simple", false),
		getPB(interaction, steamID, map.name, course, "kz_vanilla", true),
		getPB(interaction, steamID, map.name, course, "kz_vanilla", false),
	]);

	if (!Player.KZT.TP && !Player.KZT.PRO && !Player.SKZ.TP && !Player.SKZ.PRO && !Player.VNL.TP && !Player.VNL.PRO)
		return answer(interaction, { content: `No PB found for ${map.name}` });
	Player.name =
		Player.KZT.TP.player_name ||
		Player.KZT.PRO.player_name ||
		Player.SKZ.TP.player_name ||
		Player.SKZ.PRO.player_name ||
		Player.VNL.TP.player_name ||
		Player.VNL.PRO.player_name;
	const embed = new MessageEmbed()
		.setColor("#7480C2")
		.setTitle(`${map.name} - PB`)
		.setURL(`https://kzgo.eu/maps/${map.name}`)
		.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
		.addFields(
			{
				name: "SimpleKZ",
				value: `TP: ${convertmin(Player.SKZ.TP.time)}\nPRO: ${convertmin(Player.SKZ.PRO.time)}`,
				inline: true,
			},
			{
				name: "KZTimer",
				value: `TP: ${convertmin(Player.KZT.TP.time)}\nPRO: ${convertmin(Player.KZT.PRO.time)}`,
				inline: true,
			},
			{
				name: "Vanilla",
				value: `TP: ${convertmin(Player.VNL.TP.time)}\nPRO: ${convertmin(Player.VNL.PRO.time)}`,
				inline: true,
			}
		)
		.setFooter({
			text: `(͡ ͡° ͜ つ ͡͡°)7 | Player: ${Player.name} | schnose.eu/church`,
			iconURL: process.env.ICON,
		});
	return embed;
}
