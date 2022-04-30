# (͡ ͡° ͜ つ ͡͡°) Discord Bot

## GOKZ Commands in Discord

If you have any bugs to report or suggestions to make I would appreaciate it!
Feel free to message me on Discord: `AlphaKeks#9826`
I'm always happy about constructive criticism :)

---

## QUICKSTART

### Setup

1. Clone the repository with the following command:

```bash
$ git clone https://github.com/Schnose/SchnoseBot-DJS.git
```

2. Now create a `.env` file in the root directory of the repo and insert the following lines:

```
BOT_TOKEN=<your discord bot token>
DATABASE_TOKEN=<mongodb link>
```

> You can get your bot's token on [this](https://discord.com/developers/applications) website.

3. Set a mode in the `config.json`

```js
// will only register commands on 1 server
"testServer": "some guildID"
"mode": "DEV"

// will register commands globally
"mode": "PROD"
```

You want to set the mode to "DEV" when testing, registering commands globally can take up to an hour.

### How to use it

1. Invite the Bot to your Server with [this link](https://schnose.eu/bot).
2. Set your steamID with `/setsteam <steamID>`
3. Set your preferred gamemode with `/mode <mode>`
4. Use `/help` to get detailed information on all the commands.

If you want previews check out the [Wiki](https://github.com/Schnose/SchnoseBot-DJS/wiki).

---

## Credits

Shoutout to https://kzgo.eu/ for making our life much easier thanks to their custom API. Check out the website, it's much more detailed than this bot and has a lot more functionality!
