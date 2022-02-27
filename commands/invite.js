const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const userSchema = require('../schemas/user-schema');
require('dotenv').config();
require('../functions');

module.exports = {
    data: new SlashCommandBuilder().setName('invite').setDescription('Invite the bot!'),

    async execute(interaction) {
        let penisJoe;
        let whichJoe = Math.random() < 0.5;
        if (whichJoe == true) penisJoe = process.env.JOE1;
        if (whichJoe == false) penisJoe = process.env.JOE2;
        let reply = new MessageEmbed()
            .setColor('#7480c2')
            .setDescription('Invite the bot via this link: https://schnose.eu/schnosebot')
            .setFooter({ text: '(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church', iconURL: penisJoe });

        answer({ content: reply, ephemeral: true });

        async function answer(input) {
            await interaction.reply(input);
        }
    },
};
