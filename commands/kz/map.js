const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const userSchema = require('../../schemas/user-schema');
const { JOE1, JOE2 } = require('../../variables.json');
require('../../globalFunctions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('map')
        .setDescription('Get infomation about a map.')
        .setDefaultPermission(true)
        .addStringOption((o) => o.setName('map').setDescription('Select a map.').setRequired(true)),
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
                let map = output.getString('map');
                let penisTier;

                async function answer(input) {
                    await interaction.editReply(input);
                }

                let mapsmap = new Map();
                let maps = [];
                let maps2 = await globalFunctions.getMapsAPI();
                if (maps2 == 'bad') {
                    //API side error
                    reply = 'API Error! Please try again later.';
                    answer({ content: reply });
                    return;
                }
                maps2.forEach((i) => {
                    maps.push(i.name);
                    mapsmap.set(i.name, i.id);
                });
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

                let [penisSkz, penisKzt, penisVnl] = ['❌', '❌', '❌'];
                let [all, kzgo] = await Promise.all([
                    globalFunctions.hasFilter(mapsmap.get(map), 0),
                    globalFunctions.stealKZGOdata(),
                ]);

                if ([all, kzgo].includes('bad')) {
                    answer({ content: 'API Error. Please try again later.' });
                    return;
                }
                let skz, kzt, vnl;
                all.forEach((i) => {
                    if (i.mode_id == 200) kzt = true;
                    else if (i.mode_id == 201) skz = true;
                    else if (i.mode_id == 202) vnl = true;
                });
                if (skz) penisSkz = '✅';
                if (kzt) penisKzt = '✅';
                if (vnl) penisVnl = '✅';

                for (let i = 0; i < kzgo.length; i++) {
                    if (kzgo[i].name == map) {
                        kzgo = kzgo[i];
                        break;
                    }
                }

                let date = Date.parse(kzgo.date);

                if (kzgo.tier === 1) penisTier = 'Very Easy';
                if (kzgo.tier === 2) penisTier = 'Easy';
                if (kzgo.tier === 3) penisTier = 'Medium';
                if (kzgo.tier === 4) penisTier = 'Hard';
                if (kzgo.tier === 5) penisTier = 'Very Hard';
                if (kzgo.tier === 6) penisTier = 'Extreme';
                if (kzgo.tier === 7) penisTier = 'Death';

                let embed = new MessageEmbed()
                    .setColor('#7480c2')
                    .setTitle(`${map}`)
                    .setThumbnail(`https://raw.githubusercontent.com/KZGlobalTeam/map-images/master/images/${map}.jpg`)
                    .setURL(`https://kzgo.eu/maps/${map}`)
                    .setDescription(
                        `> Tier: ${kzgo.tier} (${penisTier})\n> Mapper: [${
                            kzgo.mapperNames[0]
                        }](https://steamcommunity.com/profiles/${kzgo.mapperIds[0]})\n> Bonuses: ${
                            kzgo.bonuses
                        }\n> Globalled: <t:${date / 1000}:d>\n`
                    )
                    .addFields(
                        {
                            name: 'SimpleKZ',
                            value: penisSkz,
                            inline: true,
                        },
                        {
                            name: 'KZTimer',
                            value: penisKzt,
                            inline: true,
                        },
                        {
                            name: 'Vanilla',
                            value: penisVnl,
                            inline: true,
                        }
                    )
                    .setFooter({
                        text: `(͡ ͡° ͜ つ ͡͡°)7 | workshopID: ${kzgo.workshopId} | schnose.eu/church`,
                        iconURL: penisJoe,
                    });

                return answer({ embeds: [embed] });
            });
        } catch (err) {
            console.log(err);
            reply = `Command: ${__filename}\nServer: ${interaction.guild.name} | ${interaction.guild.id}\nUser: ${interaction.user.tag} | ${interaction.user.id}\nChannel: ${interaction.channel.name} | ${interaction.channel.id}`;
            console.log(reply);
            return;
        }
    },
};
