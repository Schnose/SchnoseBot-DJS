const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { JOE1, JOE2 } = require('../../variables.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('invite')
        .setDescription('Invite the bot!')
        .setDefaultPermission(true),
    devOnly: false,

    async execute(interaction) {
        let penisJoe;
        let whichJoe = Math.random() < 0.5;
        if (whichJoe == true) penisJoe = JOE1;
        if (whichJoe == false) penisJoe = JOE2;
        let reply = new MessageEmbed()
            .setColor('#7480c2')
            .setDescription('Invite the bot via this link: https://schnose.eu/schnosebot')
            .setFooter({ text: '(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church', iconURL: penisJoe });

        answer({ embeds: [reply], ephemeral: true });

        async function answer(input) {
            await interaction.reply(input);
        }
    },
};
