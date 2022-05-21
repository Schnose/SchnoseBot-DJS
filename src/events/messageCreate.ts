import { Message } from 'discord.js';

module.exports = {
	name: 'messageCreate',

	execute(message: Message) {
		if (message.author.id === '940308056451973120') return;

		if (message.content.includes('bing?'))
			return message.reply({ content: `${Math.round(Math.random()) ? 'chilling 🍦' : 'no 😔'}` });
	},
};
