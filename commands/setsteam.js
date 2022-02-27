const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const userSchema = require('../schemas/user-schema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setsteam')
        .setDescription('Set your steamID.')
        .addStringOption((o) =>
            o.setName('steamid').setDescription('e.g. STEAM_1:1:161178172').setRequired(true)
        ),

    async execute(interaction) {
        let reply = '(͡ ͡° ͜ つ ͡͡°)';
        let output = interaction.options;
        let steamid = encodeURIComponent(output.getString('steamid'));
        console.log('New steamID added: ' + steamid);

        async function answer(input) {
            await interaction.reply(input);
        }

        try {
            const result = await axios.get(
                `https://kztimerglobal.com/api/v2.0/players/steamid/${steamid}`
            );
            if (!result.data[0]) {
                reply = 'That player has never played KZ before!';
                answer({ content: reply, ephemeral: true });
                return;
            }
            userSchema.findOne(async (err, data) => {
                if (err) {
                    console.log(err);
                    return;
                }

                if (!data) {
                    new userSchema({
                        List: {
                            [interaction.user.id]: {
                                userId: interaction.user.id,
                                steamId: steamid,
                                mode: 'all',
                            },
                        },
                    }).save();
                } else if (data.List[interaction.user.id]) {
                    data.List[interaction.user.id] = {
                        userId: interaction.user.id,
                        steamId: steamid,
                        mode: data.List[interaction.user.id].mode,
                    };

                    await userSchema.findOneAndUpdate(data);
                } else {
                    data.List[interaction.user.id] = {
                        userId: interaction.user.id,
                        steamId: steamid,
                        mode: 'all',
                    };
                    await userSchema.findOneAndUpdate(data);
                }
            });

            reply = `steamID \`${steamid}\` set for player: \`${result.data[0].name}\``;
            answer({ content: reply, ephemeral: true });
            return;
        } catch (error) {
            reply = 'Database error.';
            answer({ content: reply, ephemeral: true });
            console.log(error);
            return;
        }
    },
};
