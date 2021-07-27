module.exports = {
  name: '', // Command name
  description: '', // Command description
  options: [
    {
      name: '', // Name of the argument
      description: '', // Description of the argument
      required: true, // true or false
      type: 3 // For types, you can read the doc here: https://discord.com/developers/docs/interactions/slash-commands#application-command-object-application-command-option-type
    },
  ], // Arguments of the command
  callback: () => {}, // callback function when the command is executed
}