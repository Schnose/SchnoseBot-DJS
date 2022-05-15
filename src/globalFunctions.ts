import axios from 'axios';
import { CommandInteraction as Interaction, InteractionReplyOptions } from 'discord.js';
import fs from 'fs';

/* Utility */

// Gather files for the commandHandler
export const getFiles = (dir: string, suffix: string) => {
	const files = fs.readdirSync(dir, {
		withFileTypes: true,
	});

	let commandFiles: string[] = [];

	for (const file of files) {
		if (file.isDirectory()) {
			commandFiles = [...commandFiles, ...getFiles(`${dir}/${file.name}`, suffix)];
		} else if (file.name.endsWith(suffix)) {
			commandFiles.push(`${dir}/${file.name}`);
		}
	}

	return commandFiles;
};

// Convert UNIX time into a fancy timestamp
export const convertmin = (num: number) => {
	if (isNaN(num)) return 'None';

	let millies = Math.floor(((num % 1) * 1000) / 1);
	num = Math.floor(num / 1);
	if (num == 0) return 'None';
	let hours = Math.floor(num / 60 / 60);
	let minutes = Math.floor(num / 60) - hours * 60;
	let seconds = num % 60;

	if (hours != 0) {
		return (
			hours.toString().padStart(2, '0') +
			':' +
			minutes.toString().padStart(2, '0') +
			':' +
			seconds.toString().padStart(2, '0') +
			'.' +
			millies.toString().padStart(3, '0')
		);
	} else {
		return (
			minutes.toString().padStart(2, '0') +
			':' +
			seconds.toString().padStart(2, '0') +
			'.' +
			millies.toString().padStart(3, '0')
		);
	}
};

