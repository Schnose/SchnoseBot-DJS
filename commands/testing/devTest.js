const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('devtest')
        .setDescription('Testing Dev')
        .setDefaultPermission(false),
    devOnly: true,

    async execute(interaction) {
        let reply = 'It works!';

        answer({ content: reply });

        async function answer(input) {
            await interaction.reply(input);
        }
    },
};
