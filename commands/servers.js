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

        let guildList = [];

        interaction.client.guilds.fetch;
        interaction.client.guilds.cache.forEach((guild) => {
            guildList.push(guild);
        });

        let embed = new MessageEmbed()
            .setColor('#7480c2')
            .setDescription(`Servers:\n > ${guildList.join('\n> ')}`);

        reply = embed;
        answer({ embeds: [reply], ephemeral: true });

        async function answer(input) {
            await interaction.editReply(input);
        }
    },
};
