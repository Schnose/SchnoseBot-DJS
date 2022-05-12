const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const userSchema = require('../database/user-schema');
const globalFunctions = require('../globalFunctions');
const { icon } = require('../config.json');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unfinished')
		.setDescription('Check which maps you still have to complete.')
		.setDefaultPermission(true)
		.addIntegerOption((o) =>
			o
				.setName('tier')
				.setDescription('Filter for a specific tier.')
				.setRequired(false)
				.addChoice('1 (Very Easy)', 1)
				.addChoice('2 (Easy)', 2)
				.addChoice('3 (Medium)', 3)
				.addChoice('4 (Hard)', 4)
				.addChoice('5 (Very Hard)', 5)
				.addChoice('6 (Extreme)', 6)
				.addChoice('7 (Death)', 7)
		)
		.addStringOption((o) =>
			o.setName('runtype').setDescription('TP/PRO').setRequired(false).addChoice('TP', 'true').addChoice('PRO', 'false')
		)
		.addStringOption((o) => o.setName('target').setDescription('Select a Player.').setRequired(false))
		.addStringOption((o) =>
			o
				.setName('mode')
				.setDescription('Select a Mode.')
				.setRequired(false)
				.addChoice('SKZ', 'SimpleKZ')
				.addChoice('KZT', 'KZTimer')
				.addChoice('VNL', 'Vanilla')
				.addChoice('ALL', 'All 3 Modes')
		),

	async execute(interaction) {
		await interaction.deferReply();
		async function answer(input) {
			await interaction.editReply(input);
		}

		userSchema.findOne(async (err, data) => {
			if (err) return console.error(err);

			let tier = interaction.options.getInteger('tier') || 0;
			let runtype = 'true' === interaction.options.getString('runtype');
			let displayRuntype = 'PRO';
			let target = interaction.options.getString('target') || null;
			let displayMode = interaction.options.getString('mode') || null;
			let mode, modeID, steamID;

			/* Validate Target */

			if (!target) target = interaction.user.id;
			else steamID = await globalFunctions.validateTarget(target).steam_id;

			// No Target specified and also no DB entries
			if (!isNaN(steamID)) {
				if (!data.List[target])
					return answer({
						content: `You either have to specify a target or set your steamID using the following command:\n \`\`\`\n/setsteam\n\`\`\``,
					});
				steamID = data.List[target].steamId;
			} else {
				return answer({
					content: `You either have to specify a target or set your steamID using the following command:\n \`\`\`\n/setsteam\n\`\`\``,
				});
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
						case 'kz_simple':
							displayMode = 'SimpleKZ';
							modeID = 201;
							break;

						case 'kz_timer':
							displayMode = 'KZTimer';
							modeID = 200;
							break;

						case 'kz_vanilla':
							displayMode = 'Vanilla';
							modeID = 202;
							break;

						case 'all':
							return answer({ content: 'Please specify a mode.' });
					}
					break;

				// Mode specified
				case 'SimpleKZ':
					mode = 'kz_simple';
					modeID = 201;
					break;

				case 'KZTimer':
					mode = 'kz_timer';
					modeID = 200;
					break;

				case 'Vanilla':
					mode = 'kz_vanilla';
					modeID = 202;
					break;

				// Mode unspecified
				case 'All 3 Modes':
					return answer({ content: 'Please specify a mode.' });
			}

			/* Validate Runtype */
			if (runtype) displayRuntype = 'TP';

			/* Maplist */
			let [allCompleted, allMaps, doable] = await Promise.all([
				globalFunctions.getTimes(steamID, mode, runtype),
				globalFunctions.getMapsAPI(),
				globalFunctions.getFilterDistAPI(runtype, modeID),
			]);

			if ([allCompleted, allMaps, doable].includes(undefined))
				return answer({ content: 'API Error. Please try again later.' });
			const mapTiers = new Map();
			let unfinishedMaps = [];
			allMaps.forEach((i) => {
				mapTiers.set(i.name, i.difficulty);
				if (doable.includes(i.id)) {
					if (!i.name.includes('kzpro_') || runtype == false) {
						if (i.difficulty == tier || tier == 0) {
							// snyergy broooo
							if (!(mode == 'kz_simple' && i.name == 'kz_synergy_x')) unfinishedMaps.push(i.name);
						}
					}
				}
			});

			// vnl players ResidentSleeper (THANK YOU KZGO)
			if (mode == 'kz_vanilla') {
				unfinishedMaps = [];
				await axios
					.get('https://kzgo.eu/api/maps/completion/kz_vanilla')
					.then((response) => {
						let data = response.data;
						data.forEach((i) => {
							if (i.vp == true) {
								if (!i.name.includes('kzpro_') || runtype == false)
									if (i.tier == tier || tier == 0) unfinishedMaps.push(i.name);
							}
						});
					})
					.catch((e) => {
						console.error(e);
						return answer({ content: 'API Error! Please try again later.' });
					});
			}
			let finishedMaps = [];

			allCompleted.forEach((i) => {
				if (mapTiers.get(i.map_name) && !finishedMaps.includes(i.map_name)) {
					finishedMaps.push(i.map_name);
					const index = unfinishedMaps.indexOf(i.map_name);
					if (-1 != index) {
						unfinishedMaps.splice(index, 1);
					}
				}
			});

			let playerName;
			if (!allCompleted[0]) playerName = '?';
			else playerName = allCompleted[0].player_name;

			if (unfinishedMaps.length == 0) return answer({ content: "You don't have any maps left to complete! Good job!" });

			let text = '';

			for (i = 0; i < unfinishedMaps.length; i++) {
				if (i == 10) {
					text += `...${unfinishedMaps.length - 10} more`;
					break;
				}
				text += `> ${unfinishedMaps[i]}\n`;
			}
			if (tier == 0) {
				tier = '[All Tiers]';
			} else {
				tier = `[T${tier}]`;
			}

			let embed = new MessageEmbed()
				.setColor('#7480c2')
				.setTitle(`Uncompleted Maps - ${displayMode} ${displayRuntype} ${tier}`)
				.setDescription(text)
				.setFooter({
					text: `(͡ ͡° ͜ つ ͡͡°)7 | Player: ${playerName} | schnose.eu/church`,
					iconURL: icon,
				});
			return answer({ embeds: [embed] });
		});
	},
};
