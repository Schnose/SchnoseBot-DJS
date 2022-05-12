const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const userSchema = require('../database/user-schema');
const { icon } = require('../config.json');
const globalFunctions = require('../globalFunctions');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('recent')
		.setDescription("Get a player's most recent Personal Best")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName('target').setDescription('Select a Player.').setRequired(false)),

	async execute(interaction) {
		interaction.deferReply();
		async function answer(input) {
			await interaction.editReply(input);
		}

		userSchema.findOne(async (err, data) => {
			if (err) return console.error(err);

			let target = interaction.options.getString('target') || null;
			let steamID, runtype, mode;

			/* Validate Target */

			if (!target) target = interaction.user.id;
			else steamID = (await globalFunctions.validateTarget(target)).steam_id;

			// No Target specified and also no DB entries
			if (!isNaN(steamID)) {
				if (!data.List[target])
					return answer({
						content: `You either have to specify a target or set your steamID using the following command:\n \`\`\`\n/setsteam\n\`\`\``,
					});
				steamID = data.List[target].steamId;
			}

			let [skzTP, skzPRO, kztTP, kztPRO, vnlTP, vnlPRO] = await Promise.all([
				globalFunctions.getRecent(steamID, 'kz_simple', true),
				globalFunctions.getRecent(steamID, 'kz_simple', false),
				globalFunctions.getRecent(steamID, 'kz_timer', true),
				globalFunctions.getRecent(steamID, 'kz_timer', false),
				globalFunctions.getRecent(steamID, 'kz_vanilla', true),
				globalFunctions.getRecent(steamID, 'kz_vanilla', false),
			]);
			let requests = [skzTP, skzPRO, kztTP, kztPRO, vnlTP, vnlPRO];

			if (requests === undefined) return answer({ content: 'API Error. Please try again later.' });
			if (requests === null) return answer({ content: 'That player has no recent times.' });

			let createdOn = [];
			requests.forEach((r) => createdOn.push(Date.parse(r.created_on)));
			let recent = requests[createdOn.indexOf(Math.max(...createdOn))];

			if (recent.teleports === 0) runtype = 'PRO';
			else runtype = 'TP';

			let recentPlace = await globalFunctions.getPlace(recent);
			if (!recentPlace) recentPlace = '';
			let recentTime = globalFunctions.convertmin(recent.time);

			if (recent.mode === 'kz_simple') mode = 'SKZ';
			else if (recent.mode === 'kz_timer') mode = 'KZT';
			else mode = 'VNL';

			const timestamp = Date.parse(recent.created_on) / 1000;

			let embed = new MessageEmbed()
				.setColor('#7480c2')
				.setTitle(`${recent.map_name} - Recent`)
				.setURL(`https://kzgo.eu/maps/${recent.map_name}`)
				.setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${recent.map_name}.jpg`)
				.addFields({
					name: `${mode}`,
					value: `${runtype}: ${recentTime} ${recentPlace || ''}\n\n> <t:${timestamp}:R>`,
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
