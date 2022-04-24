const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const userSchema = require("../database/user-schema");
const { icon } = require("../config.json");
const globalFunctions = require("../globalFunctions");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("recent")
		.setDescription("Get a player's most recent Personal Best")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName("target").setDescription("Select a Player.").setRequired(false)),

	async execute(interaction) {
		async function answer(input) {
			await interaction.reply(input);
		}

		userSchema.findOne(async (err, data) => {
			if (err) return console.error(err);

			let target = interaction.options.getString("target") || null;
			let steamID;

			/* Validate Target */

			// Target unspecified, targetting user
			if (target === null) target = interaction.user.id;
			// Target specified with @mention
			else if (target.startsWith("<@") && target.endsWith(">")) target = globalFunctions.getIDFromMention(target);
			// Target specified with Name or steamID
			else {
				// Try #1: steamID
				let result = globalFunctions.getSteamID(target);
				if (result === "bad") return answer({ content: "API Error. Please try again later." });

				// Try #2: Name
				if (!result) {
					result = globalFunctions.getName(target);
					if (result === "bad") return answer({ content: "API Error. Please try again later." });
				}

				// Player doesn't exist
				if (!result) return answer({ content: "That player has never played KZ before!" });
				steamID = result;
			}

			// No Target specified and also no DB entries
			if (!steamID) {
				if (!data.List[target])
					return answer({
						contenet: `You either have to specify a target or set your steamID using the following command:\n \`\`\`\n/setsteam\n\`\`\``,
					});
				steamID = data.List[target].steamId;
			}

			let [skzTP, skzPRO, kztTP, kztPRO, vnlTP, vnlPRO] = await Promise.all([
				globalFunctions.getDataRS(steamID, true, "kz_simple"),
				globalFunctions.getDataRS(steamID, false, "kz_simple"),
				globalFunctions.getDataRS(steamID, true, "kz_timer"),
				globalFunctions.getDataRS(steamID, false, "kz_timer"),
				globalFunctions.getDataRS(steamID, true, "kz_vanilla"),
				globalFunctions.getDataRS(steamID, false, "kz_vanilla"),
			]);

			let requests = [skzTP, skzPRO, kztTP, kztPRO, vnlTP, vnlPRO];

			if (requests.includes("bad")) return answer({ content: "API Error. Please try again later." });

			let createdOn = [];
			let recentMaps = [];
			requests.forEach((i) => {
				if (i[0])
					i.forEach((j) => {
						createdOn.push(Date.parse(j.created_on)); // Magic, I'm too smart for this world
						recentMaps.push(j);
					});
			});

			let recent = recentMaps[createdOn.indexOf(Math.max(...createdOn))]; // Magic, iBrahizy is too smart for me
			if (!recent) return answer({ content: "That player has no recent times." });

			let runtype;
			if (recent.teleports === 0) runtype = "PRO";
			else runtype = "TP";

			let recentPlace = await globalFunctions.getPlace(recent);
			let recentTime = globalFunctions.convertmin(recent.time);

			let mode;
			if (recent.mode === "kz_simple") mode = "SKZ";
			else if (recent.mode === "kz_timer") mode = "KZT";
			else mode = "VNL";

			const timestamp = Date.parse(recent.created_on) / 1000;

			let embed = new MessageEmbed()
				.setColor("#7480c2")
				.setTitle(`${recent.map_name} - Recent`)
				.setURL(`https://kzgo.eu/maps/${recent.map_name}`)
				.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${recent.map_name}.jpg`)
				.addFields({
					name: `${mode}`,
					value: `${runtype}: ${recentTime} ${recentPlace || ""}\n\n> <t:${timestamp}:R>`,
					inline: true,
				})
				.setFooter({
					text: `(͡ ͡° ͜ つ ͡͡°)7 | Player: ${recent.player_name} | schnose.eu/church`,
					iconURL: icon,
				});

			return answer({ embeds: [embed] });
		});
	},
};
