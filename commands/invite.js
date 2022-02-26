const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const userSchema = require('../schemas/user-schema');
require('dotenv').config();
require('../functions');

module.exports = {
    data: new SlashCommandBuilder().setName('invite').setDescription('Invite the bot!'),

    async execute(interaction) {
        let reply = 'Invite the bot via this link: https://schnose.eu/schnosebot';
        answer({ content: reply, ephemeral: true });

        async function answer(input) {
            await interaction.reply(input);
        }
    },
};
