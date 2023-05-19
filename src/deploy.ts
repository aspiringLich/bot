import { REST, Routes, SlashCommandBuilder } from "discord.js";
import { clientID, guildID, token } from "../config.json";
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert";
import { Command, CommandExecutor } from "./types";

export function getCommands(): Command[] {
    let commands: Command[] = [];
    // Grab all the command files from the commands directory you created earlier
    const commandsPath = path.join(__dirname, "../commands");
    const commandFiles = fs
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".ts"));

    // Grab the SlashCommandBuilder#toJSON() output of each command's data for deployment
    for (const file of commandFiles) {
        const filePath = path.join(commandsPath, file);
        const command = require(filePath);
        try {
            assert(
                "data" in command,
                `is missing a required \"data\" property.`
            );
            assert(
                command.data.toJSON() satisfies SlashCommandBuilder,
                `"data" property is not a valid SlashCommandBuilder.`
            );
            assert(
                "execute" in command,
                `is missing a required \"execute\" property.`
            );
            assert(
                command.execute satisfies CommandExecutor,
                `"execute" property is not a valid CommandExecutor.`
            );
            commands.push(command as Command);
        } catch (e) {
            console.error(`The command at ${filePath}: ${e.message}`);
        }
    }

    return commands;
}

export async function deployCommands(commands: Command[]) {
    // Construct and prepare an instance of the REST module
    const rest = new REST().setToken(token);

    // and deploy your commands!
    (async () => {
        try {
            console.log(
                `Started refreshing ${commands.length} application (/) commands.`
            );
            const commandsData = commands.map((command) => command.data.toJSON());

            let data: any;
            if (process.argv.includes("--global")) {
                // The put method is used to fully refresh all commands
                data = await rest.put(Routes.applicationCommands(clientID), {
                    body: commandsData,
                });
            } else {
                // The put method is used to fully refresh all commands in the guild with the current set
                data = await rest.put(
                    Routes.applicationGuildCommands(clientID, guildID),
                    {
                        body: commandsData,
                    }
                );
            }

            console.log(
                `Successfully reloaded ${data.length} application (/) commands.`
            );
        } catch (error) {
            // And of course, make sure you catch and log any errors!
            console.error(error);
        }
    })();
}
