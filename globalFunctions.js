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
};

module.exports = globalFunctions;
