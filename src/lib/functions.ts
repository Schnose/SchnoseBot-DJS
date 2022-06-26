import axios, { AxiosRequestConfig } from "axios";
import { promisify } from "util";
import glob from "glob";
import { CommandInteraction, InteractionReplyOptions } from "discord.js";

// general
/** scans ./commands/ for `main.ts` files
 * @param dir ./commands/\*\*\/main
 */
export async function getFiles(dir: string, suffix: string) {
	const PG = promisify(glob);
	const commandFiles = await PG(dir + suffix);
	return commandFiles;
}

// discord.js
/** dynamically replies to an interaction
 * - checks if the interaction has been deferred or not
 * @param interaction Interaction (discord.js)
 * @param input InteractionReplyOptions (discord.js)
 * @returns reply to the interaction
 */
export async function answer(
	interaction: CommandInteraction,
	input: InteractionReplyOptions
) {
	if (interaction.deferred === true) return interaction.editReply(input);
	else return interaction.reply(input);
}
