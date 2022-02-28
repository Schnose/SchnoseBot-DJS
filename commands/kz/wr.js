const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const { JOE1, JOE2 } = require('../../variables.json');
require('../../globalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wr')
        .setDescription(`Check a map's WR.`)
        .setDefaultPermission(true)
        .addStringOption((o) => o.setName('map').setDescription('Select a Map.').setRequired(true))
        .addStringOption((o) =>
            o
                .setName('mode')
                .setDescription('Select a Mode.')
                .setRequired(false)
                .addChoice('SKZ', 'SimpleKZ')
                .addChoice('KZT', 'KZTimer')
                .addChoice('VNL', 'Vanilla')
                .addChoice('ALL', 'All 3 Modes')
        ),
    devOnly: false,

    async execute(interaction) {
        await interaction.deferReply();

        let reply = '(͡ ͡° ͜ つ ͡͡°)';
        let output = interaction.options;
        let penisJoe;
        let whichJoe = Math.random() < 0.5;
        if (whichJoe == true) penisJoe = JOE1;
        if (whichJoe == false) penisJoe = JOE2;
        let map = output.getString('map');
        let penisMode = output.getString('mode') || 'All 3 Modes';
        let mode;

        let maps = await globalFunctions.getMaps();
        if (maps == 'bad') {
            //API side error
            reply = 'API Error! Please try again later.';
            answer({ content: reply });
            return;
        }
        if (!maps.includes(map)) {
            let i;
            for (i = 0; i < maps.length; i++) {
                if (maps[i].includes(map)) {
                    map = maps[i];
                    break;
                }
            }
            if (i == maps.length) {
                reply = `\`${map}\` is not a valid map!`;
                answer({ content: reply });
                return;
            }
        }

        if (penisMode != 'All 3 Modes') {
            if (penisMode === 'SimpleKZ') mode = 'kz_simple';
            else if (penisMode === 'KZTimer') mode = 'kz_timer';
            else if (penisMode === 'Vanilla') mode = 'kz_vanilla';

            let [TP, PRO] = await Promise.all([
                globalFunctions.getDataWR(true, mode, map, 0),
                globalFunctions.getDataWR(false, mode, map, 0),
            ]);

            let all = [TP, PRO];

            if (all.includes('bad')) {
                reply = 'API Error! Please try again later!';
                answer({ content: reply });
                return;
            }

            let tpTime = globalFunctions.convertmin(TP.time);
            let proTime = globalFunctions.convertmin(PRO.time);

            let embed = new MessageEmbed()
                .setColor('#7480c2')
                .setTitle(`${map} - WR`)
                .setURL(`https://kzgo.eu/maps/${map}`)
                .setDescription(`Mode: ${penisMode}`)
                .setThumbnail(
                    `https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map}.jpg`
                )
                .addFields(
                    {
                        name: 'TP',
                        value: `${tpTime} (*${TP.player_name || 'None'}*)`,
                        inline: true,
                    },
                    {
                        name: 'PRO',
                        value: `${proTime} (*${PRO.player_name || 'None'}*)`,
                        inline: true,
                    }
                )
                .setFooter({
                    text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                    iconURL: penisJoe,
                });
            reply = embed;
            answer({ embeds: [reply] });
            return;
        } else {
            let [skztp, skzpro, kzttp, kztpro, vnltp, vnlpro] = await Promise.all([
                globalFunctions.getDataWR(true, 'kz_simple', map, 0),
                globalFunctions.getDataWR(false, 'kz_simple', map, 0),
                globalFunctions.getDataWR(true, 'kz_timer', map, 0),
                globalFunctions.getDataWR(false, 'kz_timer', map, 0),
                globalFunctions.getDataWR(true, 'kz_vanilla', map, 0),
                globalFunctions.getDataWR(false, 'kz_vanilla', map, 0),
            ]);

            let all = [skztp, skzpro, kzttp, kztpro, vnltp, vnlpro];

            if (all.includes('bad')) {
                reply = 'API Error! Please wait a moment before trying again.';
                answer({ content: reply });
                return;
            }

            skztptime = globalFunctions.convertmin(skztp.time);
            skzprotime = globalFunctions.convertmin(skzpro.time);
            kzttptime = globalFunctions.convertmin(kzttp.time);
            kztprotime = globalFunctions.convertmin(kztpro.time);
            vnltptime = globalFunctions.convertmin(vnltp.time);
            vnlprotime = globalFunctions.convertmin(vnlpro.time);

            let embed = new MessageEmbed()
                .setColor('#7480c2')
                .setTitle(`${map} - WR`)
                .setURL(`https://kzgo.eu/maps/${map}`)
                .setThumbnail(
                    `https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map}.jpg`
                )
                .addFields(
                    {
                        name: 'SimpleKZ',
                        value: `TP: ${skztptime} (*${
                            skztp.player_name || 'None'
                        }*)\nPRO: ${skzprotime} (*${skzpro.player_name || 'None'}*)`,
                        inline: false,
                    },
                    {
                        name: 'KZTimer',
                        value: `TP: ${kzttptime} (*${
                            kzttp.player_name || 'None'
                        }*)\nPRO: ${kztprotime} (*${kztpro.player_name || 'None'}*)`,
                        inline: false,
                    },
                    {
                        name: 'Vanilla',
                        value: `TP: ${vnltptime} (*${
                            vnltp.player_name || 'None'
                        }*)\nPRO: ${vnlprotime} (*${vnlpro.player_name || 'None'}*)`,
                        inline: false,
                    }
                )
                .setFooter({
                    text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                    iconURL: penisJoe,
                });
            reply = embed;
            answer({ embeds: [reply] });
            return;
        }

        async function answer(input) {
            await interaction.editReply(input);
        }
    },
};
