const { SlashCommandBuilder } = require("@discordjs/builders");
const globalFunctions = require("../globalFunctions");
const userSchema = require("../database/user-schema");
const { MessageEmbed, MessageButton } = require("discord.js");
const { icon } = require("../config.json");
const paginationEmbed = require("discordjs-button-pagination");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("top")
		.setDescription("Check who has the most World Records.")
		.setDefaultPermission(true)
		.addStringOption((o) =>
			o.setName("runtype").setDescription("TP/PRO").setRequired(false).addChoice("TP", "true").addChoice("PRO", "false")
		)
		.addStringOption((o) =>
			o
				.setName("mode")
				.setDescription("Select a Mode.")
				.setRequired(false)
				.addChoice("SKZ", "SimpleKZ")
				.addChoice("KZT", "KZTimer")
				.addChoice("VNL", "Vanilla")
		),

	async execute(interaction) {
		await interaction.deferReply();
		async function answer(input) {
			await interaction.editReply(input);
		}

		userSchema.findOne(async (err, data) => {
			if (err) return console.error(err);

			let runtype = interaction.options.getString("runtype") || false;
			let displayRuntype;
			let mode;
			let displayMode = interaction.options.getString("mode") || null;
			let linkMode;

			/* Runtype validation */
			if (runtype) displayRuntype = "TP";
			else if (!runtype) displayRuntype = "PRO";

			/* Mode validation */
			switch (displayMode) {
				case null:
					if (data.List[interaction.user.id].mode) {
						mode = data.List[interaction.user.id].mode;
						if (mode === "kz_simple") {
							displayMode = "SimpleKZ";
							linkMode = "skz";
						} else if (mode === "kz_timer") {
							displayMode = "KZTimer";
							linkMode = "kzt";
						} else if (mode === "kz_vanilla") {
							displayMode = "Vanilla";
							linkMode = "vnl";
						}
					} else {
						return answer({
							content: `You either have to specify a mode or set a default mode using the following command:\n \`\`\`\n/mode\n\`\`\``,
						});
					}
					break;

				case "SimpleKZ":
					mode = "kz_simple";
					linkMode = "skz";
					break;

				case "KZTimer":
					mode = "kz_timer";
					linkMode = "kzt";
					break;

				case "Vanilla":
					linkMode = "vnl";
					mode = "kz_vanilla";
			}

			/* Leaderboard */
			const Top = await globalFunctions.getTopPlayers(mode, [0], runtype);
			if (Top === "bad") return answer({ content: "API Error. Please try again later." });

			const Leaderboard = [];

			for (let i = 0; i < Top.length; i++) {
				Leaderboard.push({
					name: `[#${i + 1}] ${Top[i].player_name}`,
					value: `${Top[i].count}`,
					inline: true,
				});
			}

			const pages = Math.ceil(Leaderboard.length / 15);
			const embeds = [];

			for (let i = 0; i < pages; i++) {
				let pageEntries = [];

				for (let j = i * 15; j < i * 15 + 15; j++) {
					if (Leaderboard[j]) {
						pageEntries.push(Leaderboard[j]);
					}
				}

				const embed = new MessageEmbed()
					.setColor("#7480c2")
					.setTitle(`Top WRs`)
					.setURL(`https://kzgo.eu/leaderboards?${linkMode || "skz"}=`)
					.setDescription(`Mode: ${displayMode} | Runtype: ${displayRuntype}`)
					.addFields(pageEntries)
					.setFooter({
						text: "(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church",
						iconURL: icon,
					});
				embeds.push(embed);
			}

			const [button1, button2] = [
				new MessageButton().setCustomId("previousbtn").setLabel("<").setStyle("PRIMARY"),
				new MessageButton().setCustomId("nextbtn").setLabel(">").setStyle("PRIMARY"),
			];

			paginationEmbed(interaction, embeds, [button1, button2], 1000 * 60 * 5);
		});
	},
};
