import { SlashCommandBuilder } from '@discordjs/builders'
import { CommandInteraction } from 'discord.js'

import typescript from './info/typescript'

export const data = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Information')
    .addSubcommand((command) =>
        command.setName('typescript').setDescription('Welcome to typescript!')
    )

export async function execute(interaction: CommandInteraction): Promise<void> {
    switch (interaction.options.getSubcommand()) {
        case 'typescript': {
            await typescript(interaction)
        }
    }
}