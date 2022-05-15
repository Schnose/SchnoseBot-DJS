import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction as Interaction } from 'discord.js';
import { answer, errAPI, getMapsAPI } from '../../globalFunctions';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('random')
		.setDescription('Get a random KZ map. You can sort by tier if you want :)')
		.setDefaultPermission(true)
		.addIntegerOption((o) =>
			o
				.setName('tier')
				.setDescription('Filter for a specific tier.')
				.setRequired(false)
				.addChoices({ name: '1 (Very Easy)', value: 1 })
				.addChoices({ name: '2 (Easy)', value: 2 })
				.addChoices({ name: '3 (Medium)', value: 3 })
				.addChoices({ name: '4 (Hard)', value: 4 })
				.addChoices({ name: '5 (Very Hard)', value: 5 })
				.addChoices({ name: '6 (Extreme)', value: 6 })
				.addChoices({ name: '7 (Death)', value: 7 })
		),

	async execute(interaction: Interaction) {
		interaction.deferReply();

		const tier = interaction.options.getInteger('tier') || null;
		const globalMaps: any[] = await getMapsAPI(interaction);
		if (!globalMaps)
			return errAPI(interaction, {
				user: interaction.user.username,
				command: '/map',
				date: Date.now(),
				choice: interaction.options.getInteger('tier'),
			});
		const maps: any[] = [];

		if (tier) {
			globalMaps.forEach((x) => {
				if (x.difficulty === tier) maps.push(x);
			});

			const map = maps[Math.floor(Math.random() * maps.length)];
			return answer(interaction, { content: `🎲 \`${map.name} (T${map.difficulty})\`` });
		} else {
			const map = globalMaps[Math.floor(Math.random() * globalMaps.length)];
			return answer(interaction, { content: `🎲 \`${map.name} (T${map.difficulty})\`` });
		}
	},
};
