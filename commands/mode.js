const { SlashCommandBuilder } = require('@discordjs/builders');
const userSchema = require('../schemas/user-schema');
require('dotenv').config();

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mode')
        .setDescription('Set your preferred mode.')
        .addStringOption((o) =>
            o
                .setName('mode')
                .setDescription('Select a Mode.')
                .setRequired(false)
                .addChoice('SKZ', 'skz')
                .addChoice('KZT', 'kzt')
                .addChoice('VNL', 'vnl')
                .addChoice('ALL', 'all')
        ),

    async execute(interaction) {
        let output = interaction.options;
        let reply = '(͡ ͡° ͜ つ ͡͡°)';
        let penisJoe;
        let whichJoe = Math.random() < 0.5;
        if (whichJoe == true) penisJoe = process.env.JOE1;
        if (whichJoe == false) penisJoe = process.env.JOE2;
        let mode = output.getString('mode');

        userSchema.findOne(async (err, data) => {
            if (err) {
                console.log(err);
                return;
            }
            try {
                if (data) {
                    if (!data.List[interaction.user.id]) {
                        reply = `You need to set a steamID first! Use the following command:\n \`\`\`\n/setsteam <steamId>\n\`\`\``;
                        answer({ content: reply });
                        return;
                    }
                    if (mode == null && data.List[interaction.user.id].mode) {
                        let penisMode;
                        if (data.List[interaction.user.id].mode == 'kz_simple') penisMode = 'SKZ';
                        if (data.List[interaction.user.id].mode == 'kz_timer') penisMode = 'KZT';
                        if (data.List[interaction.user.id].mode == 'kz_vanilla') penisMode = 'VNL';
                        if (data.List[interaction.user.id].mode == 'all') penisMode = 'None';

                        reply = `Your current mode preference is set to: \`${penisMode}\``;
                        answer({ content: reply, ephemeral: true });
                        return;
                    }
                    let mode1;
                    if (mode == 'skz') {
                        mode1 = 'kz_simple';
                        penisMode = 'SKZ';
                    } else if (mode == 'kzt') {
                        mode1 = 'kz_timer';
                        penisMode = 'KZT';
                    } else if (mode == 'vnl') {
                        mode1 = 'kz_vanilla';
                        penisMode = 'VNL';
                    } else if (mode == 'all') {
                        mode1 = 'all';
                        penisMode = 'None';
                    } else {
                        reply = 'Please specify a valid mode. `<kzt> <skz> <vnl> <all>`';
                        answer({ content: reply, ephemeral: true });
                        return;
                    }

                    data.List[interaction.user.id] = {
                        userId: interaction.user.id,
                        steamId: data.List[interaction.user.id].steamId,
                        mode: mode1,
                    };

                    await userSchema.findOneAndUpdate(data);

                    reply = `Preferred mode set to: \`${penisMode}\``;
                    answer({ content: reply, ephemeral: true });
                    return;
                } else {
                    reply = `You need to set a steamID first! Use the following command:\n \`\`\`\n/setsteam <steamId>\n\`\`\``;
                    answer({ content: reply });
                    return;
                }
            } catch (error) {
                reply = 'Database error.';
                answer({ content: reply, ephemeral: true });
                console.log(error);
            }
        });
        async function answer(input) {
            await interaction.reply(input);
        }
    },
};
