import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { JSDOM } from "jsdom";

export const data = new SlashCommandBuilder()
    .setName("insult")
    .setDescription("Insults a user")
    .addMentionableOption((option) =>
        option
            .setName("user")
            .setDescription("The user to insult")
            .setRequired(true)
    );

export async function execute(interaction: CommandInteraction) {
    const user = interaction.options.getUser("user");

    const res = await fetch(
        `https://generatorfun.com/code/model/generatorcontent.php?recordtable=generator&recordkey=3&gen=Y&itemnumber=1&genimage=No&nsfw=No&tone=Normal`
    );
    if (!res.ok) {
        throw new Error(`Funny website down :(`);
    }
    let html = await res.text();
    let doc: Document = new JSDOM(html).window.document;
    let text = doc.body.querySelector("#gencont>div>p")?.innerHTML;

    if (!text) {
        throw new Error(`Yell at me to fix this`);
    }

    await interaction.reply({
        content: `${user} ${text}`,
    });
}
