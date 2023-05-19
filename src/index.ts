import fs from "node:fs";
import path from "node:path";
import {
    Client as _Client,
    Collection,
    Events,
    GatewayIntentBits,
} from "discord.js";
import { token } from "../config.json";
import { Command, CommandExecutor } from "./types";
import { deployCommands, getCommands } from "./deploy";

interface Client extends _Client {
    commands?: Collection<string, any>;
}

const client: Client = new _Client({ intents: [GatewayIntentBits.Guilds] });

client.commands = new Collection();

const commands = getCommands();
for (const command of commands) {
    client.commands.set(command.data.name, command.execute);
}
deployCommands(commands);

client.on(Events.InteractionCreate, async (interaction: any) => {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(
            `No command matching ${interaction.commandName} was found.`
        );
        return;
    }

    try {
        await command(interaction);
    } catch (error) {
        console.error(error);
        
        // intentional error
        if (error instanceof Error) {
            let e = error as Error;
            e.message = `Error executing command ${interaction.commandName}: ${e.message}`;
        } 
        // unintentional error
        else {
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
    }
});

client.login(token);
