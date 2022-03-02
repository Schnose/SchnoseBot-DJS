const { SlashCommandBuilder } = require('@discordjs/builders');
const { JOE1, JOE2 } = require('../../variables.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nocrouch')
        .setDescription('Approximate a nocrouch jump.')
        .setDefaultPermission(true)
        .addNumberOption((o) =>
            o
                .setName('distance')
                .setDescription('The distance of your nocrouch jump')
                .setRequired(true)
        )
        .addNumberOption((o) =>
            o.setName('max').setDescription('The max speed of your nocrouch jump').setRequired(true)
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

        try {
            let approx = output.getNumber('distance') + (output.getNumber('max') / 128) * 4;
            reply = `Approximated distance: \`${approx.toFixed(4)}\``;

            answer({ content: reply });
            return;
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
