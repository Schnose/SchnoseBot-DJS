const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const userSchema = require('../../schemas/user-schema');
const { JOE1, JOE2 } = require('../../variables.json');
require('../../globalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('btop')
        .setDescription('Top BWRs')
        .setDefaultPermission(true)
        .addStringOption((o) =>
            o
                .setName('runtype')
                .setDescription('TP/PRO')
                .setRequired(false)
                .addChoice('TP', 'true')
                .addChoice('PRO', 'false')
        )
        .addStringOption((o) =>
            o
                .setName('mode')
                .setDescription('Select a Mode.')
                .setRequired(false)
                .addChoice('SKZ', 'SimpleKZ')
                .addChoice('KZT', 'KZTimer')
                .addChoice('VNL', 'Vanilla')
        ),
    devOnly: false,

    async execute(interaction) {
        await interaction.deferReply();
        let reply = '(͡ ͡° ͜ つ ͡͡°)';
        let penisJoe;
        let whichJoe = Math.random() < 0.5;
        if (whichJoe == true) penisJoe = JOE1;
        if (whichJoe == false) penisJoe = JOE2;

        try {
            userSchema.findOne(async (err, data) => {
                if (err) return console.log(err);
                let output = interaction.options;
                let penisRuntype = output.getString('runtype' || null);
                let runtype;
                let penisMode = output.getString('mode' || null);
                let mode;

                if (penisMode == null) {
                    if (data.List[interaction.user.id].mode) {
                        mode = data.List[interaction.user.id].mode;
                        if (mode == 'kz_timer') penisMode = 'KZT';
                        else if (mode == 'kz_simple') penisMode = 'SKZ';
                        else if (mode == 'kz_vanilla') penisMode = 'VNL';
                    } else {
                        reply = `You either have to specify a mode or set a default mode using the following command:\n \`\`\`\n/mode\n\`\`\``;
                        answer({ content: reply });
                        return;
                    }
                } else {
                    if (penisMode === 'SimpleKZ') mode = 'kz_simple';
                    else if (penisMode === 'KZTimer') mode = 'kz_timer';
                    else if (penisMode === 'Vanilla') mode = 'kz_vanilla';
                }

                if (penisRuntype == 'true') {
                    penisRuntype = 'TP';
                    runtype = true;
                } else if (penisRuntype == 'false') {
                    penisRuntype = 'PRO';
                    runtype = false;
                } else {
                    penisRuntype = 'PRO';
                    runtype = false;
                }

                const leaderboard = await globalFunctions.getTopPlayers(
                    mode,
                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
                    runtype
                );

                if (leaderboard == 'bad') {
                    reply = 'API Error! Please try again later.';
                    answer({ content: reply });
                    return;
                }

                let embed = new MessageEmbed()
                    .setColor('#7480c2')
                    .setTitle(`Top WRs`)
                    .setDescription(`Mode: ${penisMode} | Runtype: ${penisRuntype}`)
                    .addFields({
                        name: `[#1]  ${leaderboard[0].player_name}`,
                        value: `${leaderboard[0].count}\n\u200B`,
                    })
                    .addFields(
                        {
                            name: `[#2] ${leaderboard[1].player_name || 'none'}`,
                            value: `${leaderboard[1].count || '--:--'}`,
                            inline: true,
                        },
                        {
                            name: `[#3] ${leaderboard[2].player_name || 'none'}`,
                            value: `${leaderboard[2].count || '--:--'}`,
                            inline: true,
                        },
                        {
                            name: `[#4] ${leaderboard[3].player_name || 'none'}`,
                            value: `${leaderboard[3].count || '--:--'}`,
                            inline: true,
                        },
                        {
                            name: `[#5] ${leaderboard[4].player_name || 'none'}`,
                            value: `${leaderboard[4].count || '--:--'}`,
                            inline: true,
                        },
                        {
                            name: `[#6] ${leaderboard[5].player_name || 'none'}`,
                            value: `${leaderboard[5].count || '--:--'}`,
                            inline: true,
                        },
                        {
                            name: `[#7] ${leaderboard[6].player_name || 'none'}`,
                            value: `${leaderboard[6].count || '--:--'}`,
                            inline: true,
                        },
                        {
                            name: `[#8] ${leaderboard[7].player_name || 'none'}`,
                            value: `${leaderboard[7].count || '--:--'}`,
                            inline: true,
                        },
                        {
                            name: `[#9] ${leaderboard[8].player_name || 'none'}`,
                            value: `${leaderboard[8].count || '--:--'}`,
                            inline: true,
                        },
                        {
                            name: `[#10] ${leaderboard[9].player_name || 'none'}`,
                            value: `${leaderboard[9].count || '--:--'}`,
                            inline: true,
                        }
                    )
                    .setFooter({ text: '(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church', iconURL: penisJoe });
                reply = embed;
                answer({ embeds: [embed] });
            });
        } catch (err) {
            console.log(err);
            reply = `Command: ${__filename}\nServer: ${interaction.guild.name} | ${interaction.guild.id}\nUser: ${interaction.user.tag} | ${interaction.user.id}\nChannel: ${interaction.channel.name} | ${interaction.channel.id}`;
            console.log(reply);
            return;
        }
        async function answer(input) {
            await interaction.editReply(input);
        }
    },
};
