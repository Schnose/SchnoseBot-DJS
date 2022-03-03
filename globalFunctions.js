// Package Imports
const axios = require("axios");
const fs = require("fs");

globalFunctions = {
    // for command handler
    getFiles: function (dir, suffix) {
        const files = fs.readdirSync(dir, {
            withFileTypes: true,
        });

        let commandFiles = [];

        for (const file of files) {
            if (file.isDirectory()) {
                commandFiles = [
                    ...commandFiles,
                    ...globalFunctions.getFiles(`${dir}/${file.name}`, suffix),
                ];
            } else if (file.name.endsWith(suffix)) {
                commandFiles.push(`${dir}/${file.name}`);
            }
        }

        return commandFiles;
    },

    // Conversions
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
    numberWithCommas: function (x) {
        return x.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
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

    // KZ
    getDataPB: async function (steamid, runtype, mode, map, stage) {
        let hh = 0;
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
            .then(function (response) {
                let data = response.data[0];
                if (data) {
                    hh = data;
                } else {
                    hh = { time: 0 };
                }
            })
            .catch(function (err) {
                hh = "bad";
            });

        return hh;
    },
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
            .then(function (response) {
                let data = response.data;
                if (!response.data[0]) {
                    h = {
                        time: 0,
                    };
                } else h = data[0];
            })
            .catch(function (err) {
                h = "bad";
            });
        return h;
    },
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
            .then(function (response) {
                let data = response.data;
                if (!response.data[0]) {
                    h = {
                        created_on: 0,
                    };
                } else h = data;
            })
            .catch(function (err) {
                h = "bad";
            });
        return h;
    },
    getTopPlace: async function (time) {
        await axios
            .get(`https://kztimerglobal.com/api/v2.0/records/place/${time.id}`)
            .then(function (response) {
                data = response.data;
                if (data) {
                    place = data;
                } else {
                    //place = null;
                }
            })
            .catch(function (err) {
                place = "bad";
            });
        if (place && place != "bad") place = "[#" + place + "]";
        return place;
    },
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
            .then(function (response) {
                let data = response.data;
                if (!response.data[0]) {
                    h = "no data";
                } else h = data;
            })
            .catch(function (err) {
                h = "bad";
            });
        return h;
    },
    getsteamID: async function (target) {
        let result;
        target = encodeURIComponent(target);
        await axios
            .get(`https://kztimerglobal.com/api/v2.0/players/steamid/${target}`)
            .then(function (response) {
                let data = response.data;
                try {
                    result = data[0].steam_id;
                } catch {
                    return null;
                }
            })
            .catch(function (err) {
                result = "bad";
            });

        return result;
    },
    getPlayer: async function (target) {
        let result;
        target = encodeURIComponent(target);
        await axios
            .get(`https://kztimerglobal.com/api/v2.0/players/steamid/${target}`)
            .then(function (response) {
                let data = response.data;
                try {
                    result = data[0];
                } catch {
                    return null;
                }
            })
            .catch(function (err) {
                result = "bad";
            });

        return result;
    },
    getName: async function (target) {
        let result;
        target = encodeURIComponent(target);
        await axios
            .get(`https://kztimerglobal.com/api/v2.0/players?name=${target}&limit=1`)
            .then(function (response) {
                let data = response.data;
                try {
                    result = data[0].steam_id;
                } catch {
                    return null;
                }
            })
            .catch(function (err) {
                result = "bad";
            });

        return result;
    },
    getMaps: async function () {
        let h;
        await axios
            .get(`https://kzmaps.tangoworldwide.net/mapcycles/gokz.txt`)
            .then(function (response) {
                let maps = response.data;
                let maplist = [""];
                let x = 0;
                let maparray = Array.from(maps);
                maparray.forEach((i) => {
                    if (i != "\r" && i != "\n") {
                        maplist[x] += i;
                    } else if (i == "\n") {
                        x++;
                        maplist.push("");
                    }
                });
                h = maplist;
            })
            .catch(function (err) {
                h = "bad";
                //console.log(err);
            });
        return h;
    },
    getMapsAPI: async function () {
        let data;
        await axios
            .get("https://kztimerglobal.com/api/v2.0/maps?&is_validated=true&limit=9999")
            .then(function (response) {
                data = response.data;
            })
            .catch(function (err) {
                data = "bad";
                console.log(err);
            });
        return data;
    },
    getDoableMaps: async function (runtype, mode) {
        if (mode == "kz_timer") {
            mode = 200;
        } else if (mode == "kz_simple") {
            mode = 201;
        } else if (mode == "kz_vanilla") {
            mode = 202;
        } else return;
        let h;
        await axios
            .get(
                "https://kztimerglobal.com/api/v2.0/record_filters?stages=0&tickrates=128&limit=9999",
                {
                    params: {
                        mode_ids: mode,
                        has_teleports: runtype,
                    },
                }
            )
            .then(function (response) {
                let hh = response.data;
                h = [];
                hh.forEach((i) => {
                    h.push(i.map_id);
                });
            })
            .catch(function (err) {
                h = "bad";
                console.log(err);
            });
        return h;
    },
    hasFilter: async function (mapid, course) {
        let h;
        await axios
            .get(`https://kztimerglobal.com/api/v2.0/record_filters?tickrates=128&limit=9999`, {
                params: {
                    has_teleports: false,
                    map_ids: mapid,
                    stages: course,
                },
            })
            .then(function (response) {
                h = response.data;
            })
            .catch(function (err) {
                h = "bad";
                console.log(err);
            });
        return h;
    },
    getTimes: async function (steamid, runtype, mode) {
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
            .then(function (response) {
                h = response.data;
            })
            .catch(function (err) {
                h = "bad";
                console.log(err);
            });
        return h;
    },
    getTopPlayers: async function (mode, stages, runtype) {
        if (mode == "kz_timer") {
            mode = 200;
        } else if (mode == "kz_simple") {
            mode = 201;
        } else if (mode == "kz_vanilla") {
            mode = 202;
        } else return;
        link = "https://kztimerglobal.com/api/v2.0/records/top/world_records?";
        const testparms = {
            mode_ids: mode,
            tickrates: 128,
            limit: 10,
            has_teleports: runtype,
        };
        stages.forEach((i) => {
            link += `stages=${i}&`;
        });
        let h;
        await axios
            .get(link, {
                params: testparms,
            })
            .then(function (response) {
                h = response.data;
            })
            .catch(function (err) {
                h = "bad";
                console.log(err);
            });
        return h;
    },
    stealKZGOdata: async function () {
        let h;
        await axios
            .get("https://kzgo.eu/api/maps/")
            .then(function (response) {
                h = response.data;
            })
            .catch(function (err) {
                console.log(err);
                h = "bad";
            });
        return h;
    },
};
