import fs from "node:fs";
import path from "node:path";
import { Client as _Client, Collection, CommandInteraction, Events, GatewayIntentBits, Interaction, InteractionCollector } from "discord.js";
import { token } from "../config.json";

interface Client extends _Client {
    commands?: Collection<string, any>;
}

const client: Client = new _Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commandsPath = path.join(__dirname, "../commands");
const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts"));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.warn(
            `The command at ${filePath} is missing a required "data" or "execute" property.`
        );
    }
}

console.info(`Loaded ${client.commands.size} command${client.commands.size == 1 ? "" : "s"}.`);

client.on(Events.InteractionCreate, async (interaction: any) => {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(
            `No command matching ${interaction.commandName} was found.`
        );
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
            await interaction.followUp({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        } else {
            await interaction.reply({
                content: "There was an error while executing this command!",
                ephemeral: true,
            });
        }
    }
});

client.login(token);