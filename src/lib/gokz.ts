import axios, { AxiosRequestConfig } from "axios";
import { z } from "zod";
import { handleErr, isSteamID } from "./functions";

// types
export const map = z.object({
	id: z.number(),
	name: z.string(),
	filesize: z.union([z.number(), z.bigint()]),
	validated: z.boolean(),
	difficulty: z.number().min(1).max(7),
	created_on: z.string(),
	updated_on: z.string(),
	approved_by_steamid64: z
		.union([z.string(), z.number(), z.bigint(), z.undefined()])
		.nullable(),
	workshop_url: z.string(),
	download_url: z.string().nullable(),
});
export type map = z.infer<typeof map>;

export const mode = z.object({
	id: z.number(),
	name: z.string().nullable(),
	description: z.string().nullable(),
	latest_version: z.number(),
	latest_version_description: z.string().nullable(),
	website: z.string().nullable(),
	repo: z.string().nullable(),
	contact_steamid64: z
		.union([z.string(), z.number(), z.bigint(), z.undefined()])
		.nullable(),
	supported_tickrates: z.array(z.number()).nullable(),
	created_on: z.string(),
	updated_on: z.string(),
	updated_by_id: z
		.union([z.string(), z.number(), z.bigint(), z.undefined()])
		.nullable(),
});
export type mode = z.infer<typeof mode>;

export const player = z.object({
	steamid64: z
		.union([z.string(), z.number(), z.bigint(), z.undefined()])
		.nullable(),
	steam_id: z.string().nullable(),
	is_banned: z.boolean().optional(),
	total_records: z.number(),
	name: z.string().nullable(),
});
export type player = z.infer<typeof player>;

export const filter = z.object({
	id: z.number(),
	map_id: z.number(),
	stage: z.number(),
	mode_id: z.union([z.literal(200), z.literal(201), z.literal(202)]),
	tickrate: z.number(),
	has_teleports: z.boolean(),
	created_on: z.string(),
	updated_on: z.string(),
	updated_by_id: z
		.union([z.string(), z.number(), z.bigint(), z.undefined()])
		.nullable(),
});
export type filter = z.infer<typeof filter>;

export const record = z.object({
	id: z.union([z.number(), z.bigint()]),
	steamid64: z
		.union([z.string(), z.number(), z.bigint(), z.undefined()])
		.nullable(),
	player_name: z.string(),
	steam_id: z.string().nullable(),
	server_id: z.number(),
	map_id: z.number(),
	stage: z.number(),
	mode: z.union([
		z.literal("kz_timer"),
		z.literal("kz_simple"),
		z.literal("kz_vanilla"),
	]),
	tickrate: z.number(),
	time: z.number(),
	teleports: z.number(),
	created_on: z.string(),
	updated_on: z.string(),
	updated_by_id: z
		.union([z.string(), z.number(), z.bigint(), z.undefined()])
		.nullable(),
	record_filter_id: z.number().nullable(),
	server_name: z.string(),
	map_name: z.string(),
	points: z.number(),
	replay_id: z.number().nullable(),
});
export type record = z.infer<typeof record>;

export const server = z.object({
	id: z.number(),
	port: z.number(),
	ip: z.string(),
	name: z.string(),
	owner_steamid64: z
		.union([z.string(), z.number(), z.bigint(), z.undefined()])
		.nullable(),
});
export type server = z.infer<typeof server>;

export const kzgomap = z.object({
	name: z.string(),
	id: z.number(),
	tier: z.number().min(1).max(7),
	workshopId: z.union([z.number(), z.bigint()]),
	bonuses: z.number(),
	sp: z.boolean(),
	vp: z.boolean(),
	mapperNames: z.array(z.string()),
	mapperIds: z.array(z.union([z.number(), z.bigint(), z.string()])),
	date: z.string(),
});
export type kzgomap = z.infer<typeof kzgomap>;

