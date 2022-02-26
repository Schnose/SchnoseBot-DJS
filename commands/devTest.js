const { SlashCommandBuilder } = require('@discordjs/builders');
require('../functions');

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('devtest')
        .setDescription('[DEV] Testing Slash Commands')
        .addStringOption((option) =>
            option.setName('input').setDescription('Input (͡ ͡° ͜ つ ͡͡°)').setRequired(true)
        ),

    async execute(interaction) {
        let output = interaction.options.getString('input');

        if (output.startsWith('<@!')) {
            output = retard.getIDFromMention(output);
        } else output = 'retard';

        interaction.reply({ content: `Input: ${output}` });
    },
};
