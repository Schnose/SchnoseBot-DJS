const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const userSchema = require("../database/user-schema");
const globalFunctions = require("../globalFunctions");
const axios = require("axios");
const { icon } = require("../config.json");

module.exports = {
	data: new SlashCommandBuilder()
		.setName("profile")
		.setDescription("Check a player profile.")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName("target").setDescription("Select a Player.").setRequired(false))
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
		async function answer(input) {
			await interaction.reply(input);
		}

		userSchema.findOne(async (err, data) => {
			if (err) return console.error(err);

			let target = interaction.options.getString("target") || null;
			let steamID;
			let displayMode = interaction.options.getString("mode") || null;
			let mode;
			let preferenceMode;

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

			/* Validate Mode */
			switch (displayMode) {
				// no Mode specified
				case null:
					// no Mode in DB
					if (!data.List[target])
						return answer({
							content: `You either have to specify a mode or set a default mode using the following command:\n \`\`\`\n/mode\n\`\`\``,
						});
					mode = data.List[target].mode;
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

						case "all":
							return answer({
								content: `You either have to specify a mode or set a default mode using the following command:\n \`\`\`\n/mode\n\`\`\``,
							});
					}
					break;

				// Mode specified
				case "SimpleKZ":
					mode = "kz_simple";
					break;

				case "KZTimer":
					mode = "kz_timer";
					break;

				case "Vanilla":
					mode = "kz_vanilla";
					break;
			}

			// Check for mode preference
			if (data.List[target]) {
				if (data.List[target].mode) {
					preferenceMode = data.List[target].mode;
					switch (preferenceMode) {
						case "kz_simple":
							preferenceMode = "SKZ";
							break;

						case "kz_timer":
							preferenceMode = "KZT";
							break;

						case "kz_vanilla":
							preferenceMode = "VNL";
							break;

						case "all":
							preferenceMode = "None";
					}
				} else preferenceMode = "None";
			}

			/* Profile Magic */
			let [allTP, allPRO, allMaps, doableTP, doablePRO, player] = await Promise.all([
				globalFunctions.getTimes(steamID, true, mode),
				globalFunctions.getTimes(steamID, false, mode),
				globalFunctions.getMapsAPI(),
				globalFunctions.getDoableMaps(true, mode),
				globalFunctions.getDoableMaps(false, mode),
				globalFunctions.getPlayer(steamID),
			]);

			if ([allTP, allPRO, allMaps, doableTP, doablePRO].includes("bad"))
				return answer({ content: "API Error. Please try again later." });

			// TODO: clean this shit up holy fuck man so much repetition REEEEEE
			const mapTiers = new Map();
			let mapsTP = [0, 0, 0, 0, 0, 0, 0, 0];
			let strmapsTP = [0, 0, 0, 0, 0, 0, 0, 0];
			let mapsPRO = [0, 0, 0, 0, 0, 0, 0, 0];
			let strmapsPRO = [0, 0, 0, 0, 0, 0, 0, 0];

			allMaps.forEach((i) => {
				mapTiers.set(i.name, i.difficulty);
				if (doableTP.includes(i.id) && !i.name.includes("kzpro_")) {
					mapsTP[0]++;
					mapsTP[i.difficulty]++;
				}
				if (doablePRO.includes(i.id)) {
					mapsPRO[0]++;
					mapsPRO[i.difficulty]++;
				}
			});

			let TPcompletion = [0, 0, 0, 0, 0, 0, 0, 0];
			let strTpcompletion = [];
			let PROcompletion = [0, 0, 0, 0, 0, 0, 0, 0];
			let strPROcompletion = [];
			let perccompletionTP = [0, 0, 0, 0, 0, 0, 0, 0];
			let perccompletionPRO = [0, 0, 0, 0, 0, 0, 0, 0];
			let strperccompletionTP = [];
			let strperccompletionPRO = [];

			let overallTP = 0;
			let stroverallTP = "";
			let overallPRO = 0;
			let stroverallPRO = "";
			let averageTP = 0;
			let straverageTP = "";
			let averagePRO = 0;
			let straveragePRO = "";
			let averageTPx = 0;
			let averagePROx = 0;
			let TPWRs = 0;
			let strTPWRs = "";
			let PROWRs = 0;
			let strPROWRs = "";

			let mapsdone = [];

			allTP.forEach((i) => {
				if (mapTiers.get(i.map_name) && !mapsdone.includes(i.map_name)) {
					mapsdone.push(i.map_name);
					//average + overall
					overallTP += i.points;
					averageTPx++;
					//
					//completion + tier completion
					TPcompletion[0]++;
					TPcompletion[mapTiers.get(i.map_name)]++;
					//
					//wrs
					if (i.points == 1000) {
						TPWRs++;
					}
					//
				}
			});
			allPRO.forEach((i) => {
				if (mapTiers.get(i.map_name)) {
					//average + overall
					overallPRO += i.points;
					averagePROx++;
					//
					//completion + tier completion
					PROcompletion[0]++;
					PROcompletion[mapTiers.get(i.map_name)]++;
					//
					//wrs
					if (i.points == 1000) {
						PROWRs++;
					}
				}
				//
			});
			strTPWRs = TPWRs.toString();
			let line1gap = "";
			for (let x = 0; x < 3 - strTPWRs.length; x++) {
				line1gap += "⠀";
			}
			strPROWRs = PROWRs.toString();
			averageTP = (overallTP / averageTPx).toFixed(2);
			averagePRO = (overallPRO / averagePROx).toFixed(2);
			straverageTP = averageTP.toString();
			let line12gap = "";
			for (let x = 0; x < 6 - straverageTP.length; x++) {
				line12gap += "⠀";
			}
			straveragePRO = averagePRO.toString();
			stroverallTP = overallTP.toString();
			stroverallTP = globalFunctions.numberWithCommas(stroverallTP);
			for (let x = 0; x < 9 - stroverallTP.length; x++) {
				line12gap += "⠀";
			}
			stroverallPRO = overallPRO.toString();
			stroverallPRO = globalFunctions.numberWithCommas(stroverallPRO);

			let overalloverallPoints = (overallTP + overallPRO).toString();
			overalloverallPoints = globalFunctions.numberWithCommas(overalloverallPoints);

			if (mode == "kz_simple") {
				mapsTP[0]--;
				mapsPRO[0]--;
				mapsTP[5]--; //synergy_x has a filter
				mapsPRO[5]--;
			}
			if (mode == "kz_vanilla") {
				//using kzgo api to fix scuffed vnl
				mapsTP = [0, 0, 0, 0, 0, 0, 0, 0];
				//const response = await axios.get("https://kzgo.eu/api/maps/completion/kz_vanilla");
				//console.log(response);
				await axios
					.get("https://kzgo.eu/api/maps/completion/kz_vanilla")
					.then(function (response) {
						let cock = response.data;
						mapsTP[0] = cock.total;
						for (let i = 1; i < 8; i++) {
							mapsTP[i] = cock[i];
						}
						mapsPRO = mapsTP;
						mapsPRO[3]--;
					})
					.catch((err) => {
						console.log(err);
						return answer({ content: "API error! Please try again later" });
					});
			}
			TPcompletion.forEach((x) => {
				strTpcompletion.push(x.toString().padStart(3, " "));
			});
			PROcompletion.forEach((x) => {
				strPROcompletion.push(x.toString().padStart(3, " "));
			});
			mapsTP.forEach((x) => {
				strmapsTP.push(x.toString().padStart(3, " "));
			});
			mapsPRO.forEach((x) => {
				strmapsPRO.push(x.toString().padStart(3, " "));
			});
			let gapline3 = "";
			if (perccompletionTP[0] < 10) {
				gapline3 = "⠀⠀";
			} else if (perccompletionTP[0] < 100) {
				gapline3 = "⠀";
			}
			for (let x = 0; x < mapsTP.length; x++) {
				if (mapsTP[x] != 0) perccompletionTP[x] = ((TPcompletion[x] / mapsTP[x]) * 100).toFixed(0);
				else perccompletionTP[x] = 0;
				if (mapsPRO[x] != 0) perccompletionPRO[x] = ((PROcompletion[x] / mapsPRO[x]) * 100).toFixed(0);
				else perccompletionPRO[x] = 0;
			}
			for (let x = 0; x < perccompletionTP.length; x++) {
				strperccompletionTP.push(perccompletionTP[x].toString().padStart(3, " ") + "%");
				strperccompletionPRO.push(perccompletionPRO[x].toString().padStart(3, " ") + "%");
			}

			let barsTP = [];
			let barsPRO = [];

			perccompletionTP.forEach((i) => {
				let x = Math.floor(i / 10);
				let bar = "";
				for (let y = 0; y < x; y++) {
					bar += "█";
				}
				for (let y = 0; y < 10 - x; y++) {
					bar += "░";
				}
				barsTP.push(bar);
			});
			perccompletionPRO.forEach((i) => {
				let x = Math.floor(i / 10);
				let bar = "";
				for (let y = 0; y < x; y++) {
					bar += "█";
				}
				for (let y = 0; y < 10 - x; y++) {
					bar += "░";
				}
				barsPRO.push(bar);
			});
			for (let i = 1; i < mapsTP.length; i++) {
				if (mapsTP[i] == 0) {
					barsTP[i] = "          No maps          ";
					strperccompletionTP[i] = "100%";
				}
				if (mapsPRO[i] == 0) {
					barsPRO[i] = "          No maps          ";
					strperccompletionPRO[i] = "100%";
				}
			}

			let embed = new MessageEmbed()
				.setColor("#7480c2")
				.setTitle(`${displayMode} Profile - ${player.name}`)
				.setURL(`https://steamcommunity.com/profiles/${player.steamid64}`)
				.setDescription(
					`\`>> TP | 🏆 WRS: ${strTPWRs}\`⠀⠀⠀⠀⠀⠀⠀${line1gap}⠀⠀ ⠀⠀⠀\`>> PRO | 🏆 WRS: ${strPROWRs}\`
                    ─────────────────────────────────────────────────
                    \`Total Completion: ${TPcompletion[0]}/${mapsTP[0]} (${
						perccompletionTP[0] + "%"
					})\`⠀⠀${gapline3}      \`Total Completion: ${PROcompletion[0]}/${mapsPRO[0]} (${perccompletionPRO[0] + "%"})\`
                    
                    \`Tier 1:\` ⌠ ${barsTP[1]} ⌡ - \`${strperccompletionTP[1]}\`⠀⠀⠀⠀\`Tier 1:\` ⌠ ${barsPRO[1]} ⌡ - \`${
						strperccompletionPRO[1]
					}\`
                    \`Tier 2:\` ⌠ ${barsTP[2]} ⌡ - \`${strperccompletionTP[2]}\`⠀⠀⠀⠀\`Tier 2:\` ⌠ ${barsPRO[2]} ⌡ - \`${
						strperccompletionPRO[2]
					}\`
                    \`Tier 3:\` ⌠ ${barsTP[3]} ⌡ - \`${strperccompletionTP[3]}\`⠀⠀⠀⠀\`Tier 3:\` ⌠ ${barsPRO[3]} ⌡ - \`${
						strperccompletionPRO[3]
					}\`
                    \`Tier 4:\` ⌠ ${barsTP[4]} ⌡ - \`${strperccompletionTP[4]}\`⠀⠀⠀⠀\`Tier 4:\` ⌠ ${barsPRO[4]} ⌡ - \`${
						strperccompletionPRO[4]
					}\`
                    \`Tier 5:\` ⌠ ${barsTP[5]} ⌡ - \`${strperccompletionTP[5]}\`⠀⠀⠀⠀\`Tier 5:\` ⌠ ${barsPRO[5]} ⌡ - \`${
						strperccompletionPRO[5]
					}\`
                    \`Tier 6:\` ⌠ ${barsTP[6]} ⌡ - \`${strperccompletionTP[6]}\`⠀⠀⠀⠀\`Tier 6:\` ⌠ ${barsPRO[6]} ⌡ - \`${
						strperccompletionPRO[6]
					}\`
                    \`Tier 7:\` ⌠ ${barsTP[7]} ⌡ - \`${strperccompletionTP[7]}\`⠀⠀⠀⠀\`Tier 7:\` ⌠ ${barsPRO[7]} ⌡ - \`${
						strperccompletionPRO[7]
					}\`
                    ─────────────────────────────────────────────────
                    \`Points: ${stroverallTP} / ${straverageTP}\`⠀⠀⠀⠀⠀${line12gap} ⠀ ⠀ \`Points: ${stroverallPRO} / ${straveragePRO}\`
                    `
				)
				.addFields(
					{
						name: `Overall Points`,
						value: `${overalloverallPoints}`,
						inline: true,
					},
					{
						name: `steamID`,
						value: `${steamID}`,
						inline: true,
					},
					{
						name: `Mode Preference`,
						value: `${preferenceMode}`,
						inline: true,
					}
				)
				.setFooter({
					text: "(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church",
					iconURL: icon,
				});

			return answer({ embeds: [embed] });
		});
	},
};
