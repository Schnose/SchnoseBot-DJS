const axios = require("axios");
const fs = require("fs");

const globalFunctions = {
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

	// Get Player by steamID
	getSteamID: async function (target) {
		let result;
		target = encodeURIComponent(target);
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/players/steamid/${target}`)
			.then((response) => {
				let data = response.data;
				try {
					result = data[0].steam_id;
				} catch {
					return null;
				}
			})
			.catch((e) => {
				console.error(e);
				result = "bad";
			});

		return result;
	},

	// Get Player by Name
	getName: async function (target) {
		let result;
		target = encodeURIComponent(target);
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/players?name=${target}&limit=1`)
			.then((response) => {
				let data = response.data;
				try {
					result = data[0].steam_id;
				} catch {
					return null;
				}
			})
			.catch((e) => {
				console.error(e);
				result = "bad";
			});

		return result;
	},

	// Get API entries for all global maps
	getMapsAPI: async function () {
		let data;
		await axios
			.get("https://kztimerglobal.com/api/v2.0/maps?&is_validated=true&limit=9999")
			.then((response) => {
				data = response.data;
			})
			.catch((e) => {
				data = "bad";
				console.error(e);
			});
		return data;
	},

	// Get global mapcycle as an array
	getMapcycle: async function () {
		let h;
		await axios
			.get(`https://kzmaps.tangoworldwide.net/mapcycles/gokz.txt`)
			.then(function (response) {
				const maps = response.data;
				let mapList = [];
				mapList = maps.split("\r\n");
				h = mapList;
			})
			.catch(function (e) {
				h = "bad";
				console.error(e);
			});
		return h;
	},

	// Check global filters for a map
	checkFilters: async function (mapID, course) {
		let h;
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/record_filters?tickrates=128&limit=9999`, {
				params: {
					has_teleports: false,
					map_ids: mapID,
					stages: course,
				},
			})
			.then((response) => {
				h = response.data;
			})
			.catch((e) => {
				h = "bad";
				console.error(e);
			});
		return h;
	},

	// Get data of all maps on kzgo.eu
	kzgoMaps: async function () {
		let h;
		await axios
			.get("https://kzgo.eu/api/maps/")
			.then((response) => {
				h = response.data;
			})
			.catch((e) => {
				console.log(e);
				h = "bad";
			});
		return h;
	},

	// Get all maps that are doable in a certain mode
	getDoableMaps: async function (runtype, mode) {
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
				return;
		}

		let h = [];
		await axios
			.get("https://kztimerglobal.com/api/v2.0/record_filters?stages=0&tickrates=128&limit=9999", {
				params: {
					mode_ids: mode,
					has_teleports: runtype,
				},
			})
			.then((response) => {
				response.data.forEach((i) => {
					h.push(i.map_id);
				});
			})
			.catch((e) => {
				h = "bad";
				console.error(e);
			});
		return h;
	},

	// Get a user's PB on a map
	getDataPB: async function (steamid, runtype, mode, map, stage) {
		let h = 0;
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/records/top?`, {
				params: {
					steam_id: steamid,
					has_teleports: runtype,
					modes_list: mode,
					map_name: map,
					stage: stage,
				},
			})
			.then((response) => {
				let data = response.data[0];
				if (data) {
					h = data;
				} else {
					h = { time: 0 };
				}
			})
			.catch((e) => {
				h = "bad";
				console.error(e);
			});

		return h;
	},

	// Get the WR on a map
	getDataWR: async function (runtype, mode, map, stage) {
		let h;
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/records/top?`, {
				params: {
					has_teleports: runtype,
					modes_list: mode,
					map_name: map,
					stage: stage,
					limit: 1,
				},
			})
			.then((response) => {
				let data = response.data;
				if (!response.data[0]) {
					h = {
						time: 0,
					};
				} else h = data[0];
			})
			.catch(function (e) {
				h = "bad";
				console.error(e);
			});
		return h;
	},

	// Get a user's most recent PB
	getDataRS: async function (steamid, runtype, mode) {
		let h;
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/records/top/?`, {
				params: {
					has_teleports: runtype,
					modes_list: mode,
					steam_id: steamid,
					tickrate: 128,
					limit: 9999,
					stage: 0,
				},
			})
			.then((response) => {
				let data = response.data;
				if (!response.data[0]) {
					h = {
						created_on: 0,
					};
				} else h = data;
			})
			.catch((e) => {
				h = "bad";
				console.error(e);
			});
		return h;
	},

	// Takes in a time and returns the #place of that time
	getPlace: async function (time) {
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/records/place/${time.id}`)
			.then((response) => {
				data = response.data;
				if (data) {
					place = data;
				} else {
					//place = null;
				}
			})
			.catch((err) => {
				place = "bad";
			});
		if (place && place != "bad") place = "[#" + place + "]";
		return place;
	},

	// Get the top 10 times on a map
	getDataMaptop: async function (runtype, mode, map, stage) {
		let h;
		await axios
			.get(`https://kztimerglobal.com/api/v2.0/records/top?`, {
				params: {
					has_teleports: runtype,
					modes_list: mode,
					map_name: map,
					stage: stage,
					limit: 10,
				},
			})
			.then((response) => {
				let data = response.data;
				if (!response.data[0]) {
					h = "no data";
				} else h = data;
			})
			.catch((err) => {
				h = "bad";
			});
		return h;
	},
};

module.exports = globalFunctions;