// 1000000 -> 1,000,000
export const numberWithCommas = (x: string) => {
	return x.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// default error message for database errors
export const errDB = (interaction: Interaction, err: any) => {
	console.error(err);
	return answer(interaction, { content: 'Database error. Please contact `AlphaKeks#9826` about this.' });
};

// default error message for API errors
export const errAPI = (interaction: Interaction, err: any) => {
	console.error(err);
	return answer(interaction, { content: 'API Error. Please try again later.' });
};

// default generic error message
export const errDef = (interaction: Interaction, err: any) => {
	console.error(err);

	return answer(interaction, {
		content:
			'Some kind of error occured. If you want to report this bug, you can do so [here](https://github.com/Schnose/SchnoseBot-DJS/issues)',
	});
};

/* discord.js */

// default reply
export const answer = async (interaction: Interaction, input: InteractionReplyOptions) => {
	if (interaction.deferred === true) await interaction.editReply(input);
	else await interaction.reply(input);
};

// Convert Discord @mention into user's ID
export const getIDFromMention = (mention: string) => {
	if (!mention) return;

	if (mention.startsWith('<@') && mention.endsWith('>')) {
		mention = mention.slice(2, -1);

		if (mention.startsWith('!')) {
			mention = mention.slice(1);
		}

		return mention;
	}
};

/* KZ */

// Check GlobalAPI Status
export const checkAPI = async (interaction: Interaction) => {
	let status: any = [];
	await axios
		.get('https://status.global-api.com/api/v2/summary.json')
		.then((response) => {
			let apiStatus = {
				status: response.data.status.description,
				frontend: response.data.components[0].status,
				backend: response.data.components[1].status,
			};
			status.push(apiStatus);
		})
		.catch((err) => {
			errAPI(interaction, err);
			status = undefined;
		});
	await axios
		.get('https://status.global-api.com/api/v2/incidents/unresolved.json')
		.then((response) => {
			let apiIncidents = {
				latest: response.data.incidents[0]?.name || null,
			};
			status.push(apiIncidents);
		})
		.catch((err) => {
			errAPI(interaction, err);
			status = undefined;
		});
	return status;
};

// Check whether a map is valid or not
export const validateMap = async (mapName: string, mapList: any[]) => {
	let map: any = {};
	mapList.forEach((m) => {
		if (m.name.includes(mapName)) return (map = m);
	});
	if (map.name) return map;
	else return (map = {});
};

// Check whether a course is valid or not
export const validateCourse = async (mapName: string, mapList: any[], course: number) => {
	let n = 0;
	let valid = false;
	mapList.forEach((map) => {
		if (map.name === mapName) return (n = map.bonuses), (valid = true);
	});
	if (course > n) valid = false;
	else valid = true;
	return valid;
};

// Check whether 1 or no mode was specified
export const validateMode = async (interaction: Interaction, mode: any, data: any, target: any) => {
	let result: any = { specified: false, mode: mode };
	switch (mode) {
		case null:
			if (!data.List[target]) return (result = null);
			mode = data.List[target].mode;
			switch (mode) {
				case 'all':
					result.specified = false;
					break;
				default:
					result.specified = true;
			}
			break;
		case 'KZTimer':
			mode = 'kz_timer';
			result.specified = true;
			break;
		case 'SimpleKZ':
			mode = 'kz_simple';
			result.specified = true;
			break;
		case 'Vanilla':
			mode = 'kz_vanilla';
			result.specified = true;
			break;
		default:
			result.specified = false;
	}
	result.mode = mode;
	return result;
};

// Check whether a target is valid or not
export const validateTarget = async (interaction: Interaction, target: any) => {
	if (!isNaN(target)) target = { discordID: target };
	else if (target.startsWith('<@') && target.endsWith('>')) target = { discordID: getIDFromMention(target) };
	else {
		let result: any = await getPlayerAPI_name(interaction, target);
		if (result) return (target = { steam_id: result.steam_id });
		result = await getPlayerAPI_steamID(interaction, target);
		if (result) return (target = { steam_id: result.steam_id });
		else return (target = {});
	}
	return target;
};

// Get all maps from the GlobalAPI
export const getMapsAPI = async (interaction: Interaction) => {
	let globalMaps = [{}];
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/maps?`, {
			params: {
				limit: 9999,
				is_validated: true,
			},
		})
		.then((response) => (globalMaps = response.data || [{}]))
		.catch((err) => {
			errAPI(interaction, err);
		});
	return globalMaps;
};

// Get all maps from kzgo.eu
export const getMapsKZGO = async (interaction: Interaction) => {
	let maps = [{}];
	await axios
		.get(`https://kzgo.eu/api/maps/`)
		.then((response) => (maps = response.data || [{}]))
		.catch((err) => {
			errAPI(interaction, err);
		});
	return maps;
};

// Get the global mapcycle
export const getMapcycle = async (interaction: Interaction) => {
	let mapcycle: string[] = [];
	await axios
		.get(`https://maps.cawkz.net/mapcycles/gokz.txt`)
		.then((response) => {
			const maps = response.data;
			mapcycle = maps.split('\r\n') || [];
		})
		.catch((err) => {
			errDef(interaction, err);
		});
	return mapcycle;
};

// Get all modes from the GlobalAPI
export const getModesAPI = async (interaction: Interaction) => {
	let modes = [{}];
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/modes`)
		.then((response) => (modes = response.data || [{}]))
		.catch((err) => {
			errAPI(interaction, err);
		});
	return modes;
};

// Get info on a mode from the GlobalAPI
export const getModeAPI = async (interaction: Interaction, inputMode: any) => {
	let mode = [{}];
	// modeName
	if (isNaN(inputMode)) {
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/modes/name/${encodeURIComponent(inputMode)}`)
			.then((response) => (mode = response.data || [{}]))
			.catch((err) => {
				errAPI(interaction, err);
			});
		return mode;
	}
	// modeID
	else {
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/modes/id/${encodeURIComponent(inputMode)}`)
			.then((response) => (mode = response.data || [{}]))
			.catch((err) => {
				errAPI(interaction, err);
			});
		return mode;
	}
};

// Get a user's mode preference from schnose's DB
export const getMode_DB = async (interaction: Interaction, data: any, target: any) => {
	if (!data.List[target])
		return answer(interaction, {
			content: `You either have to specify a target or set your steamID using the following command:\n \`\`\`\n/setsteam\n\`\`\``,
		});
	return data.List[target].mode;
};

