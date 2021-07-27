const path = require('path');
const guildId = ''; // Your guild ID here (optional)
const fs = require('fs');

// Create a function to get the slash commands from the Discord API
const getApp = (client, guildId) => {
  const app = client.api.applications(client.user.id);

  // The guild ID is optional. If a guild ID is included, the command registered will be specific
  // for that guild only, but if there is no guild ID included, the global slash command
  // may takes up to an hour to be visible to all of the servers that your bot is in
  if (guildId) {
    app.guilds(guildId);
  };

  return app;
};

// Creating the slash command files reader
module.exports = async (client) => {
  // Declare the base slash command handler
  const baseFile = 'slash-commands-handler.js';
  const slashCommandBase = require(`./${baseFile}`);

  // Declare an empty array to store all of the commands
  const slashCommands = [];

  // This is the function to read all of the commands in the "Commands" folder
  const readSlashCommands = async (dir) => {
    // Getting all the files in the "Commands" folder
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
      // Getting the stats of the files
      const stat = fs.lstatSync(path.join(__dirname, dir, file));
      // If the stat variable is a directory
      if (stat.isDirectory()) {
        readSlashCommands(path.join(__dirname, file));
      } else if (file !== baseFile && file !== 'load-slash-commands.js' && file !== 'slash-command-example.js') {
        // Getting the command in a file
        const option  = require(path.join(__dirname, dir, file));
        // Push the command to the "slashCommands" array
        slashCommands.push(option);
        // Registering the command with the slash command handler
        slashCommandBase(client, option);
      };
    };
  };

  // Call the function so it can read the commands
  readSlashCommands('.');

  const commands = await getApp(client, guildId).commands.get();

  // This part of code will automatically delete the command in the Discord API if the command file 
  // is deleted in the "Commands" folder
  const slashCmdsName = [];
  const cmdsName = [];

  for (const slashCommand of slashCommands) {
    slashCmdsName.push(slashCommand.name);
  };
  for (const command of commands) {
    cmdsName.push(command.name);
  };

  // Checking to see if any files are deleted in the "Commands" folder
  if (slashCommands.length < commands.length) {
    // Getting the command that is deleted in the folder
    const result = cmdsName.filter(async item => {
      if (!slashCmdsName.includes(item)) {
        const commandToDelete = commands.filter((cmd) => {
          return cmd.name === item;
        });

        for (const cmdToDelete of commandToDelete) {
          console.log(`Deleting slash command: ${cmdToDelete.name}`);
          await getApp(client, guildId).commands(cmdToDelete.id).delete();
        };
      };
    });
  };

  // Post every command in the "Commands" folder to the Discord API
  for (const cmd of slashCommands) {
    await getApp(client, guildId).commands.post({
      data: {
        name: cmd.name,
        description: cmd.description,
        options: cmd.options,
      },
    });
  };

  // Logging the registered commands from the API
  for (const command of commands) {
    // Giving the logs a cleaner look
    console.log('\n');
    console.log('Registering slash command:');
    console.log(`Name: ${command.name}`);
    console.log(`ID: ${command.id}`);
  };
  // Logging the number of slash commands registered
  console.log('\n');
  console.log(`Total slash commands registered: ${commands.length}`);

  return slashCommands;
};