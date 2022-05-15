import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction as Interaction } from 'discord.js';
import { answer, errDB } from '../../globalFunctions';
import userSchema from '../../database/schemas/userSchema';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mode')
		.setDescription("Save your preferred gamemode in Schnose's database.")
		.setDefaultPermission(true)
		.addStringOption((o) =>
			o
				.setName('mode')
				.setDescription('Select a Mode.')
				.setRequired(false)
				.addChoices({ name: 'KZT', value: 'kz_timer' })
				.addChoices({ name: 'SKZ', value: 'kz_simple' })
				.addChoices({ name: 'VNL', value: 'kz_vanilla' })
				.addChoices({ name: 'ALL', value: 'all' })
		),

	async execute(interaction: Interaction) {
		let mode = interaction.options.getString('mode') || null;
		let displayMode: string;

		userSchema.findOne(async (err: any, data: any) => {
			if (err || !data) errDB(interaction, err);

			if (!data.List[interaction.user.id].steamId)
				return answer(interaction, { content: 'You either need to specify a steamID or set a default with `/setsteam`' });

			// Checking current mode entry
			if (mode === null && !data.List[interaction.user.id].mode) {
				return answer(interaction, { content: "You don't have a mode preference yet. Set one by using `/mode`" });
			} else if (mode === null && data.List[interaction.user.id].mode) {
				switch (data.List[interaction.user.id].mode) {
					case 'all':
						displayMode = 'None';
						break;

					case 'kz_simple':
						displayMode = 'SimpleKZ';
						break;

					case 'kz_timer':
						displayMode = 'KZTimer';
						break;

					case 'kz_vanilla':
						displayMode = 'Vanilla';
				}

				return answer(interaction, { content: `Your current mode preference is set to: \`${displayMode}\`` });
			}

			// Setting new mode preference
			else
				switch (mode) {
					case 'all':
						displayMode = 'None';
						break;

					case 'kz_simple':
						displayMode = 'SimpleKZ';
						break;

					case 'kz_timer':
						displayMode = 'KZT';
						break;

					case 'kz_vanilla':
						displayMode = 'VNL';
				}

			data.List[interaction.user.id] = {
				userId: interaction.user.id,
				steamId: data.List[interaction.user.id].steamId,
				mode: mode,
			};

			await userSchema.findOneAndUpdate(data);

			return answer(interaction, { content: `Mode preference set to: \`${displayMode}\`` });
		});
	},
};
