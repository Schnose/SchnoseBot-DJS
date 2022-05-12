const { default: axios } = require('axios');
const { checkAPI } = require('./dist/globalFunctions');

async function retard() {
	const result = await checkAPI();
	console.log(result);
}

retard();
