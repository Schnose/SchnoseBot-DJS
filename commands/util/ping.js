const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Pong!')
        .setDefaultPermission(true),
    devOnly: false,

    async execute(interaction) {
        let reply = 'Pong!';

        answer({ content: reply });

        async function answer(input) {
            await interaction.reply(input);
        }
    },
};
