require('dotenv').config();

const Discord = require('discord.js');

const client = new Discord.Client();

client.on('ready', () => {
  console.log(`${client.user.tag} has logged in!`);
});

client.login(process.env.TOKEN);
