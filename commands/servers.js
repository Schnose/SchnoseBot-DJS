const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const { AlphaKeks, iBrahizy, icon } = require("../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("servers")
		.setDescription("[DEV ONLY] List all the servers Schnose is currently on.")
		.setDefaultPermission(true),

	async execute(interaction) {
		async function answer(input) {
			await interaction.reply(input);
		}

		if (interaction.user.id !== AlphaKeks && interaction.user.id !== iBrahizy)
			return answer({ content: "Sorry, but this command is only for the Devs.", ephemeral: true });

		let guildList = [];

		await interaction.client.guilds.fetch;
		interaction.client.guilds.cache.forEach((guild) => {
			guildList.push(guild);
		});

		let embed = new MessageEmbed()
			.setColor("#7480C2")
			.setTitle("Servers:")
			.setDescription(`\n> ${guildList.join("\n> ")}`)
			.setFooter({ text: "(͡ ͡° ͜ つ ͡͡°)7", iconURL: icon });

		answer({ embeds: [embed], ephemeral: true });
	},
};
