const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    devOnly: true,
    data: new SlashCommandBuilder()
        .setName('embed')
        .setDescription('[DEV] Send test embed')
        .addStringOption((option) =>
            option.setName('map').setDescription('Select a Map').setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('player').setDescription('Select a Player').setRequired(true)
        )
        .addStringOption((option) =>
            option.setName('mode').setDescription('Select a Mode').setRequired(true)
        ),
    async execute(interaction) {
        let output = interaction.options;

        let embed = new MessageEmbed()
            .setColor('#7480c2')
            .setTitle('Embed')
            .setDescription(
                `Map: ${output.getString('map')}\nPlayer: ${output.getString(
                    'player'
                )}\nMode: ${output.getString('mode')}`
            );
        interaction.reply({ embeds: [embed] });
    },
};
