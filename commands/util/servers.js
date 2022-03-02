const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { botOwner, JOE1, JOE2 } = require('../../variables.json');

const devs = [botOwner, '295966419261063168'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('servers')
        .setDescription('Display the servers that the bot is currently in.')
        .setDefaultPermission(true),
    devOnly: false,

    async execute(interaction) {
        let reply = '(͡ ͡° ͜ つ ͡͡°)';
        let penisJoe;
        let whichJoe = Math.random() < 0.5;
        if (whichJoe == true) penisJoe = JOE1;
        if (whichJoe == false) penisJoe = JOE2;

        let guildList = [];

        interaction.client.guilds.fetch;
        interaction.client.guilds.cache.forEach((guild) => {
            guildList.push(guild);
        });

        let embed = new MessageEmbed()
            .setColor('#7480c2')
            .setDescription(`Servers:\n > ${guildList.join('\n> ')}`)
            .setFooter({ text: '(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church', iconURL: penisJoe });

        if (devs.includes(interaction.user.id)) {
            reply = embed;
        } else reply = "You don't have access to this command.";

        answer({ embeds: [reply], ephemeral: true });

        async function answer(input) {
            await interaction.reply(input);
        }
    },
};
