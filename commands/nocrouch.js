const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const userSchema = require('../schemas/user-schema');
require('dotenv').config();
require('../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nocrouch')
        .setDescription('Approximate a nocrouch jump.')
        .addNumberOption((o) =>
            o
                .setName('distance')
                .setDescription('The distance of your nocrouch jump')
                .setRequired(true)
        )
        .addNumberOption((o) =>
            o.setName('max').setDescription('The max speed of your nocrouch jump').setRequired(true)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        let reply = '(͡ ͡° ͜ つ ͡͡°)';
        let output = interaction.options;

        let approx = output.getNumber('distance') + (output.getNumber('max') / 128) * 4;
        reply = `Approximated distance: \`${approx.toFixed(4)}\``;

        answer({ content: reply });
        return;

        async function answer(input) {
            await interaction.editReply(input);
        }
    },
};
