const guildId = '';
const Discord = require('discord.js');

module.exports = async (client, commandOptions) => {

  // Required parameters for the command
  let {
    name,
    description,
    options = [], // default will be an array
    callback, // callback function when the slash command is executed
  } = commandOptions;

  const getApp = (guildId) => {
    const app = client.api.applications(client.user.id) // Connecting to the Discord API

    if (guildId) {
      app.guilds(guildId);
    }; 
    // The guild ID is optional. If a guild ID is included, the command registered will be specific
    // for that guild only, but if there is no guild ID included, the global slash command
    // may takes up to an hour to be visible to all of the servers that your bot is in

    return app;
  };

  // this function handles embeds
  const createAPIMessage = async (interaction, content) => {
    // destructing data and files from the APIMessage of Discord
    const { data, files } = await Discord.APIMessage.create(
      client.channels.resolve(interaction.channel_id),
      content,
    )
    .resolveData()
    .resolveFiles()

    return { ...data, files };
  };

  // Instead of writing every response to the slash command with client.api.interations,
  // what we could do is to create a reply function to simplify the whole reply process of the command
  const reply = async (interaction, response) => {
    // let the data be the response to the command
    let data = {
      content: response,
    };

    // If the response to the command is an embed
    if (typeof response === 'object') {
      // creates an API message to handle the embed
      data = await createAPIMessage(interaction, response);
    };

    // The reply method of the slash command
    client.api.interactions(interaction.id, interaction.token).callback.post({
      // posts the command to the Discord API
      data: {
        type: 4,
        data, // The data that we created earlier
      },
    });
  };

  // Listens for an interaction of the slash command
  client.ws.on('INTERACTION_CREATE', async (interaction) => {
    // Destructing options and name from the data of the interaction
    const { options, name: commandName } = interaction.data;

    // In case someone typed "pING" it would stil register as "ping" thanks to the toLowerCase() function
    const command = commandName.toLowerCase();

    // Declare an array of arguments in case a command includes arguments
    const args = [];

    // If there are options included, the options will transform into arguments stored in an array 
    // just like normal commands
    if (options) {
      for (const option of options) {
        const { name, value } = option;
        args.push(value);
      };
    };

    // If the name of the interaction is equal to the command name, it will execute the response
    if (command === name) {
      reply(interaction, callback(args, client));
    };
  });
};