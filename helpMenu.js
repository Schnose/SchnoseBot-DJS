const { MessageEmbed } = require("discord.js");

let helpEmbedOptions = {
	title: "",
	description: "",
	ephemeral: true,
};

let helpEmbed = new MessageEmbed()
	.setColor("#7480C2")
	.setTitle(helpEmbedOptions.title)
	.setDescription(helpEmbedOptions.description)
	.setFooter({ text: "(͡ ͡° ͜ つ ͡͡°)7", iconURL: "https://schnose.eu/images/churchOfSchnose.png" });

module.exports = { helpEmbedOptions, helpEmbed };
