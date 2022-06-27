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

/** checks whether a string is a SteamID or not
 * @param input e.g. `STEAM_1:1:161178172`
 * @returns `true` | `false`
 */
export function isSteamID(input: string) {
	return input.includes(":") && input.includes("_") && /\d/.test(input)
		? true
		: false;
}

/** formats seconds to a nicer format
 * @param time seconds
 * @returns e.g. `03:35.727`
 */
export function parseTime(time: number) {
	if (isNaN(time)) return "none";

	const dateObj = new Date(time * 1000);
	const hours = dateObj.getUTCHours();
	const mins = dateObj.getUTCMinutes();
	const secs = dateObj.getUTCSeconds();
	const millies = dateObj.getUTCMilliseconds();

	return `${hours > 0 ? hours + ":" : ""}${mins > 9 ? mins : `0${mins}`}:${
		secs > 9 ? secs : `0${secs}`
	}.${millies}}`;
}

/** default error handling
 * @param err any error
 * @returns `{ success: false, error: err }`
 */
export function handleErr(err: unknown) {
	console.error(err);
	return { success: false, error: err };
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

// mongoDB
export async function errDB(err: unknown) {
	console.error(err);
	return {
		success: false,
		error: err,
		message:
			"Something went wrong when connecting to the Database. Please report this bug on [GitHub](https://github.com/Schnose/SchnoseBot-DJS/issues) or message `AlplhaKeks#9826`.",
	};
}
