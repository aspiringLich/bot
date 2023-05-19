const { SlashCommandBuilder } = require("discord.js");

export const data = new SlashCommandBuilder()
    .setName("insult")
    .setDescription("Insults a user")
    .addMentionableOption((option) =>
        option
            .setName("user")
            .setDescription("The user to insult")
            .setRequired(true)
    );
    
export async function execute(interaction) {
    console.log(typeof interaction)
    const user = interaction.options.getMentionable("user");
    
    await interaction.reply(`You're a poopyhead, ${user}!`);
}
