const fs = require('fs');
const { REST } = require('@discordjs/rest');
const { Collection, MessageEmbed } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();

async function commandReg(client) {
    const commandFiles = fs
        .readdirSync(`${process.cwd()}\\commands`)
        .filter((file) => file.endsWith('.js'));

    const commands = [];

    client.commands = new Collection();
    for (const file of commandFiles) {
        const command = require(`${process.cwd()}\\commands\\${file}`);
        commands.push(command.data.toJSON());
        client.commands.set(command.data.name, command);
    }

    const devs = ['291585142164815873', '295966419261063168'];

    client.once('ready', () => {
        const CLIENT_ID = client.user.id;

        const rest = new REST({
            version: '9',
        }).setToken(process.env.LOGIN_TOKEN);

        (async () => {
            try {
                if (process.env.MODE === 'DEV') {
                    await rest.put(
                        Routes.applicationGuildCommands(CLIENT_ID, process.env.GUILD_TEST),
                        {
                            body: commands,
                        }
                    );

                    console.log('Successfully registered commands locally:');
                    console.log(commandFiles);
                } else if (process.env.MODE === 'MAIN') {
                    await rest.put(Routes.applicationCommands(CLIENT_ID), {
                        body: commands,
                    });
                    console.log('Successfully registered commands globally.');
                } else {
                    console.log('Slashcommand Error');
                    return;
                }
            } catch (err) {
                if (err) console.error(err);
            }
        })();
    });

    client.on('interactionCreate', async (interaction) => {
        if (interaction.isCommand() || interaction.isContextMenu()) {
            const command = client.commands.get(interaction.commandName);

            if (!command) return;

            if (command.devOnly === true) {
                if (!devs.includes(interaction.user.id)) {
                    interaction.reply({
                        content: 'You have insufficient permissions to use this command.',
                        ephemeral: true,
                    });
                    return;
                }
            }

            try {
                await command.execute(interaction);
            } catch (err) {
                console.error(err);
            }
        }

        if (interaction.isSelectMenu()) {
            let penisJoe;
            let whichJoe = Math.random() < 0.5;
            if (whichJoe == true) penisJoe = process.env.JOE1;
            if (whichJoe == false) penisJoe = process.env.JOE2;

            if (interaction.customId === 'commands-menu') {
                if (interaction.values == 'setsteam-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/setsteam`)
                        .setDescription(
                            `You can use this command to save your steamID in the bot's database so it can automatically use it when using commands such as \`/pb\`.`
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed] });
                } else if (interaction.values == 'mode-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/mode`)
                        .setDescription(
                            `You can use this command to save your preferred mode in the bot's database so it can automatically use it when using commands such as \`/pb\`.`
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                } else if (interaction.values == 'invite-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/invite`)
                        .setDescription(`Get a link to invite the bot to your server.`)
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                } else if (interaction.values == 'pb-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/pb`)
                        .setDescription(
                            `Use this command to check your Personal Best on a specified map.\nExample:\n\`\`\`/pb kz_lionharder\n\`\`\``
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                } else if (interaction.values == 'wr-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/wr`)
                        .setDescription(
                            `Check the current World Record on a specified map for one or multiple modes.\nExample:\n\`\`\`/wr kz_lionharder\n\`\`\``
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                } else if (interaction.values == 'maptop-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/maptop`)
                        .setDescription(
                            `Check the current Top 10 Leaderboard on a specified map and mode. You can also specify a runtype if you want.\nExample:\n\`\`\`\n/maptop kz_lionharder skz\n\`\`\``
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                } else if (interaction.values == 'bpb-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/bpb`)
                        .setDescription(
                            `Check your Personal Best on a Bonus Course of a specified Map.\nExample:\n\`\`\`\n/bpb kz_lionharder 1\n\`\`\``
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                } else if (interaction.values == 'bwr-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/bwr`)
                        .setDescription(
                            `Check the current World Record on a Bonus Course of a specified map.\nExample:\n\`\`\`\n/bwr kz_lionharder 1\n\`\`\``
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                } else if (interaction.values == 'bmaptop-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/bmaptop`)
                        .setDescription(
                            `Check the current Top 10 Leaderboard on a Bonus Course of a specified Map.\nExample:\n\`\`\`\n/bmaptop kz_lionharder 1\n\`\`\``
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                } else if (interaction.values == 'recent-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/recent`)
                        .setDescription(
                            `Check your own (or someone else's) latest Personal Best.\nExample:\n\`\`\`\n/recent AlphaKeks\n\`\`\``
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                } else if (interaction.values == 'top-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/top`)
                        .setDescription(
                            `Check who is currently holding the most World Records in a specified mode (and runtype if you want!).\nExample:\n\`\`\`\n/top kzt tp\n\`\`\``
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                } else if (interaction.values == 'profile-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/profile`)
                        .setDescription(
                            `Get an overview of a player's stats. You can check their map completion %, overall and avarage points, preferred mode and more.\nExample:\n\`\`\`\n/profile AlphaKeks\n\`\`\``
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                } else if (interaction.values == 'unfinished-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/unfinished`)
                        .setDescription(
                            `Check which maps you still need to finish in a specified mode.\nExample:\n\`\`\`\n/unfinished skz\n\`\`\``
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                } else if (interaction.values == 'nocrouch-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/nocrouch`)
                        .setDescription(
                            `Did you forget to crouch at the end of your jump? Don't worry, you can get an approximation of how far the jump would have been if you had crouched at the end of it. You just need to provide the actual distance that you jumped + your max speed. Note that this only works for jumps done on 128 tick servers.\nExample:\n\`\`\`\n/nocrouch 271.6793 368.07\n\`\`\`\nResult: \`283.1815\``
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                } else if (interaction.values == 'hasfilter-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/hasfilter`)
                        .setDescription(
                            `On some maps you can only submit times in certain modes. Check which modes can actually submit times on a specified map. Also works for bonuses!\nExample:\n\`\`\`\n/hasfilters kz_lionharder\n\`\`\``
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                } else if (interaction.values == 'map-value') {
                    let embed = new MessageEmbed()
                        .setColor('#7480c2')
                        .setTitle(`/map`)
                        .setDescription(
                            `Get information like tier, mapper, workshopID & more!\nExample:\n\`\`\`\n/map kz_lionharder\n\`\`\``
                        )
                        .setFooter({
                            text: `(͡ ͡° ͜ つ ͡͡°)7 | schnose.eu/church`,
                            iconURL: penisJoe,
                        });
                    return interaction.update({ embeds: [embed], ephemeral: true });
                }
            }
        }
    });
}

module.exports = commandReg;
