const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageEmbed } = require("discord.js");
const userSchema = require("../../schemas/user-schema");
const axios = require("axios");
const { JOE1, JOE2 } = require("../../variables.json");
require("../../globalFunctions");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unfinished")
        .setDescription("show unfinished maps")
        .setDefaultPermission(true)
        .addStringOption((o) => o.setName("tier").setDescription("Tier filter").setRequired(false))
        .addStringOption((o) =>
            o
                .setName("runtype")
                .setDescription("TP/PRO")
                .setRequired(false)
                .addChoice("TP", "true")
                .addChoice("PRO", "false")
        )
        .addStringOption((o) =>
            o.setName("target").setDescription("Select a Player.").setRequired(false)
        )
        .addStringOption((o) =>
            o
                .setName("mode")
                .setDescription("Select a Mode.")
                .setRequired(false)
                .addChoice("SKZ", "SimpleKZ")
                .addChoice("KZT", "KZTimer")
                .addChoice("VNL", "Vanilla")
                .addChoice("ALL", "All 3 Modes")
        ),
    devOnly: false,

    async execute(interaction) {
        await interaction.deferReply();
        let reply = "(͡ ͡° ͜ つ ͡͡°)";
        let penisJoe;
        let whichJoe = Math.random() < 0.5;
        if (whichJoe == true) penisJoe = JOE1;
        if (whichJoe == false) penisJoe = JOE2;

        try {
            userSchema.findOne(async (err, data) => {
                if (err) return console.log(err);
                let output = interaction.options;
                let tier = output.getString("tier");
                let runtype = "true" === output.getString("runtype");
                let target = output.getString("target" || null);
                let penisMode = output.getString("mode" || null);

                let steamid;
                let mode;

                async function answer(input) {
                    await interaction.editReply(input);
                }

                if (target == null) {
                    //target unspecified
                    target = interaction.user.id;
                } else if (target.startsWith("<@") && target.endsWith(">")) {
                    //target specified with @mention
                    target = globalFunctions.getIDFromMention(target);
                } else {
                    //target specified with steam name/id
                    let result = await globalFunctions.getsteamID(target);
                    if (result == "bad") {
                        reply = "API Error! Please wait a moment before trying again.";
                        answer({ content: reply });
                        return;
                    }
                    if (!result) {
                        result = await globalFunctions.getName(target);
                        if (result == "bad") {
                            reply = "API Error! Please wait a moment before trying again.";
                            answer({ content: reply });
                            return;
                        }
                    }
                    if (!result) {
                        reply = `This player has never played kz before!`;
                        answer({ content: reply });
                        return;
                    }
                    steamid = result;
                }
                if (!steamid) {
                    if (!data.List[target]) {
                        //if target isnt registered in database
                        reply = `That Player doesn't have any database entries yet. They have to set their steamID first by using \`/setsteam\``;
                        answer({ content: reply });
                        return;
                    }
                    steamid = data.List[target].steamId;
                }
                if (!penisMode) {
                    //no specified mode
                    if (!data.List[target]) {
                        //if target isnt registered in database
                        reply = `You either have to specify a mode or set a default mode using the following command:\n \`\`\`\n/mode\n\`\`\``;
                        answer({ content: reply });
                        return;
                    }
                    mode = data.List[target].mode;
                    if (mode == "kz_simple") penisMode = "SimpleKZ";
                    else if (mode == "kz_timer") penisMode = "KZTimer";
                    else if (mode == "kz_vanilla") penisMode = "Vanilla";
                    else if (mode == "all") {
                        reply = "Specify a mode";
                        return answer({ content: reply });
                    }
                } else if (penisMode === "SimpleKZ") mode = "kz_simple";
                else if (penisMode === "KZTimer") mode = "kz_timer";
                else if (penisMode === "Vanilla") mode = "kz_vanilla";
                else {
                    reply = "Please specify a mode.";
                    return answer({ content: reply });
                }

                let penisRuntype = "PRO";
                if (runtype) {
                    penisRuntype = "TP";
                }
                if (!tier) tier = 0;

                let [allCompleted, allMaps, doable] = await Promise.all([
                    globalFunctions.getTimes(steamid, runtype, mode),
                    globalFunctions.getMapsAPI(),
                    globalFunctions.getDoableMaps(runtype, mode),
                ]);

                if ([allCompleted, allMaps, doable].includes("bad")) {
                    reply = "API Error! Please wait a moment before trying again.";
                    answer({ content: reply });
                    return;
                }

                const mapTiers = new Map();
                let mapsnotdone = [];
                allMaps.forEach((i) => {
                    mapTiers.set(i.name, i.difficulty);
                    if (doable.includes(i.id)) {
                        if (!i.name.includes("kzpro_") || runtype == false) {
                            if (i.difficulty == tier || tier == 0) {
                                if (!(mode == "kz_simple" && i.name == "kz_synergy_x"))
                                    mapsnotdone.push(i.name);
                            }
                        }
                    }
                });

                if (mode == "kz_vanilla") {
                    mapsnotdone = [];
                    await axios
                        .get("https://kzgo.eu/api/maps/completion/kz_vanilla")
                        .then(function (response) {
                            let cock = response.data;
                            cock.forEach((i) => {
                                if (i.vp == true) {
                                    if (!i.name.includes("kzpro_") || runtype == false)
                                        if (i.tier == tier || tier == 0) mapsnotdone.push(i.name);
                                }
                            });
                        })
                        .catch((err) => {
                            console.log(err);
                            return answer({ content: "API error! Please try again later" });
                        });
                }
                let mapsdone = [];

                allCompleted.forEach((i) => {
                    if (mapTiers.get(i.map_name) && !mapsdone.includes(i.map_name)) {
                        mapsdone.push(i.map_name);
                        const index = mapsnotdone.indexOf(i.map_name);
                        if (-1 != index) {
                            mapsnotdone.splice(index, 1);
                        }
                    }
                });

                let playerName;
                if (!allCompleted[0]) playerName = "?";
                else playerName = allCompleted[0].player_name;

                if (mapsnotdone.length == 0) {
                    reply = "You don't have any maps left to complete! Good job!";
                    answer({ content: reply });
                    return;
                }

                let text = "";

                for (i = 0; i < mapsnotdone.length; i++) {
                    if (i == 10) {
                        text += `...${mapsnotdone.length - 10} more`;
                        break;
                    }
                    text += `> ${mapsnotdone[i]}\n`;
                }
                if (tier == 0) {
                    tier = "ALL";
                } else {
                    tier = `[T${tier}]`;
                }

                let embed = new MessageEmbed()
                    .setColor("#7480c2")
                    .setTitle(`Uncompleted Maps - ${penisMode} ${penisRuntype} ${tier}`)
                    .setDescription(text)
                    // .setDescription(
                    //     `> ${mapsnotdone[0]}\n> ${mapsnotdone[1]}\n> ${mapsnotdone[2]}\n> ${
                    //         mapsnotdone[3]
                    //     }\n> ${mapsnotdone[4]}\n> ${mapsnotdone[5]}\n> ${mapsnotdone[6]}\n> ${
                    //         mapsnotdone[7]
                    //     }\n> ${mapsnotdone[8]}\n> ${mapsnotdone[9]}\n> ...${
                    //         mapsnotdone.length - 10
                    //     } more`
                    // )
                    .setFooter({
                        text: `(͡ ͡° ͜ つ ͡͡°)7 | Player: ${playerName} | schnose.eu/church`,
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
