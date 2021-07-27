require('dotenv').config();

const Discord = require('discord.js');

const client = new Discord.Client();

const loadSlashCommands = require('./slashCommands/load-slash-commands');

client.on('ready', () => {
  console.log(`${client.user.tag} has logged in!`);

  loadSlashCommands(client);
});

client.login(process.env.TOKEN);
