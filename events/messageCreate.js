module.exports = {
	name: "messageCreate",

	execute(message) {
		if (message.content === "bing?") {
			const result = Math.random();
			message.channel.send(Math.round(result) ? "chilling 🍦" : "no 😔");
		}
	},
};
