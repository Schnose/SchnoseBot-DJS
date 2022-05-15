const { default: axios } = require("axios");
const { checkAPI, getRecent } = require("./dist/globalFunctions");

async function retard() {
	await axios
		.get(`https://kztimerglobal.com/api/v2.0/records/top/recent/?`, {
			params: {
				steam_id: "STEAM_1:1:152337044",
				tickrate: 128,
				stage: 0,
				limit: 999,
			},
		})
		.then((response) => console.log(response))
		.catch((err) => console.log(err));
}

retard();
