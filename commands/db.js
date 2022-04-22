const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const userSchema = require("../database/user-schema");
const globalFunctions = require("../globalFunctions");
const { icon } = require("../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("db")
		.setDescription("Check your current Database entries.")
		.setDefaultPermission(true),

	async execute(interaction) {
		async function answer(input) {
			await interaction.reply(input);
		}

		userSchema.findOne(async (err, data) => {
			if (err) {
				console.error(err);
				answer({ content: "Database Error.", ephemeral: true });
				return globalFunctions.errMsg();
			}

			if (!data) return answer({ content: "You don't have any Database entries." });

			let [USERID, STEAMID, MODE] = "";
			if (data.List[interaction.user.id].userId) USERID = data.List[interaction.user.id].userId;
			if (data.List[interaction.user.id].userId) STEAMID = data.List[interaction.user.id].steamId;
			if (data.List[interaction.user.id].userId) MODE = data.List[interaction.user.id].mode;

			let embed = new MessageEmbed()
				.setColor("#7480c2")
				.setTitle("Your current Database entries:")
				.setDescription(`> userID: ${USERID}\n> steamID: ${STEAMID}\n> mode: ${MODE}`)
				.setFooter({ text: "(͡ ͡° ͜ つ ͡͡°)7", iconURL: icon });

			answer({ embeds: [embed], ephemeral: true });
		});
	},
};
