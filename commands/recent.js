const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const userSchema = require('../schemas/user-schema');
require('dotenv').config();
require('../functions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('recent')
        .setDescription('recent PB')
        .addStringOption((o) =>
            o.setName('target').setDescription('Select a Player.').setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply();
        let reply = '(͡ ͡° ͜ つ ͡͡°)';
        let penisJoe;
        let whichJoe = Math.random() < 0.5;
        if (whichJoe == true) penisJoe = process.env.JOE1;
        if (whichJoe == false) penisJoe = process.env.JOE2;

        userSchema.findOne(async (err, data) => {
            if (err) return console.log(err);
            let output = interaction.options;
            let target = output.getString('target' || null);

            let steamid;

            async function answer(input) {
                await interaction.editReply(input);
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
                    reply = `That player has never played KZ before!`;
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

            let [skztp, skzpro, kzttp, kztpro, vnltp, vnlpro] = await Promise.all([
                retard.getDataRS(steamid, true, 'kz_simple'),
                retard.getDataRS(steamid, false, 'kz_simple'),
                retard.getDataRS(steamid, true, 'kz_timer'),
                retard.getDataRS(steamid, false, 'kz_timer'),
                retard.getDataRS(steamid, true, 'kz_vanilla'),
                retard.getDataRS(steamid, false, 'kz_vanilla'),
            ]);

            let all = [skztp, skzpro, kzttp, kztpro, vnltp, vnlpro];

            if (all.includes('bad')) {
                reply = 'API Error! Please wait a moment before trying again.';
                answer({ content: reply });
                return;
            }

            let all2 = [];
            let alltime = [];

            all.forEach((i) => {
                if (i[0])
                    i.forEach((x) => {
                        alltime.push(Date.parse(x.created_on));
                        all2.push(x);
                    });
            });

            let rstime = all2[alltime.indexOf(Math.max(...alltime))];

            if (!rstime) {
                reply = 'That Player has no times.';
                answer({ content: reply });
                return;
            }

            //console.log(rstime);

            let runtype;
            if (rstime.teleports == 0) {
                runtype = 'PRO';
            } else {
                runtype = 'TP';
            }

            rsplace = await retard.getTopPlace(rstime);

            //if (rsplace) rsplace = "#" + rsplace;

            //console.log(rsplace);

            rstimetime = retard.convertmin(rstime.time);

            let penisMode;

            if (rstime.mode == 'kz_timer') {
                penisMode = 'KZT';
            } else if (rstime.mode == 'kz_simple') {
                penisMode = 'SKZ';
            } else if (rstime.mode == 'kz_vanilla') {
                penisMode = 'VNL';
            }

            let embed = new MessageEmbed()
                .setColor('#7480c2')
                .setTitle(`${rstime.map_name} - Recent`)
                .setURL(`https://kzgo.eu/maps/${rstime.map_name}`)
                .setThumbnail(
                    `https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${rstime.map_name}.jpg`
                )
                .addFields({
                    name: `${penisMode}`,
                    value: `${runtype}: ${rstimetime} ${rsplace || ''}`,
                    inline: true,
                })
                .setFooter({
                    text: `(͡ ͡° ͜ つ ͡͡°)7 | Player: ${rstime.player_name} | schnose.eu/church`,
                    iconURL: penisJoe,
                });
            reply = embed;
            answer({ embeds: [embed] });
        });
    },
};
