module.exports = {
    name: 'messageCreate',

    execute(message) {
        try {
            if (
                message.content.includes(
                    'https://media.discordapp.net/attachments/932012064266940496/932223277554892810/61gknp.gif'
                )
            ) {
                message.delete();
                message.channel.send('no');
            }
        } catch (err) {
            console.log(err);
        }
    },
};
