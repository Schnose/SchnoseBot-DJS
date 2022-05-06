const axios = require("axios");
const fs = require("fs");

const globalFunctions = {
	/* Utility */

	// Registering Command Files
	getFiles: function (dir, suffix) {
		const files = fs.readdirSync(dir, {
			withFileTypes: true,
		});

		let cmdFiles = [];

		for (const file of files) {
			if (file.isDirectory()) {
				cmdFiles = [...cmdFiles, ...globalFunctions.getFiles(`${dir}/${file.name}`, suffix)];
			} else if (file.name.endsWith(suffix)) {
				cmdFiles.push(`${dir}/${file.name}`);
			}
		}

		return cmdFiles;
	},

	// Convert UNIX timestamp into a nicer time format
	convertmin: function (num) {
		let millies = Math.floor(((num % 1) * 1000) / 1);
		num = Math.floor(num / 1);
		if (num == 0) return "None";
		let hours = Math.floor(num / 60 / 60);
		let minutes = Math.floor(num / 60) - hours * 60;
		let seconds = num % 60;

		if (hours != 0) {
			return (
				hours.toString().padStart(2, "0") +
				":" +
				minutes.toString().padStart(2, "0") +
				":" +
				seconds.toString().padStart(2, "0") +
				"." +
				millies.toString().padStart(3, "0")
			);
		} else {
			return (
				minutes.toString().padStart(2, "0") +
				":" +
				seconds.toString().padStart(2, "0") +
				"." +
				millies.toString().padStart(3, "0")
			);
		}
	},

	// 1000000 -> 1,000,000
	numberWithCommas: function (x) {
		return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	},

	// Convert Discord @mention into user's ID
	getIDFromMention: function (mention) {
		if (!mention) return;

		if (mention.startsWith("<@") && mention.endsWith(">")) {
			mention = mention.slice(2, -1);

			if (mention.startsWith("!")) {
				mention = mention.slice(1);
			}

			return mention;
		}
	},

	// Default error message
	errMsg: function () {
		console.log(
			`Command: ${__filename}\nServer: ${interaction.guild.name} | ${interaction.guild.id}\nUser: ${interaction.user.tag} | ${interaction.user.id}\nChannel: ${interaction.channel.name} | ${interaction.channel.id}`
		);
	},

	// Check GlobalAPI Status
	checkAPI: async function () {
		let result;
		await axios
			.get("https://kztimerglobal.com/api/v2.0/modes")
			.then((response) => (result = response.data))
			.catch((e) => {
				console.error(e);
				result = undefined;
			});
		return result;
	},

	// Check the Tier of a map
	checkTier: async function (mapName, mapList) {
		const globalMaps = mapList;
		globalMaps.forEach((m) => {
			if (m.name === mapName) return m.difficulty;
		});
	},

	// Get Tier distribution for VNL
	vnlTiers: async function (tier) {
		let num = tier;
		await axios
			.get(`https://kzgo.eu/api/maps/completion/kz_vanilla`)
			.then((response) => (num = response[num] || null))
			.catch((e) => {
				console.error(e);
				num = undefined;
			});
		return num;
	},

	// Check if a map is global
	validateMap: async function (mapName) {
		let valid, map;
		const globalMaps = await globalFunctions.getMapsAPI();
		globalMaps.forEach((m) => {
			if (m.name.includes(mapName)) {
				valid = true;
				map = m;
			}
			return valid, map;
		});
		if (valid) return map;
		else return null;
	},

	// Check if a course is valid
	validateCourse: async function (mapName, course) {
		const maps = await globalFunctions.getMapsKZGO();
		let n;
		let valid;
		maps.forEach((m) => {
			if (m.name === mapName) return (n = m.bonuses), (valid = true);
		});
		if (course > n) return (valid = false);
		return (valid = true);
	},

	// Check if a target is valid
	validateTarget: async function (target) {
		if (target.startsWith("<@") && target.endsWith(">")) target = globalFunctions.getIDFromMention(target);
		else {
			let result = await globalFunctions.getPlayerAPI_name(target);
			if (result) return (target = result);
			result = await globalFunctions.getPlayerAPI_steamID(target);
			if (result) return (target = result);
			else return (target = null);
		}
		return target;
	},

	// Get all maps from the API
	getMapsAPI: async function () {
		let globalMaps = [];
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/maps?`, {
				params: {
					limit: 9999,
				},
			})
			.then((response) => (globalMaps = response.data || null))
			.catch((e) => {
				console.error(e);
				globalMaps = undefined;
			});
		return globalMaps;
	},

	// Get all maps from kzgo.eu
	getMapsKZGO: async function () {
		let maps = [];
		await axios
			.get(`https://kzgo.eu/api/maps/`)
			.then((response) => (maps = response.data || null))
			.catch((e) => {
				console.error(e);
				maps = undefined;
			});
		return maps;
	},

	// Get API data on a map
	getMapAPI: async function (inputMap) {
		let map;
		// mapName
		if (isNaN(inputMap)) {
			await axios
				.get(`https://kztimerglobal.com/api/v2.0/maps/name/${encodeURIComponent(inputMap)}`)
				.then((response) => (map = response.data || null))
				.catch((e) => {
					console.error(e);
					map = undefined;
				});
			return map;
		}
		// mapID
		// this does NOT work (api is stupid, idk)
		else {
			await axios
				.get(`https://kztimerglobal.com/api/v2.0/maps/id/${encodeURIComponent(inputMap)}`)
				.then((response) => (map = response.data || null))
				.catch((e) => {
					console.error(e);
					map = undefined;
				});
			return map;
		}
	},

	// Get the global map cycle
	getMapcycle: async function () {
		let mapcycle = [];
		await axios
			.get(`https://kzmaps.tangoworldwide.net/mapcycles/gokz.txt`)
			.then((response) => {
				const maps = response.data;
				mapcycle = maps.split("\r\n") || null;
			})
			.catch((e) => {
				console.error(e);
				mapcycle = undefined;
			});
		return mapcycle;
	},

	// Get all modes from the API
	getModesAPI: async function () {
		let modes = [];
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/modes`)
			.then((response) => (modes = response.data || null))
			.catch((e) => {
				console.error(e);
				modes = undefined;
			});
		return modes;
	},

	// Get API data on a mode
	getModeAPI: async function (inputMode) {
		let mode;
		// modeName
		if (isNaN(inputMode)) {
			await axios
				.get(`https://kztimerglobal.com/api/v2.0/modes/name/${encodeURIComponent(inputMode)}`)
				.then((response) => (mode = response.data || null))
				.catch((e) => {
					console.error(e);
					mode = undefined;
				});
			return mode;
		}
		// modeID
		else {
			await axios
				.get(`https://kztimerglobal.com/api/v2.0/modes/id/${encodeURIComponent(inputMode)}`)
				.then((response) => (mode = response.data || null))
				.catch((e) => {
					console.error(e);
					mode = undefined;
				});
			return mode;
		}
	},

	// Get a player's points and finishes
	// steamID64 should be a string here or js will cry like a bitch
	getPlayerPointsAPI: async function (steamID64, modeID) {
		let playerData;
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/player_ranks?`, {
				params: {
					steamid64s: steamID64,
					stages: 0,
					mode_ids: modeID,
					tickrates: 128,
				},
			})
			.then((response) => (playerData = response.data[0] || null))
			.catch((e) => {
				console.error(e);
				playerData = undefined;
			});
		return playerData;
	},

	// Get API data on a player by steamID
	getPlayerAPI_steamID: async function (steamID) {
		let player;
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/players/steamid/${encodeURIComponent(steamID)}`)
			.then((response) => (player = response.data[0] || null))
			.catch((e) => {
				console.error(e);
				player = undefined;
			});
		return player;
	},

	// Get API data on a player by name
	getPlayerAPI_name: async function (name) {
		let player;
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/players?name=${name}`)
			.then((response) => (player = response.data[0] || null))
			.catch((e) => {
				console.error(e);
				player = undefined;
			});
		return player;
	},

	// Get API filters for a map
	getFiltersAPI: async function (mapID, course) {
		let modes = [];
		let filters = [];
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
			.then((response) => (modes = response.data || null))
			.catch((e) => {
				console.error(e);
				modes = undefined;
			});
		if (modes) {
			modes.forEach((mode) => {
				switch (mode.mode_id) {
					case 200:
						filters.push({ mode: "kz_timer", displayMode: "KZTimer", abbrMode: "KZT", modeID: 200 });
						break;
					case 201:
						filters.push({ mode: "kz_simple", displayMode: "SimpleKZ", abbrMode: "SKZ", modeID: 201 });
						break;
					case 202:
						filters.push({ mode: "kz_vanilla", displayMode: "Vanilla", abbrMode: "VNL", modeID: 202 });
						break;
					default:
						filters = null;
				}
			});
			return filters;
		} else return null;
	},

	// Get API filter distributions
	getFilterDistAPI: async function (runtype, modeID) {
		let filters;
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
			.then((response) => (filters = response.data || null))
			.catch((e) => {
				console.error(e);
				filters = undefined;
			});
		return filters;
	},

	// Get a player's PB on a map
	getPB: async function (steamID, mapName, course, mode, runtype) {
		let PB;
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
			.then((response) => (PB = response.data[0] || null))
			.catch((e) => {
				console.error(e);
				PB = undefined;
			});
		return PB;
	},

	// Get the WR on a map
	getWR: async function (mapName, course, mode, runtype) {
		let WR;
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
			.then((response) => (WR = response.data[0] || null))
			.catch((e) => {
				console.error(e);
				WR = undefined;
			});
		return WR;
	},

	// Get the Top 100 times on a map
	getMaptop: async function (mapName, mode, course, runtype) {
		let maptop = [];
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
			.then((response) => (maptop = response.data || null))
			.catch((e) => {
				console.error(e);
				maptop = undefined;
			});
		return maptop;
	},

	// Get all times of a player
	getTimes: async function (steamID, mode, runtype) {
		let times = [];
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
			.then((response) => (times = response.data || null))
			.catch((e) => {
				console.error(e);
				times = undefined;
			});
		return times;
	},

	// Get a player's most recent PB
	getRecent: async function (steamID, mode, runtype) {
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
			.then((response) => {
				let createdOn = [];
				let recentMaps = [];
				response.data.forEach((r) => {
					createdOn.push(Date.parse(r.created_on));
					recentMaps.push(r);
				});
				recent = recentMaps[createdOn.indexOf(Math.max(...createdOn))] || null;
			})
			.catch((e) => {
				console.error(e);
				recent = undefined;
			});
		return recent;
	},

	// Get the #place of a run
	getPlace: async function (run) {
		let place;
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/records/place/${encodeURIComponent(run.id)}`)
			.then((response) => {
				if (response.data) place = response.data;
				else place = null;
			})
			.catch((e) => {
				console.error(e);
				place = undefined;
			});
		if (place) place = `[#${place}]`;
		return place;
	},

	// Get the Top 100 Record holders
	getTop: async function (mode, stages, runtype) {
		let top;
		switch (mode) {
			case "kz_timer":
				mode = 200;
				break;
			case "kz_simple":
				mode = 201;
				break;
			case "kz_vanilla":
				mode = 202;
				break;
			default:
				mode = null;
		}
		let link = `https://kztimerglobal.com/api/v2.0/records/top/world_records?`;
		stages.forEach((i) => (link += `stages=${i}&`));
		await axios
			.get(link, {
				params: {
					mode_ids: mode,
					tickrates: 128,
					has_teleports: runtype,
					limit: 100,
				},
			})
			.then((response) => (top = response.data || null))
			.catch((e) => {
				console.error(e);
				top = undefined;
			});
		return top;
	},

	// Get the replay of a run
	getReplay: async function (run) {
		const replay = `https://kztimerglobal.com/api/v2.0/records/replay/${run.replay_id}`;
		return replay;
	},
};

module.exports = globalFunctions;
