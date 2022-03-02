const { SlashCommandBuilder } = require('@discordjs/builders');
const axios = require('axios');
const userSchema = require('../../schemas/user-schema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setsteam')
        .setDescription('Set your steamID.')
        .setDefaultPermission(true)
        .addStringOption((o) =>
            o.setName('steamid').setDescription('e.g. STEAM_1:1:161178172').setRequired(true)
        ),
    devOnly: false,

    async execute(interaction) {
        let reply = '(͡ ͡° ͜ つ ͡͡°)';
        let output = interaction.options;
        let steamid = output.getString('steamid');
        console.log(steamid);

        async function answer(input) {
            await interaction.reply(input);
        }

        try {
            const result = await axios.get(
                `https://kztimerglobal.com/api/v1.0/players/steamid/${encodeURIComponent(steamid)}`
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
        } catch (error) {
            reply = 'Database error.';
            answer({ content: reply, ephemeral: true });
            console.log(error);
            reply = `Command: ${__filename}\nServer: ${interaction.guild.name} | ${interaction.guild.id}\nUser: ${interaction.user.tag} | ${interaction.user.id}\nChannel: ${interaction.channel.name} | ${interaction.channel.id}`;
            console.log(reply);
            return;
        }

        answer({ content: reply, ephemeral: true });
    },
};
