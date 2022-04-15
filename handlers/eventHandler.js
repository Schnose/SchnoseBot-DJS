const { promisify } = require("util");
const { glob } = require("glob");
const PG = promisify(glob);

async function eventHandler(client) {
	const Events = [];
	(await PG(`${process.cwd()}/events/*.js`)).map(async (file) => {
		const event = require(file);

		if (event.once) client.once(event.name, (...args) => event.execute(...args, client));
		else client.on(event.name, (...args) => event.execute(...args, client));

		Events.push(event.name);
	});

	console.log("Successfully registered Events.");
	console.log(Events);
}

module.exports = eventHandler;
