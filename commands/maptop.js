const { SlashCommandBuilder } = require("@discordjs/builders");
const globalFunctions = require("../globalFunctions");
const userSchema = require("../database/user-schema");
const { MessageEmbed, MessageButton } = require("discord.js");
const { icon } = require("../config.json");
const paginationEmbed = require("discordjs-button-pagination");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("maptop")
		.setDescription("Check a map's Top 100")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName("map").setDescription("Select a Map.").setRequired(true))
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
				.addChoice("ALL", "All 3 Modes")
		),

	async execute(interaction) {
		await interaction.deferReply();
		async function answer(input) {
			await interaction.editReply(input);
		}

		userSchema.findOne(async (err, data) => {
			if (err)
				return console.error(err), answer({ content: "Database Error. Please contact `AlphaKeks#9826` about this." });

			let map = interaction.options.getString("map").toLowerCase();
			let runtype = "true" === interaction.options.getString("runtype");
			let displayRuntype = "PRO";
			let displayMode = interaction.options.getString("mode") || null;
			let mode;

			/* Validate Map */
			map = await globalFunctions.validateMap(map);
			if (!map) return answer({ content: "Please enter a valid map." });

			/* Validate Mode */

			switch (displayMode) {
				// no Mode specified
				case null:
					if (!data.List[interaction.user.id])
						return answer({
							content: `You either have to specify a mode or set a default mode using the following command:\n \`\`\`\n/mode\n\`\`\`.`,
						});
					mode = data.List[interaction.user.id].mode;

					switch (mode) {
						case "kz_simple":
							displayMode = "SimpleKZ";
							break;

						case "kz_timer":
							displayMode = "KZTimer";
							break;

						case "kz_vanilla":
							displayMode = "Vanilla";
							break;

						default:
							return answer({
								content: `You either have to specify a mode or set a default mode using the following command:\n \`\`\`\n/mode\n\`\`\`.`,
							});
					}
					break;

				case "SimpleKZ":
					mode = "kz_simple";
					break;
				case "KZTimer":
					mode = "kz_timer";
					break;
				case "Vanilla":
					mode = "kz_vanilla";
			}

			/* Runtype */
			if (runtype) displayRuntype = "TP";

			/* Maptop */
			let Maptop = await globalFunctions.getMaptop(map.name, mode, 0, runtype);

			if (Maptop === undefined) return answer({ content: "API Error. Please try again later." });
			if (Maptop === null) return answer({ content: "This map seems to have 0 completions." });

			const Leaderboard = [];

			for (let i = 0; i < Maptop.length; i++) {
				Leaderboard.push({
					name: `[#${i + 1}] ${Maptop[i].player_name}`,
					value: `${globalFunctions.convertmin(Maptop[i].time)}`,
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
					.setTitle(`${map.name} - Maptop`)
					.setURL(`https://kzgo.eu/maps/${map.name}`)
					.setDescription(`Mode: ${displayMode} | Runtype: ${displayRuntype}`)
					.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map.name}.jpg`)
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
