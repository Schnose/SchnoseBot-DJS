const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const userSchema = require('../schemas/user-schema');
require('dotenv').config();
require('../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pb')
        .setDescription('map pb')
        .addStringOption((o) => o.setName('map').setDescription('Select a Map.').setRequired(true))
        .addStringOption((o) =>
            o.setName('target').setDescription('Select a Player.').setRequired(false)
        )
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

    async execute(interaction) {
        await interaction.deferReply();
        let reply = '(͡ ͡° ͜ つ ͡͡°)';

        userSchema.findOne(async (err, data) => {
            if (err) return console.log(err);
            let output = interaction.options;
            let map = output.getString('map');
            let target = output.getString('target' || null);
            let penisMode = output.getString('mode' || null);

            let steamid;
            let mode;

            async function answer(input) {
                await interaction.editReply(input);
            }

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
            if (target == null) {
                //target unspecified
                target = interaction.user.id;
            } else if (target.startsWith('<@') && target.endsWith('>')) {
                //target specified with @mention
                target = retard.getIDFromMention(target);
            } else {
                //target specified with steam name/id
                let result = await retard.getsteamID(target);
                if (result == 'bad') {
                    reply = 'API Error! Please wait a moment before trying again.';
                    answer({ content: reply });
                    return;
                }
                if (!result) {
                    result = await retard.getName(target);
                    if (result == 'bad') {
                        reply = 'API Error! Please wait a moment before trying again.';
                        answer({ content: reply });
                        return;
                    }
                }
                if (!result) {
                    reply = `That Player has never played KZ before!`;
                    answer({ content: reply });
                    return;
                }
                steamid = result;
            }
            if (!steamid) {
                if (!data.List[target]) {
                    //if target isnt registered in database
                    reply = `You either have to specify a mode or set a default mode using the following command:\n \`\`\`\n/mode\n\`\`\``;
                    answer({ content: reply });
                    return;
                }
                steamid = data.List[target].steamId;
            }
            if (!penisMode) {
                //no specified mode
                if (!data.List[target]) {
                    //if target isnt registered in database
                    reply = `You either have to specify a mode or set a default mode using the following command:\n \`\`\`\n/mode\n\`\`\`.`;
                    answer({ content: reply });
                    return;
                }
                mode = data.List[target].mode;
                if (mode == 'kz_simple') penisMode = 'SimpleKZ';
                else if (mode == 'kz_timer') penisMode = 'KZTimer';
                else if (mode == 'kz_vanilla') penisMode = 'Vanilla';
                else if (mode == 'all') penisMode = 'All 3 modes';
            } else if (penisMode === 'SimpleKZ') mode = 'kz_simple';
            else if (penisMode === 'KZTimer') mode = 'kz_timer';
            else if (penisMode === 'Vanilla') mode = 'kz_vanilla';

            if (penisMode == 'All 3 Modes') {
                let [skztp, skzpro, kzttp, kztpro, vnltp, vnlpro] = await Promise.all([
                    retard.getDataPB(steamid, true, 'kz_simple', map, 0),
                    retard.getDataPB(steamid, false, 'kz_simple', map, 0),
                    retard.getDataPB(steamid, true, 'kz_timer', map, 0),
                    retard.getDataPB(steamid, false, 'kz_timer', map, 0),
                    retard.getDataPB(steamid, true, 'kz_vanilla', map, 0),
                    retard.getDataPB(steamid, false, 'kz_vanilla', map, 0),
                ]);

                let all = [skztp, skzpro, kzttp, kztpro, vnltp, vnlpro];

                if (all.includes('bad')) {
                    reply = 'API Error! Please wait a moment before trying again.';
                    answer({ content: reply });
                    return;
                }
                if (
                    skztp.time == 0 &&
                    skzpro.time == 0 &&
                    kzttp.time == 0 &&
                    kztpro.time == 0 &&
                    vnltp.time == 0 &&
                    vnlpro.time == 0
                ) {
                    reply = `No PB found for \`${map}\``;
                    answer({ content: reply });
                    return;
                }
                skztptime = retard.convertmin(skztp.time);
                skztpname = skztp.player_name;
                skzprotime = retard.convertmin(skzpro.time);
                skzproname = skzpro.player_name;
                kzttptime = retard.convertmin(kzttp.time);
                kzttpname = kzttp.player_name;
                kztprotime = retard.convertmin(kztpro.time);
                kztproname = kztpro.player_name;
                vnltptime = retard.convertmin(vnltp.time);
                vnltpname = vnltp.player_name;
                vnlprotime = retard.convertmin(vnlpro.time);
                vnlproname = vnlpro.player_name;

                let allResponse = new MessageEmbed()
                    .setColor('#7480c2')
                    .setTitle(`${map} - PB`)
                    .setThumbnail(
                        `https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map}.jpg`
                    )
                    .addFields(
                        {
                            name: 'SimpleKZ',
                            value: `TP: ${skztptime}\nPRO: ${skzprotime}`,
                            inline: true,
                        },
                        {
                            name: 'KZTimer',
                            value: `TP: ${kzttptime}\nPRO: ${kztprotime}`,
                            inline: true,
                        },
                        {
                            name: 'Vanilla',
                            value: `TP: ${vnltptime}\nPRO: ${vnlprotime}`,
                            inline: true,
                        }
                    )
                    .setFooter({
                        text: `(͡ ͡° ͜ つ ͡͡°)7 | Player: ${
                            skztpname ||
                            skzproname ||
                            kzttpname ||
                            kztproname ||
                            vnltpname ||
                            vnlproname
                        } | schnose.eu/church`,
                        iconURL: process.env.JOE,
                    });
                return answer({ embeds: [allResponse] });
            } else {
                let [TP, PRO] = await Promise.all([
                    retard.getDataPB(steamid, true, mode, map, 0),
                    retard.getDataPB(steamid, false, mode, map, 0),
                ]);
                let all = [TP, PRO];

                if (all.includes('bad')) {
                    reply = 'API Error! Please try again later.';
                    answer({ content: reply });
                    return;
                }
                if (TP.time == 0 && PRO.time == 0) {
                    reply = `No PB found for \`${map}\``;
                    answer({ content: reply });
                    return;
                }

                tpTime = retard.convertmin(TP.time);
                tpName = TP.player_name;
                let tpPlace;
                if (TP.time != 0) tpPlace = await retard.getTopPlace(TP);

                proTime = retard.convertmin(PRO.time);
                proName = PRO.player_name;
                let proPlace;
                if (PRO.time != 0) proPlace = await retard.getTopPlace(PRO);

                let specificResponse = new MessageEmbed()
                    .setColor('#7480c2')
                    .setTitle(`${map} - PB`)
                    .setDescription(`Mode: ${penisMode}`)
                    .setThumbnail(
                        `https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map}.jpg`
                    )
                    .addFields(
                        {
                            name: 'TP',
                            value: `${tpTime || 'None'} ${tpPlace || ''}`,
                            inline: true,
                        },
                        {
                            name: 'PRO',
                            value: `${proTime || 'None'} ${proPlace || ''}`,
                            inline: true,
                        }
                    )
                    .setFooter({
                        text: `(͡ ͡° ͜ つ ͡͡°)7 | Player: ${tpName || proName} | schnose.eu/church`,
                        iconURL: process.env.JOE,
                    });

                return answer({ embeds: [specificResponse] });
            }
        });
    },
};
