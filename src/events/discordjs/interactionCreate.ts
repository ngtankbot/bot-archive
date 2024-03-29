import {
    ChatInputCommandInteraction,
    Interaction,
    InteractionType,
} from 'discord.js'
import * as cooldown from '@tankbot/util/cooldown.js'
import * as createDatabase from '@tankbot/util/createDatabase.js'
import commandErrorEmbedBuilder from '@tankbot/builders/embeds/commandErrorEmbedBuilder.js'

export const name = 'interactionCreate'

export const once = false

export async function execute(interaction: Interaction) {
    if (interaction.type !== InteractionType.ApplicationCommand) return

    const command = interaction.client.commands.get(interaction.commandName)

    if (!command) return

    await createDatabase.interactionPreCreate(
        interaction as ChatInputCommandInteraction
    )

    if (await cooldown.check(interaction as ChatInputCommandInteraction)) return

    try {
        await command.execute(interaction)
    } catch (error) {
        console.error(error)
        await interaction.reply({
            embeds: [
                new commandErrorEmbedBuilder().create(`\`\`\`${error}\`\`\``),
            ],
        })
    }

    cooldown.create(interaction as ChatInputCommandInteraction)
}
