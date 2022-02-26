module.exports = {
    name: 'messageCreate',

    execute(message) {
        if (message.content.startsWith('bing?')) {
            let result = Math.random() < 0.69;

            if (result == true) {
                message.reply('chilling 🍦');
            } else {
                message.reply('no 😔');
            }
        }
    },
};
