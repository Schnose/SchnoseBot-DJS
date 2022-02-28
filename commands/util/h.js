const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const userSchema = require('../../schemas/user-schema');
const { JOE1, JOE2 } = require('../../variables.json');

module.exports = {
    data: new SlashCommandBuilder().setName('h').setDescription('h').setDefaultPermission(true),
    devOnly: false,

    async execute(interaction) {
        let reply = '(͡ ͡° ͜ つ ͡͡°)';
        let penisJoe;
        let whichJoe = Math.random() < 0.5;
        if (whichJoe == true) penisJoe = JOE1;
        if (whichJoe == false) penisJoe = JOE2;

        userSchema.findOne(async (err, data) => {
            if (err) return console.log(err);

            try {
                if (data) {
                    let USERID;
                    let STEAMID;
                    let MODE;

                    if (data.List[interaction.user.id]) {
                        if (data.List[interaction.user.id].userId)
                            USERID = data.List[interaction.user.id].userId;
                        if (data.List[interaction.user.id].userId)
                            STEAMID = data.List[interaction.user.id].steamId;
                        if (data.List[interaction.user.id].userId)
                            MODE = data.List[interaction.user.id].mode;

                        let embed = new MessageEmbed()
                            .setColor('#7480c2')
                            .setTitle(`Your current Database entries:`)
                            .setDescription(
                                `> userID: ${USERID}\n> steamID: ${STEAMID}\n> mode: ${MODE}`
                            )
                            .setTimestamp()
                            .setFooter({ text: '(͡ ͡° ͜ つ ͡͡°)7', iconURL: penisJoe });

                        reply = embed;
                        answer({ embeds: [embed], ephemeral: true });
                        return;
                    } else {
                        reply = "You don't have any database entries yet.";
                        answer({ content: reply, ephemeral: true });
                        return;
                    }
                } else {
                    reply = 'Database unreachable.';
                    answer({ content: reply, ephemeral: true });
                    return;
                }
            } catch (err) {
                console.error(err);
            }
        });

        async function answer(input) {
            await interaction.reply(input);
        }
    },
};
