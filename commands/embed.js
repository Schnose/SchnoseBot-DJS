const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
require('dotenv').config();

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder().setName('embed').setDescription('[DEV] Send test embed'),
    async execute(interaction) {
        let output = interaction.options;
        let penisJoe;
        let whichJoe = Math.random() < 0.5;
        if (whichJoe == true) penisJoe = process.env.JOE1;
        if (whichJoe == false) penisJoe = process.env.JOE2;

        let embed = new MessageEmbed()
            .setColor('#7480c2')
            .setTitle('kz_lionharder')
            .setThumbnail(
                `https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/kz_lionharder.jpg`
            )
            .setURL('https://steamcommunity.com/sharedfiles/filedetails/?id=2420807980')
            .setDescription(
                `> Tier: 7\n> Mapper: [iBUYFL0WER Birgit](https://steamcommunity.com/profiles/76561198078014747)\n> Bonuses: 2\n> Globalled: \`2021-06-05T15:52:16\`\n`
            )
            .addFields(
                {
                    name: 'SimpleKZ',
                    value: `✅`,
                    inline: true,
                },
                {
                    name: 'KZTimer',
                    value: `✅`,
                    inline: true,
                },
                {
                    name: 'Vanilla',
                    value: `❌`,
                    inline: true,
                }
            )
            .setFooter({
                text: '(͡ ͡° ͜ つ ͡͡°)7 | workshopID: 2420807980 | schnose.eu/church',
                iconURL: penisJoe,
            });
        interaction.reply({ embeds: [embed] });
    },
};