// Get a map from the GlobalAPI
export const getMapAPI = async (interaction: Interaction, inputMap: any) => {
	let map = {};
	// mapName
	if (isNaN(inputMap)) {
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/maps/name/${encodeURIComponent(inputMap)}`)
			.then((response) => (map = response.data || {}))
			.catch((err) => {
				errAPI(interaction, err);
			});
		return map;
	}
	// mapID
	// this does NOT work (api is stupid, idk)
	else {
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/maps/id/${encodeURIComponent(inputMap)}`)
			.then((response) => (map = response.data || {}))
			.catch((err) => {
				errAPI(interaction, err);
			});
		return map;
	}
};

// Get the tier of a map
export const getTier = async (mapName: string, mapList: any[]) => {
	mapList.forEach((map) => {
		if (map.name === mapName) return map.difficulty;
		else return null;
	});
};

// Get a player's points from the GlobalAPI
// THIS DOES NOT WORK PROPERLY, API RETURNS TOO MANY POINTS
export const getPlayerPointsAPI = async (interaction: Interaction, steamID64: bigint, modeID: number) => {
	let playerData = {};
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/player_ranks?`, {
			params: {
				steamid64s: steamID64,
				stages: 0,
				mode_ids: modeID,
				tickrates: 128,
			},
		})
		.then((response) => (playerData = response.data[0] || {}))
		.catch((err) => {
			errAPI(interaction, err);
		});
	return playerData;
};

// Get info on a player from the GlobalAPI by steamID
export const getPlayerAPI_steamID = async (interaction: Interaction, steamID: string) => {
	let player = {};
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/players/steamid/${encodeURIComponent(steamID)}`)
		.then((response) => (player = response.data[0] || {}))
		.catch((err) => {
			errAPI(interaction, err);
		});
	return player;
};

// Get info on a player from the GlobalAPI by name
export const getPlayerAPI_name = async (interaction: Interaction, name: string) => {
	let player = {};
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/players?name=${encodeURIComponent(name)}`)
		.then((response) => (player = response.data[0] || {}))
		.catch((err) => {
			errAPI(interaction, err);
		});
	return player;
};

// Get a user's steamID from schnose's DB
export const getSteamID_DB = async (interaction: Interaction, data: any, target: any) => {
	if (!data.List[target])
		return answer(interaction, {
			content: `You either have to specify a target or set your steamID using the following command:\n \`\`\`\n/setsteam\n\`\`\``,
		});
	return data.List[target].steamId;
};

// Get the filters for a map from the GlobalAPI
export const getFilters = async (interaction: Interaction, mapID: number, course: number) => {
	let modes: any[] = [{}];
	let filters: any = {
		KZT: {
			mode: 'kz_timer',
			displayMode: 'KZTimer',
			abbrMode: 'KZT',
			modeID: 200,
			icon: '❌',
		},
		SKZ: {
			mode: 'kz_simple',
			displayMode: 'SimpleKZ',
			abbrMode: 'SKZ',
			modeID: 201,
			icon: '❌',
		},
		VNL: {
			mode: 'kz_vanilla',
			displayMode: 'Vanilla',
			abbrMode: 'VNL',
			modeID: 202,
			icon: '❌',
		},
	};
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/record_filters?`, {
			params: {
				map_ids: mapID,
				stages: course,
				tickrates: 128,
				has_teleports: false,
				limit: 9999,
			},
		})
		.then((response) => (modes = response.data || [{}]))
		.catch((err) => {
			errAPI(interaction, err);
		});
	if (modes) {
		modes.forEach((mode) => {
			switch (mode.mode_id) {
				case 200:
					filters.KZT.icon = '✅';
					break;
				case 201:
					filters.SKZ.icon = '✅';
					break;
				case 202:
					filters.VNL.icon = '✅';
					break;
				default:
					filters = [{}];
			}
		});
		return filters;
	} else return [{}];
};

// Get the GlobalAPI filter distributions
export const getFilterDistAPI = async (interaction: Interaction, runtype: boolean, modeID: number) => {
	let filters = [{}];
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/record_filters?`, {
			params: {
				stages: 0,
				mode_ids: modeID,
				tickrates: 128,
				has_teleports: runtype,
				limit: 9999,
			},
		})
		.then((response) => (filters = response.data || [{}]))
		.catch((err) => {
			errAPI(interaction, err);
		});
	return filters;
};

