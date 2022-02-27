const { SlashCommandBuilder } = require('@discordjs/builders');
const { default: axios } = require('axios');
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

        let test = await Promise.all([
            axios
                .get(
                    `https://kztimerglobal.com/api/v2.0/records/top/?has_teleports=true&modes_list=kz_simple&steam_id=STEAM_1%3A1%3A152337044&tickrate=128&limit=9999&stage=0`
                )
                .then(function (response) {
                    h = response.data;
                    return h;
                }),
        ]);

        console.log(test);

        interaction.reply({ content: `Input: ${output}` });
    },
};
