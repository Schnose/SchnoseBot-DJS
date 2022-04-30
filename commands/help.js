const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageSelectMenu } = require("discord.js");
const { MessageActionRow } = require("discord.js");
const { MessageEmbed } = require("discord.js");
const { icon } = require("../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("help")
		.setDescription("Get detailed information on all the commands you can use.")
		.setDefaultPermission(true),

	async execute(interaction) {
		interaction.deferReply();
		async function answer(input) {
			await interaction.editReply(input);
		}

		const embed = new MessageEmbed()
			.setColor("#7480c2")
			.setTitle("Help Menu")
			.setDescription(
				"**(͡ ͡° ͜ つ ͡͡°)/**\n\nUse the menu below to get information on any command.\nIf you find any bugs or have any ideas for new features / improving existing ones, __*please*__ message `AlphaKeks#9826`.\n\nGitHub Page: https://github.com/Schnose/Schnose-DJS\nSteam Group: https://schnose.eu/church"
			)
			.setFooter({ text: "(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church", iconURL: icon });

		const commandMenu = new MessageActionRow().addComponents(
			new MessageSelectMenu().setCustomId("commands-menu").setPlaceholder("Please select a category.").addOptions(
				{
					label: `/apistatus`,
					description: `Check the GlobalAPI Status`,
					value: "apistatus-value",
				},
				{
					label: `/bmaptop`,
					description: `Check a bonus Top 100`,
					value: "bmaptop-value",
				},
				{
					label: `/bpb`,
					description: `Check someone's Personal Best on a bonus of a map.`,
					value: `bpb-value`,
				},
				{
					label: `/btop`,
					description: `Check who has the most Bonus World Records.`,
					value: `btop-value`,
				},
				{
					label: `/bwr`,
					description: `Check a Bonus World Record on a map.`,
					value: `bwr-value`,
				},
				{
					label: `/db`,
					description: `Check your current Database entries.`,
					value: `db-value`,
				},
				{
					label: `/filters`,
					description: `Check a map's Filters`,
					value: `filters-value`,
				},
				{
					label: `/invite`,
					description: `Invite Schnose to your server!`,
					value: `invite-value`,
				},
				{
					label: `/map`,
					description: `Get detailed information on a map.`,
					value: `map-value`,
				},
				{
					label: `/maptop`,
					description: `Check a map's Top 100`,
					value: `maptop-value`,
				},
				{
					label: `/mode`,
					description: `Save your preferred gamemode in Schnose's database.`,
					value: `mode-value`,
				},
				{
					label: `/nocrouch`,
					description: `Approximate potential distance of a nocrouch jump.`,
					value: `nocrouch-value`,
				},
				{
					label: `/pb`,
					description: `Check someone's personal best on a map.`,
					value: `pb-value`,
				},
				{
					label: `/profile`,
					description: `Check a player profile.`,
					value: `profile-value`,
				},
				{
					label: `/random`,
					description: `Get a random KZ map. You can sort by filters if you want :)`,
					value: `random-value`,
				},
				{
					label: `/recent`,
					description: `Get a player's most recent Personal Best`,
					value: `recent-value`,
				},
				{
					label: `/setsteam`,
					description: `Save your steamID in Schnose's database.`,
					value: `setsteam-value`,
				},
				{
					label: `/top`,
					description: `Check who has the most World Records.`,
					value: `top-value`,
				},
				{
					label: `/unfinished`,
					description: `Check which maps you still have to complete.`,
					value: `unfinished-value`,
				},
				{
					label: `/wr`,
					description: `Check the World Record of a map.`,
					value: `wr-value`,
				}
			)
		);

		answer({ embeds: [embed], components: [commandMenu], ephemeral: true });
	},
};
