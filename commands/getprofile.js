const { ContextMenuCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const userSchema = require('../schemas/user-schema');
require('dotenv').config();
require('../functions');
const axios = require('axios');

module.exports = {
    data: new ContextMenuCommandBuilder().setName('getprofile').setType(2),

    async execute(interaction) {
        await interaction.deferReply();
        let reply = '(͡ ͡° ͜ つ ͡͡°)';
        let penisJoe;
        let whichJoe = Math.random() < 0.5;
        if (whichJoe == true) penisJoe = process.env.JOE1;
        if (whichJoe == false) penisJoe = process.env.JOE2;
        let target = interaction.targetId;

        userSchema.findOne(async (err, data) => {
            if (err) return console.log(err);
            let penisTarget;
            let mode;
            let penisMode;

            async function answer(input) {
                await interaction.editReply(input);
            }

            if (!data.List[target]) {
                //if target isnt registered in database
                reply = `That Player doesn't have any database entries yet. They have to set their steamID first by using \`/setsteam\``;
                answer({ content: reply });
                return;
            } else penisTarget = data.List[target].steamId;

            //target specified with steam name/id
            let result = await retard.getsteamID(penisTarget);
            if (result == 'bad') {
                reply = 'API Error! Please wait a moment before trying again.';
                answer({ content: reply });
                return;
            }
            if (!result) {
                reply = `That Player has never played KZ before!`;
                answer({ content: reply });
                return;
            }

            steamid = result;
            //console.log(steamid);

            if (data.List[target].mode) {
                mode = data.List[target].mode;
                if (mode == 'kz_timer') penisMode = 'KZT';
                else if (mode == 'kz_simple') penisMode = 'SKZ';
                else if (mode == 'kz_vanilla') penisMode = 'VNL';
                else if (mode == 'all') penisMode = 'None';
            } else {
                mode = 'all';
                penisMode = 'None';
            }

            //console.log(mode);

            let [allTP, allPRO, allMaps, doableTP, doablePRO, player] = await Promise.all([
                retard.getTimes(steamid, true, mode),
                retard.getTimes(steamid, false, mode),
                retard.getMapsAPI(),
                retard.getDoableMaps(true, mode),
                retard.getDoableMaps(false, mode),
                retard.getPlayer(steamid),
            ]);

            if ([allTP, allPRO, allMaps, doableTP, doablePRO].includes('bad')) {
                answer({ content: 'API Error. Please try again later.' });
                return;
            }

            const mapTiers = new Map();
            let mapsTP = [0, 0, 0, 0, 0, 0, 0, 0];
            let strmapsTP = [0, 0, 0, 0, 0, 0, 0, 0];
            let mapsPRO = [0, 0, 0, 0, 0, 0, 0, 0];
            let strmapsPRO = [0, 0, 0, 0, 0, 0, 0, 0];

            allMaps.forEach((i) => {
                mapTiers.set(i.name, i.difficulty);
                if (doableTP.includes(i.id) && !i.name.includes('kzpro_')) {
                    mapsTP[0]++;
                    mapsTP[i.difficulty]++;
                }
                if (doablePRO.includes(i.id)) {
                    mapsPRO[0]++;
                    mapsPRO[i.difficulty]++;
                }
            });

            let TPcompletion = [0, 0, 0, 0, 0, 0, 0, 0];
            let strTpcompletion = [];
            let PROcompletion = [0, 0, 0, 0, 0, 0, 0, 0];
            let strPROcompletion = [];
            let perccompletionTP = [0, 0, 0, 0, 0, 0, 0, 0];
            let perccompletionPRO = [0, 0, 0, 0, 0, 0, 0, 0];
            let strperccompletionTP = [];
            let strperccompletionPRO = [];

            let overallTP = 0;
            let stroverallTP = '';
            let overallPRO = 0;
            let stroverallPRO = '';
            let averageTP = 0;
            let straverageTP = '';
            let averagePRO = 0;
            let straveragePRO = '';
            let averageTPx = 0;
            let averagePROx = 0;
            let TPWRs = 0;
            let strTPWRs = '';
            let PROWRs = 0;
            let strPROWRs = '';

            let mapsdone = [];

            allTP.forEach((i) => {
                if (mapTiers.get(i.map_name) && !mapsdone.includes(i.map_name)) {
                    mapsdone.push(i.map_name);
                    //average + overall
                    overallTP += i.points;
                    averageTPx++;
                    //
                    //completion + tier completion
                    TPcompletion[0]++;
                    TPcompletion[mapTiers.get(i.map_name)]++;
                    //
                    //wrs
                    if (i.points == 1000) {
                        TPWRs++;
                    }
                    //
                }
            });
            allPRO.forEach((i) => {
                if (mapTiers.get(i.map_name)) {
                    //average + overall
                    overallPRO += i.points;
                    averagePROx++;
                    //
                    //completion + tier completion
                    PROcompletion[0]++;
                    PROcompletion[mapTiers.get(i.map_name)]++;
                    //
                    //wrs
                    if (i.points == 1000) {
                        PROWRs++;
                    }
                }
                //
            });
            strTPWRs = TPWRs.toString();
            let line1gap = '';
            for (let x = 0; x < 3 - strTPWRs.length; x++) {
                line1gap += '⠀';
            }
            strPROWRs = PROWRs.toString();
            averageTP = (overallTP / averageTPx).toFixed(2);
            averagePRO = (overallPRO / averagePROx).toFixed(2);
            straverageTP = averageTP.toString();
            let line12gap = '';
            for (let x = 0; x < 6 - straverageTP.length; x++) {
                line12gap += '⠀';
            }
            straveragePRO = averagePRO.toString();
            stroverallTP = overallTP.toString();
            stroverallTP = retard.numberWithCommas(stroverallTP);
            for (let x = 0; x < 9 - stroverallTP.length; x++) {
                line12gap += '⠀';
            }
            stroverallPRO = overallPRO.toString();
            stroverallPRO = retard.numberWithCommas(stroverallPRO);

            let overalloverallPoints = (overallTP + overallPRO).toString();
            overalloverallPoints = retard.numberWithCommas(overalloverallPoints);

            if (mode == 'kz_simple') {
                mapsTP[0]--;
                mapsPRO[0]--;
                mapsTP[5]--; //synergy_x has a filter
                mapsPRO[5]--;
            }
            if (mode == 'kz_vanilla') {
                //using kzgo api to fix scuffed vnl
                mapsTP = [0, 0, 0, 0, 0, 0, 0, 0];
                //const response = await axios.get("https://kzgo.eu/api/maps/completion/kz_vanilla");
                //console.log(response);
                await axios
                    .get('https://kzgo.eu/api/maps/completion/kz_vanilla')
                    .then(function (response) {
                        let cock = response.data.tiers;
                        mapsTP[0] = cock.total;
                        for (let i = 1; i < 8; i++) {
                            mapsTP[i] = cock[i];
                        }
                        mapsPRO = mapsTP;
                        mapsPRO[3]--;
                    })
                    .catch((err) => {
                        console.log(err);
                        return answer({ content: 'API error! Please try again later' });
                    });
            }
            TPcompletion.forEach((x) => {
                strTpcompletion.push(x.toString().padStart(3, ' '));
            });
            PROcompletion.forEach((x) => {
                strPROcompletion.push(x.toString().padStart(3, ' '));
            });
            mapsTP.forEach((x) => {
                strmapsTP.push(x.toString().padStart(3, ' '));
            });
            mapsPRO.forEach((x) => {
                strmapsPRO.push(x.toString().padStart(3, ' '));
            });
            let gapline3 = '';
            if (perccompletionTP[0] < 10) {
                gapline3 = '⠀⠀';
            } else if (perccompletionTP[0] < 100) {
                gapline3 = '⠀';
            }
            for (let x = 0; x < mapsTP.length; x++) {
                if (mapsTP[x] != 0)
                    perccompletionTP[x] = ((TPcompletion[x] / mapsTP[x]) * 100).toFixed(0);
                else perccompletionTP[x] = 0;
                if (mapsPRO[x] != 0)
                    perccompletionPRO[x] = ((PROcompletion[x] / mapsPRO[x]) * 100).toFixed(0);
                else perccompletionPRO[x] = 0;
            }
            for (let x = 0; x < perccompletionTP.length; x++) {
                strperccompletionTP.push(perccompletionTP[x].toString().padStart(3, ' ') + '%');
                strperccompletionPRO.push(perccompletionPRO[x].toString().padStart(3, ' ') + '%');
            }

            let barsTP = [];
            let barsPRO = [];

            perccompletionTP.forEach((i) => {
                let x = Math.floor(i / 10);
                let bar = '';
                for (let y = 0; y < x; y++) {
                    bar += '█';
                }
                for (let y = 0; y < 10 - x; y++) {
                    bar += '░';
                }
                barsTP.push(bar);
            });
            perccompletionPRO.forEach((i) => {
                let x = Math.floor(i / 10);
                let bar = '';
                for (let y = 0; y < x; y++) {
                    bar += '█';
                }
                for (let y = 0; y < 10 - x; y++) {
                    bar += '░';
                }
                barsPRO.push(bar);
            });
            for (let i = 1; i < mapsTP.length; i++) {
                if (mapsTP[i] == 0) {
                    barsTP[i] = '          No maps          ';
                    strperccompletionTP[i] = '100%';
                }
                if (mapsPRO[i] == 0) {
                    barsPRO[i] = '          No maps          ';
                    strperccompletionPRO[i] = '100%';
                }
            }

            let embed = new MessageEmbed()
                .setColor('#7480c2')
                .setTitle(`${penisMode} Profile - ${player.name}`)
                .setURL(`https://steamcommunity.com/profiles/${player.steamid64}`)
                .setDescription(
                    `\`>> TP | 🏆 WRS: ${strTPWRs}\`⠀⠀⠀⠀⠀⠀⠀${line1gap}⠀⠀⠀⠀⠀⠀\`>> PRO | 🏆 WRS: ${strPROWRs}\`
                    ─────────────────────────────────────────────────
                    \`Total Completion: ${TPcompletion[0]}/${mapsTP[0]} (${
                        perccompletionTP[0] + '%'
                    })\`⠀⠀${gapline3}⠀ \`Total Completion: ${PROcompletion[0]}/${mapsPRO[0]} (${
                        perccompletionPRO[0] + '%'
                    })\`
                    
                    \`Tier 1:\` ⌠ ${barsTP[1]} ⌡ - \`${strperccompletionTP[1]}\`⠀⠀⠀⠀\`Tier 1:\` ⌠ ${
                        barsPRO[1]
                    } ⌡ - \`${strperccompletionPRO[1]}\`
                    \`Tier 2:\` ⌠ ${barsTP[2]} ⌡ - \`${strperccompletionTP[2]}\`⠀⠀⠀⠀\`Tier 2:\` ⌠ ${
                        barsPRO[2]
                    } ⌡ - \`${strperccompletionPRO[2]}\`
                    \`Tier 3:\` ⌠ ${barsTP[3]} ⌡ - \`${strperccompletionTP[3]}\`⠀⠀⠀⠀\`Tier 3:\` ⌠ ${
                        barsPRO[3]
                    } ⌡ - \`${strperccompletionPRO[3]}\`
                    \`Tier 4:\` ⌠ ${barsTP[4]} ⌡ - \`${strperccompletionTP[4]}\`⠀⠀⠀⠀\`Tier 4:\` ⌠ ${
                        barsPRO[4]
                    } ⌡ - \`${strperccompletionPRO[4]}\`
                    \`Tier 5:\` ⌠ ${barsTP[5]} ⌡ - \`${strperccompletionTP[5]}\`⠀⠀⠀⠀\`Tier 5:\` ⌠ ${
                        barsPRO[5]
                    } ⌡ - \`${strperccompletionPRO[5]}\`
                    \`Tier 6:\` ⌠ ${barsTP[6]} ⌡ - \`${strperccompletionTP[6]}\`⠀⠀⠀⠀\`Tier 6:\` ⌠ ${
                        barsPRO[6]
                    } ⌡ - \`${strperccompletionPRO[6]}\`
                    \`Tier 7:\` ⌠ ${barsTP[7]} ⌡ - \`${strperccompletionTP[7]}\`⠀⠀⠀⠀\`Tier 7:\` ⌠ ${
                        barsPRO[7]
                    } ⌡ - \`${strperccompletionPRO[7]}\`
                    ─────────────────────────────────────────────────
                    \`Points: ${stroverallTP} / ${straverageTP}\`⠀⠀⠀⠀⠀${line12gap}⠀⠀⠀\`Points: ${stroverallPRO} / ${straveragePRO}\`
                    `
                )
                .addFields(
                    {
                        name: `Overall Points`,
                        value: `${overalloverallPoints}`,
                        inline: true,
                    },
                    {
                        name: `steamID`,
                        value: `${steamid}`,
                        inline: true,
                    },
                    {
                        name: `Mode Preference`,
                        value: `${penisMode}`,
                        inline: true,
                    }
                )
                .setFooter({
                    text: '(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church',
                    iconURL: penisJoe,
                });
            reply = embed;
            answer({ embeds: [reply] });
        });
    },
};
