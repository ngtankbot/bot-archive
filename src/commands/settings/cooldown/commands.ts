import { Prisma, servers } from '@prisma/client'
import {
    ChatInputCommandInteraction,
    SlashCommandStringOption,
    SlashCommandSubcommandBuilder,
} from 'discord.js'
import commandSuccessEmbedBuilder from '@tankbot/builders/embeds/commandSuccessEmbedBuilder.js'
import userErrorEmbedBuilder from '@tankbot/builders/embeds/userErrorEmbedBuilder.js'
import prisma from '@tankbot/clients/prisma.js'

export const data = new SlashCommandSubcommandBuilder()
    .setName('commands')
    .setDescription('Add or remove commands')
    .addStringOption(arg1)

function arg1(option: SlashCommandStringOption) {
    return option
        .setName('command')
        .setDescription('Format should be {category}_{command}')
        .setRequired(true)
}

const allCommands: string[] = []

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapCommands(command: any) {
    for (const subcommand of command.data.options) {
        if (subcommand.options.some(Boolean)) {
            for (const subCommandOptions of subcommand.options) {
                if (!subCommandOptions.type) {
                    allCommands.push(
                        `${command.data.name}_${subcommand.name}_${subCommandOptions.name}`
                    )
                }
            }
        } else {
            allCommands.push(`${command.data.name}_${subcommand.name}`)
        }
    }
}

export async function execute(interaction: ChatInputCommandInteraction) {
    const arg1 = interaction.options.getString('command')
    /* eslint-disable @typescript-eslint/no-non-null-assertion */

    interaction.client.commands.each(mapCommands)

    if (!allCommands.includes(arg1!)) {
        await interaction.reply({
            embeds: [new userErrorEmbedBuilder().create('Command not found.')],
        })
        return
    }

    /* eslint-enable */

    const query = (
        (await prisma.servers.findUnique({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            where: { id: BigInt(interaction.guildId!) },
            select: { settings: true },
        })) as servers
    )?.settings as Prisma.JsonObject

    const commands = (query?.cooldown as Prisma.JsonObject).commands as string[]

    /* eslint-disable @typescript-eslint/no-non-null-assertion */
    if (commands?.includes(arg1!)) {
        ;((query.cooldown as Prisma.JsonObject).commands as string[]) =
            commands.filter((item) => item !== arg1!)
    } else {
        ;((query.cooldown as Prisma.JsonObject)?.commands as string[]).push(
            arg1!
        )
    }
    /* eslint-enable */

    prisma.servers
        .update({
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            where: { id: BigInt(interaction.guildId!) },
            data: { settings: query },
        })
        .then(async () => {
            await interaction.reply({
                embeds: [
                    new commandSuccessEmbedBuilder().create(
                        'Settings has been changed'
                    ),
                ],
            })
        })
}
