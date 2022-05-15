import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction as Interaction } from 'discord.js';
import { answer, errDB, getPlayerAPI_steamID } from '../../globalFunctions';
import userSchema from '../../database/schemas/userSchema';

module.exports = {
	data: new SlashCommandBuilder()
		.setName('setsteam')
		.setDescription("Save your steamID in Schnose's database.")
		.setDefaultPermission(true)
		.addStringOption((o) => o.setName('steamid').setDescription('e.g. STEAM_1:1:161178172').setRequired(true)),

	async execute(interaction: Interaction) {
		let steamID = interaction.options.getString('steamid');
		const player: any = await getPlayerAPI_steamID(interaction, steamID!);
		if (!player.name) return answer(interaction, { content: 'No API Data found for that Player.', ephemeral: true });

		userSchema.findOne(async (err: any, data: any) => {
			if (err) return errDB(interaction, err);

			if (!data) {
				new userSchema({
					List: {
						[interaction.user.id]: {
							userId: interaction.user.id,
							steamId: steamID,
							mode: 'all',
						},
					},
				}).save();
			} else if (data.List[interaction.user.id]) {
				data.List[interaction.user.id] = {
					userId: interaction.user.id,
					steamId: steamID,
					mode: data.List[interaction.user.id].mode,
				};

				await userSchema.findOneAndUpdate(data);
			} else {
				data.List[interaction.user.id] = {
					userId: interaction.user.id,
					steamId: steamID,
					mode: 'all',
				};
				await userSchema.findOneAndUpdate(data);
			}
		});
		return answer(interaction, { content: `steamID \`${steamID}\` set for player: \`${player.name}\``, ephemeral: true });
	},
};
