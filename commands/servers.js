const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const userSchema = require('../schemas/user-schema');
require('dotenv').config();
require('../functions');

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('servers')
        .setDescription('[DEV] Display the servers that the bot is currently in.'),

    async execute(interaction) {
        await interaction.deferReply();
        let reply = '(͡ ͡° ͜ つ ͡͡°)';
        let penisJoe;
        let whichJoe = Math.random() < 0.5;
        if (whichJoe == true) penisJoe = process.env.JOE1;
        if (whichJoe == false) penisJoe = process.env.JOE2;

        let guildList = [];

        interaction.client.guilds.fetch;
        interaction.client.guilds.cache.forEach((guild) => {
            guildList.push(guild);
        });

        let embed = new MessageEmbed()
            .setColor('#7480c2')
            .setDescription(`Servers:\n > ${guildList.join('\n> ')}`)
            .setFooter({ text: '(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church', iconURL: penisJoe });

        reply = embed;
        answer({ embeds: [reply], ephemeral: true });

        async function answer(input) {
            await interaction.editReply(input);
        }
    },
};