// functions
async function req(
	URI: string,
	type: z.ZodSchema,
	options: AxiosRequestConfig
) {
	let response: { success: boolean; data?: any } = { success: false };
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/${URI}`, options)
		.then(async (r) => {
			// console.log(r.data);
			// console.log(type.safeParse(r.data[0]));
			if (type.safeParse(r.data[0]).success || type.safeParse(r.data).success)
				return (response = { success: true, data: r.data });
			else return (response = { success: false });
		})
		.catch((e) => handleErr(e));
	return response;
}

// gets all maps from api
export async function getMapsAPI() {
	return await req(`maps?`, map, {
		params: { is_validated: true, limit: 999 },
	});
}

// gets a single map from api
export async function getMapAPI(mapName: string) {
	return await req(`maps/name/${mapName}`, map, {});
}

// gets all modes from the api
export async function getModes() {
	return await req(`modes?`, mode, {});
}

// gets a single mode from api
export async function getMode(input: string | number) {
	const link = typeof input === "string" ? `modes/name/` : `modes/id/`;
	return await req(link + input, mode, {});
}

// gets info on a player
export async function getPlayer(input: string) {
	return await req(`players?`, player, {
		params: isSteamID(input) ? { steam_id: input } : { name: input },
	});
}

// gets all map filters
export async function getFilters() {
	return await req(`record_filters?`, filter, { params: { limit: 9999 } });
}

// gets all filters for a specific map
export async function getFilter(mapID: number, course: number) {
	return await req(`record_filters?`, filter, {
		params: {
			map_ids: mapID,
			stages: course,
			limit: 9999,
		},
	});
}

// gets the #1 record on a map
export async function getWR(
	mapName: string,
	course: number,
	mode: string,
	runtype: boolean
) {
	return await req(`records/top?`, record, {
		params: {
			map_name: mapName,
			stage: course,
			modes_list_string: mode,
			has_teleports: runtype,
			limit: 1,
		},
	});
}

// gets a player's personal best on a map
export async function getPB(
	identifier: string,
	mapName: string,
	course: number,
	mode: string,
	runtype: boolean
) {
	return await req(
		`records/top?` +
			(isSteamID(identifier) ? `steam_id=` : `player_name=`) +
			identifier,
		record,
		{
			params: {
				map_name: mapName,
				stage: course,
				modes_list_string: mode,
				has_teleports: runtype,
				limit: 1,
			},
		}
	);
}

// gets a player's most recently set personal best
export async function getRecent(
	identifier: string,
	mode: string,
	runtype: boolean
) {
	const response = await req(
		`records/top?` +
			(isSteamID(identifier) ? `steam_id=` : `player_name=`) +
			identifier,
		record,
		{
			params: {
				stage: 0,
				modes_list_string: mode,
				has_teleports: runtype,
				limit: 9999,
			},
		}
	);
	if (response.success) {
		const recentMaps = new Map();
		response.data.forEach((r: record) => {
			const creationDate = Date.parse(r.created_on);
			recentMaps.set(creationDate, r);
		});
		const recentMap = Math.max(...recentMaps.keys());
		response.data = recentMaps.get(recentMap);
	}
	return response;
}

// gets all of a player's personal bests
export async function getTimes(
	identifier: string,
	mode: string,
	runtype: boolean
) {
	return await req(
		`records/top?` +
			(isSteamID(identifier) ? `steam_id=` : `player_name=`) +
			identifier,
		record,
		{
			params: {
				stage: 0,
				modes_list_string: mode,
				has_teleports: runtype,
				limit: 9999,
			},
		}
	);
}

// gets the #placement of a record
export async function getPlace(r: record) {
	return await req(`records/place/${r.id}`, z.number(), {});
}

// goes through all of a player's records and adds up the points
export async function getPoints(
	identifier: string,
	mode: string,
	runtype: boolean
) {
	const response = await req(
		`records/top?` +
			(isSteamID(identifier) ? `steam_id=` : `player_name=`) +
			identifier,
		record,
		{
			params: {
				stage: 0,
				modes_list_string: mode,
				has_teleports: runtype,
				limit: 9999,
			},
		}
	);
	let points = 0;
	response.data.forEach((m: record) => {
		points += m.points;
	});
	response.data = points;
	return response;
}

// gets the top 100 records on a map
export async function getMaptop(
	mapName: string,
	course: number,
	mode: string,
	runtype: boolean
) {
	return await req(`records/top?`, record, {
		params: {
			map_name: mapName,
			stage: course,
			modes_list_string: mode,
			has_teleports: runtype,
			limit: 100,
		},
	});
}

// gets the top 100 record holders
export async function getTop(
	modeID: number,
	courses: number[],
	runtype: boolean
) {
	let link = "";
	courses.forEach((c) => (link += `stages=${c}&`));
	return await req(`records/top/world_records?` + link, z.unknown(), {
		params: {
			mode_ids: modeID,
			tickrates: 128,
			has_teleports: runtype,
			limit: 100,
		},
	});
}

// gets a list of all global map names
export async function getMapcycle() {
	let response: { success: boolean; data?: any } = { success: false };
	await axios
		.get(`https://maps.cawkz.net/mapcycles/gokz.txt`)
		.then((r) => {
			return (response = r.data
				? { success: true, data: r.data.split("\r\n") }
				: { success: false });
		})
		.catch((err) => {
			return handleErr(err);
		});
	return response;
}

// gets the tier of a map
export async function getTier(mapName: string, mapList: map[]) {
	let response: { success: boolean; data?: any } = { success: false };
	mapList.forEach((m: map) => {
		if (m.name === mapName)
			return (response = { success: true, data: m.difficulty });
	});
	return response;
}

// gets all maps from kzgo.eu
export async function getMapsKZGO() {
	let response: { success: boolean; data?: any } = { success: false };
	await axios
		.get(`https://kzgo.eu/api/maps/`)
		.then((r) => {
			return (response = r.data[0]
				? { success: true, data: r.data }
				: { success: false });
		})
		.catch((err) => {
			return handleErr(err);
		});
	return response;
}

// checks if a SteamID is registered in the GlobalAPI
export async function isKZPlayer(steamID: string) {
	let response = false;
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/players/`, {
			params: { steam_id: steamID },
		})
		.then((r) => {
			if (!r.data[0]) return (response = false);
			if (r.data[0].name === null) return (response = false);
			else return (response = true);
		})
		.catch((err) => {
			return handleErr(err);
		});
	return response;
}

// check if a map is global
export async function isGlobal(mapName: string, mapList: map[]) {
	let response: { success: boolean; data?: any } = { success: false };
	mapList.forEach((m) => {
		if (m.name === mapName) return (response = { success: true, data: m });
	});
	return response;
}

// check which kind of target was specified
export function checkTarget(target: any) {
	if (!isNaN(target)) return { type: "discordID", value: target };
	else if (target.startsWith("<@") && target.endsWith(">"))
		return { type: "mention", value: target.slice(3, -1) };
	else if (isSteamID(target)) return { type: "SteamID", value: target };
	else return { type: "name", value: target };
}