// Get a player's PB on a map
export const getPB = async (
	interaction: Interaction,
	steamID: string,
	mapName: string,
	course: number,
	mode: string,
	runtype: boolean
) => {
	let PB = {};
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/records/top?`, {
			params: {
				steam_id: steamID,
				map_name: mapName,
				tickrate: 128,
				stage: course,
				modes_list: mode,
				has_teleports: runtype,
			},
		})
		.then((response) => (PB = response.data[0] || {}))
		.catch((err) => {
			errAPI(interaction, err);
		});
	return PB;
};

// Get the WR on a map
export const getWR = async (interaction: Interaction, mapName: string, course: number, mode: string, runtype: boolean) => {
	let WR = {};
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/records/top?`, {
			params: {
				map_name: mapName,
				tickrate: 128,
				stage: course,
				modes_list: mode,
				has_teleports: runtype,
				limit: 1,
			},
		})
		.then((response) => (WR = response.data[0] || {}))
		.catch((err) => {
			errAPI(interaction, err);
		});
	return WR;
};

// Get the Top 100 times on a map
export const getMaptop = async (interaction: Interaction, mapName: string, mode: string, course: number, runtype: boolean) => {
	let maptop = [{}];
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/records/top?`, {
			params: {
				map_name: mapName,
				tickrate: 128,
				stage: course,
				modes_list: mode,
				has_teleports: runtype,
				limit: 100,
			},
		})
		.then((response) => (maptop = response.data || [{}]))
		.catch((err) => {
			errAPI(interaction, err);
		});
	return maptop;
};

// Get all times of a player
export const getTimes = async (interaction: Interaction, steamID: string, mode: string, runtype: boolean) => {
	let times = [{}];
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/records/top/?`, {
			params: {
				steam_id: steamID,
				tickrate: 128,
				stage: 0,
				modes_list: mode,
				has_teleports: runtype,
				limit: 9999,
			},
		})
		.then((response) => (times = response.data || [{}]))
		.catch((err) => {
			errAPI(interaction, err);
		});
	return times;
};

// Get a player's most recent time
export const getRecent = async (interaction: Interaction, steamID: string, mode: string, runtype: boolean) => {
	let recent = {};
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/records/top/?`, {
			params: {
				steam_id: steamID,
				tickrate: 128,
				stage: 0,
				modes_list_string: mode,
				has_teleports: runtype,
				limit: 9999,
			},
		})
		.then((response) => {
			const recentMaps = new Map();
			response.data.forEach((r: any) => {
				r.created_on = Date.parse(r.created_on);
				recentMaps.set(r.created_on, r);
			});
			const recentMap = Math.max(...recentMaps.keys());
			recent = recentMaps.get(recentMap);
		})
		.catch((err) => {
			errAPI(interaction, err);
		});
	return recent;
};

// Get the #place of a run
export const getPlace = async (interaction: Interaction, run: any) => {
	let place: any;
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/records/place/${encodeURIComponent(run.id)}`)
		.then((response) => {
			if (response.data) place = response.data;
			else place = null;
		})
		.catch((err) => {
			errAPI(interaction, err);
		});
	if (place) place = `[#${place}]`;
	return place;
};

// Get the Top 100 record holders
export const getTop = async (interaction: Interaction, mode: string, stages: number[], runtype: boolean) => {
	let top = [{}];
	let modeID = 0;
	switch (mode) {
		case 'kz_timer':
			modeID = 200;
			break;
		case 'kz_simple':
			modeID = 201;
			break;
		case 'kz_vanilla':
			modeID = 202;
			break;
		default:
			modeID = 0;
	}
	let link = `https://kztimerglobal.com/api/v2.0/records/top/world_records?`;
	stages.forEach((i) => (link += `stages=${i}&`));
	await axios
		.get(link, {
			params: {
				mode_ids: modeID,
				tickrates: 128,
				has_teleports: runtype,
				limit: 100,
			},
		})
		.then((response) => (top = response.data || [{}]))
		.catch((err) => {
			errAPI(interaction, err);
		});
	return top;
};

// Get the download link for a replay
export const getReplay = async (run: any) => {
	const replay = `https://kztimerglobal.com/api/v2.0/records/replay/${run.replay_id}`;
	return replay;
};
