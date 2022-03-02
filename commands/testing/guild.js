const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guild')
        .setDescription('test')
        .setDefaultPermission(false),
    devOnly: true,

    async execute(interaction) {
        try {
            let reply = new MessageEmbed()
                .setColor('#7480c2')
                .setTitle(`${interaction.guild.name}`)
                .setDescription(
                    `ID: ${interaction.penis.id}\nUser: ${interaction.user.tag}\nChannel: ${interaction.channel.name}`
                );

            answer({ embeds: [reply] });
        } catch (err) {
            console.log(err);
            reply = `Command: ${__filename}\nServer: ${interaction.guild.name} | ${interaction.guild.id}\nUser: ${interaction.user.tag} | ${interaction.user.id}\nChannel: ${interaction.channel.name} | ${interaction.channel.id}`;
            console.log(reply);
            return;
        }

        async function answer(input) {
            await interaction.reply(input);
        }
    },
};
