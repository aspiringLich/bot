import { SlashCommandBuilder } from '@discordjs/builders';

export type Command = { data: SlashCommandBuilder; execute: CommandExecutor };
export type CommandExecutor = (interaction: CommandInteraction) => Promise<void>;