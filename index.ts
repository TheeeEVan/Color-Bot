// config enviroment vars
require("dotenv").config()

// import required packages
import DiscordJS, { ButtonInteraction, Intents, MessageActionRow, MessageButton, MessageComponentInteraction } from 'discord.js'

const colorNamer = require('color-namer')
const isHexColor = require('validate.io-color-hexadecimal')
const randomHex = require('random-hex')
const fs = require("fs")

// init variables
const prefix = "_"
const regex = new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")

// create discord client
const client = new DiscordJS.Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MEMBERS
    ]
})

client.on('ready', () => {
    console.log("Color Bot is Running!")

    // setup guild command, if guild unavailbile make global command manager
    const guildId = "892598403639443526"
    const guild = client.guilds.cache.get(guildId)
    let commands

    if (guild) {
        commands = guild.commands
    } else {
        commands = client.application?.commands
    }

    commands?.create({
        name: 'help',
        description: 'Gives a list of commands and their functions.'
    })
})

client.on('messageCreate', (message) => {
    // check if message uses prefix
    if (message.content.startsWith(prefix))
    {
        // split the message by spaces and _
        let command = message.content.split(/[_\s]+/)
        command.shift()
        
        // check for commands
        if (command[0] == "help")
        {
            if (command[1] == "admin")
            {
                message.channel.send({
                    embeds: [
                        new DiscordJS.MessageEmbed()
                            .setTitle("Color Bot Admin Help")
                            .setDescription("Coming Soon!")
                            .setColor(randomHex.generate())
                    ],
                })
            }

            else {
                message.channel.send({
                    embeds: [
                        new DiscordJS.MessageEmbed()
                        .setTitle("Color Bot Help")
                        .setDescription("List of Commands")
                        .setColor(randomHex.generate())
                        .addFields(
                            { name: "Help", value: "This Command!"},
                            { name: "Color", value: "Gives you a new color"},
                            { name: "Reset", value: "Resets color to default (Or non color server assigned role)"},
                            { name: "Invite", value: "Sends the link to invite this bot to your server!"},
                            { name: "Settings", value: "Server settings for the bot. Can be viewed by anyone. Can be edited if you have Manage Roles. (This is planned but not yet implemeted)"},
                        )
                    ]
                })
            }
        }
    }
})

// interaction listner
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand())
    {
        return
    }

    const { commandName, options, channel } = interaction

    if (commandName == "help")
    {
        const row = new MessageActionRow()
        .addComponents(
            new MessageButton()
            .setCustomId('adminMenu')
            .setLabel('Admin Commands')
            .setStyle('SECONDARY')
        )
        await interaction.reply({
            embeds: [
                new DiscordJS.MessageEmbed()
                .setTitle("Color Bot Help")
                .setDescription("List of Commands")
                .setColor(randomHex.generate())
                .addFields(
                    { name: "Help", value: "This Command!"},
                    { name: "Color", value: "Gives you a new color"},
                    { name: "Reset", value: "Resets color to default (Or non color server assigned role)"},
                    { name: "Invite", value: "Sends the link to invite this bot to your server!"},
                    { name: "Settings", value: "Server settings for the bot. Can be viewed by anyone. Can be edited if you have Manage Roles. (This is planned but not yet implemeted)"},
                )
            ],
            components: [row],
            ephemeral: true
        })

        const filter = (btnInt: ButtonInteraction) => {
            return interaction.user.id === btnInt.user.id
        }

        const collector = channel.createMessageComponentCollector({
            filter,
            max: 1,
            time: 1000 * 60
        })

        collector.on('end', async (collection) => {
            interaction.editReply({
                embeds: [
                    new DiscordJS.MessageEmbed()
                        .setTitle("Color Bot Admin Help")
                        .setDescription("Coming Soon!")
                        .setColor(randomHex.generate())
                ],
                components: []
            })
        })
    }
})

client.login(process.env.TOKEN)