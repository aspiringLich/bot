import {
    Client as _Client,
    Collection,
    Events,
    GatewayIntentBits,
} from "discord.js";
import { token } from "../config.json";
import { deployCommands, getCommands } from "./deploy";

interface Client extends _Client {
    commands?: Collection<string, any>;
}
const client: Client = new _Client({ intents: [GatewayIntentBits.Guilds] });

const commands = getCommands();
if (process.argv.includes("--deploy")) {
    deployCommands(commands, false);
}

if (process.argv.includes("--deploy-global")) {
    deployCommands(commands, true);
}

client.commands = new Collection();

for (const command of commands) {
    client.commands.set(command.data.name, command.execute);
}

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
            await interaction.followUp({
                content: `There was an error while executing this command: ${e.message}`,
                ephemeral: true,
            });
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

client.once(Events.ClientReady, (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
});

client.login(token);
