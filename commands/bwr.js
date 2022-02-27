const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const userSchema = require('../schemas/user-schema');
require('dotenv').config();
require('../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bwr')
        .setDescription(`Check a BWR.`)
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
        )
        .addIntegerOption((o) =>
            o.setName('course').setDescription('Specify which BWR you want to check.')
        ),

    async execute(interaction) {
        await interaction.deferReply();
        let reply = '(͡ ͡° ͜ つ ͡͡°)';
        let output = interaction.options;
        let penisJoe;
        let whichJoe = Math.random() < 0.5;
        if (whichJoe == true) penisJoe = process.env.JOE1;
        if (whichJoe == false) penisJoe = process.env.JOE2;
        let map = output.getString('map');
        let penisMode = output.getString('mode') || 'All 3 Modes';
        let mode;
        let course = output.getInteger('course') || 1;

        let maps = await retard.getMaps();
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
                retard.getDataWR(true, mode, map, course),
                retard.getDataWR(false, mode, map, course),
            ]);

            let all = [TP, PRO];

            if (all.includes('bad')) {
                reply = 'API Error! Please try again later!';
                answer({ content: reply });
                return;
            }

            let tpTime = retard.convertmin(TP.time);
            let proTime = retard.convertmin(PRO.time);

            let embed = new MessageEmbed()
                .setColor('#7480c2')
                .setTitle(`${map} - BWR ${course}`)
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
                retard.getDataWR(true, 'kz_simple', map, course),
                retard.getDataWR(false, 'kz_simple', map, course),
                retard.getDataWR(true, 'kz_timer', map, course),
                retard.getDataWR(false, 'kz_timer', map, course),
                retard.getDataWR(true, 'kz_vanilla', map, course),
                retard.getDataWR(false, 'kz_vanilla', map, course),
            ]);

            let all = [skztp, skzpro, kzttp, kztpro, vnltp, vnlpro];

            if (all.includes('bad')) {
                reply = 'API Error! Please wait a moment before trying again.';
                answer({ content: reply });
                return;
            }

            skztptime = retard.convertmin(skztp.time);
            skzprotime = retard.convertmin(skzpro.time);
            kzttptime = retard.convertmin(kzttp.time);
            kztprotime = retard.convertmin(kztpro.time);
            vnltptime = retard.convertmin(vnltp.time);
            vnlprotime = retard.convertmin(vnlpro.time);

            let embed = new MessageEmbed()
                .setColor('#7480c2')
                .setTitle(`${map} - BWR ${course}`)
                .setURL(`https://kzgo.eu/maps/${map}`)
                .setThumbnail(
                    `https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map}.jpg`
                )
                .addFields(
                    {
                        name: 'SimpleKZ',
                        value: `TP: ${skztptime} (*${
                            skztp.player_name || '-'
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
