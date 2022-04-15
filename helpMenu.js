const { MessageEmbed } = require("discord.js");
const { icon } = require("./config.json");

let helpEmbedOptions = {
	title: "",
	description: "",
	ephemeral: true,
};

let helpEmbed = new MessageEmbed()
	.setColor("#7480C2")
	.setTitle(helpEmbedOptions.title)
	.setDescription(helpEmbedOptions.description)
	.setFooter({ text: "(͡ ͡° ͜ つ ͡͡°)7", iconURL: icon });

module.exports = { helpEmbedOptions, helpEmbed };
