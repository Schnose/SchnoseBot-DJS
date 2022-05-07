import { promisify } from "util";
import glob from "glob";
const PG = promisify(glob);

export async function eventHandler(client: any) {
	const events: any[] = [];

	(await PG(`${process.cwd()}/dist/events/*.js`)).map(async (file: string) => {
		const event = require(file);

		if (event.once) client.once(event.name, (...args: any) => event.execute(...args, client));
		else client.on(event.name, (...args: any) => event.execute(...args, client));

		events.push(event.name);
	});

	console.log("Sucessfully registered Events.");
	console.log(events);
}
