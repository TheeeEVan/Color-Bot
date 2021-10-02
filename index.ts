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

// import saved data
var userColors = require('./userColors.json')
var serverSettings = require('./serverSettings.json')
var allRoles = require('./allRoles.json')

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

    commands?.create({
        name: 'color',
        description: 'Changes your color to the provided hex code.',
        options: [
            {
                name: 'color',
                description: 'Hex code of the wanted color',
                required: true,
                type: DiscordJS.Constants.ApplicationCommandOptionTypes.STRING
            }
        ]
    })

    commands?.create({
        name: 'reset',
        description: 'Reset your color to the server default.'
    })

    commands?.create({
        name: 'invite',
        description: 'Sends Color Bot invite link.'
    })
})

client.on('messageCreate', (message) => {
    // check if guild json data exists, otherwise create an entry     
    if (!userColors[message.guild.id])
    {
        userColors[message.guild.id] = {}
    }

    if (!serverSettings[message.guild.id])
    {
        serverSettings[message.guild.id] = {}
    }

    if (!allRoles[message.guild.id])
    {
        allRoles[message.guild.id] = {}
    }

    // check if message uses prefix
    if (message.content.startsWith(prefix))
    {
        // split the message by spaces and _
        let command = message.content.split(/[_\s]+/)
        command.shift()
        
        // check for commands
        // help command
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

        // color command
        if (command[0] == "color")
        {
            const HighestRole = message.guild.me.roles.highest

            let color

            if (regex.test(command[1]))
            {
                if (command[1].startsWith("#"))
                {
                    color = colorNamer(command[1])
                } else {
                    color = colorNamer("#" + command[1])
                }

                if (userColors[message.guild.id][message.member.id] != null)
                {
                    let role = message.guild.roles.cache.find(x => x.name === userColors[message.guild.id][message.member.id])
                    message.member.roles.remove(role.id)
                    allRoles[message.guild.id][role.name]--
                }

                let roleName = color.ntc[0].name
                let role = message.guild.roles.cache.find(x => x.name === roleName)
                if (role == undefined)
                {
                    message.guild.roles.create({
                        name: roleName,
                        color: color.ntc[0].hex,
                        hoist: false,
                        position: HighestRole.position
                    })
                    .then(r => message.member.roles.add(r))
                    .catch(console.error)

                    allRoles[message.guild.id][roleName] = 1
                }

                else {
                    message.member.roles.add(role.id)    
                    allRoles[message.guild.id][roleName]++
                }
                
                userColors[message.guild.id][message.member.id] = color.ntc[0].name

                message.channel.send({
                    embeds: [
                        new DiscordJS.MessageEmbed()
                            .setColor(color.ntc[0].hex)
                            .setTitle("Color Role Added!")
                            .setDescription("Your color is now " + color.ntc[0].name + " (#" + color.ntc[0].hex + ")")
                            .setFooter("The bot gives the closest color with a name")
                            .setTimestamp()
                    ]
                })
            } else {
                message.reply("That's not a valid hex color! Make sure to include a #")
            }

            message.delete()
        }

        else if (command[0] == "reset")
        {
            if (userColors[message.guild.id][message.member.id] != null)
            {
                let role = message.guild.roles.cache.find(x => x.name == userColors[message.guild.id][message.member.id])
                message.member.roles.remove(role.id)
                allRoles[message.guild.id][role.name]--
                delete userColors[message.guild.id][message.member.id]

                message.channel.send({
                    embeds: [
                        new DiscordJS.MessageEmbed()
                        .setTitle("Reset your color!")
                        .setColor(randomHex.generate())
                        .setTimestamp()
                    ]
                })
            }
        }

        if (command[0] == "invite")
        {
            message.reply({
                content: "https://discord.com/api/oauth2/authorize?client_id=839151013167366154&permissions=275146385408&scope=bot%20applications.commands"
            })
        }

        // write all updates
        fs.writeFile("userColors.json", JSON.stringify(userColors), err => {
        
            // Checking for errors
            if (err) throw err
        });

        fs.writeFile("serverSettings.json", JSON.stringify(serverSettings), err => {
    
            // Checking for errors
            if (err) throw err
        });

        fs.writeFile("allRoles.json", JSON.stringify(allRoles), err => {
            // Checking for errors
            if (err) throw err
        })
    }
})

// interaction listner
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isCommand())
    {
        return
    }

    const { commandName, options, channel, guild } = interaction

    let user = interaction.member.user.id
    let member = client.guilds.cache.get(interaction.guild.id).members.cache.get(user)
    
    if (!userColors[guild.id])
    {
        userColors[guild.id] = {}
    }

    if (!serverSettings[guild.id])
    {
        serverSettings[guild.id] = {}
    }

    if (!allRoles[guild.id])
    {
        allRoles[guild.id] = {}
    }

    // help command
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

    if (commandName == "color")
    {   
        const colorOption = options.getString('color')
        const HighestRole = guild.me.roles.highest

            let color

            if (regex.test(colorOption))
            {
                if (colorOption.startsWith("#"))
                {
                    color = colorNamer(colorOption)
                } else {
                    color = colorNamer("#" + colorOption)
                }

                if (userColors[guild.id][member.id] != null)
                {
                    let role = guild.roles.cache.find(x => x.name === userColors[guild.id][member.user.id])
                    member.roles.remove(role.id)
                    allRoles[guild.id][role.name]--
                }

                let roleName = color.ntc[0].name
                let role = guild.roles.cache.find(x => x.name === roleName)
                if (role == undefined)
                {
                    guild.roles.create({
                        name: roleName,
                        color: color.ntc[0].hex,
                        hoist: false,
                        position: HighestRole.position
                    })
                    .then(r => member.roles.add(r))
                    .catch(console.error)

                    allRoles[guild.id][roleName] = 1
                }

                else {
                    member.roles.add(role.id)    
                    allRoles[guild.id][roleName]++
                }
                
                userColors[guild.id][member.id] = color.ntc[0].name

                interaction.reply({
                    embeds: [
                        new DiscordJS.MessageEmbed()
                            .setColor(color.ntc[0].hex)
                            .setTitle("Color Role Added!")
                            .setDescription("Your color is now " + color.ntc[0].name + " (#" + color.ntc[0].hex + ")")
                            .setFooter("The bot gives the closest color with a name")
                            .setTimestamp()
                    ],
                    ephemeral: false
                })
            } else {
                interaction.reply({
                    content: "That's not a valid hex color! Make sure to include a #",
                    ephemeral: true
                })
            }
    }

    if (commandName == "reset")
    {
        if (userColors[guild.id][member.id] != null)
            {
                let role = guild.roles.cache.find(x => x.name == userColors[guild.id][member.id])
                member.roles.remove(role.id)
                allRoles[guild.id][role.name]--
                delete userColors[guild.id][member.id]

                interaction.reply({
                    embeds: [
                        new DiscordJS.MessageEmbed()
                        .setTitle("Reset your color!")
                        .setColor(randomHex.generate())
                        .setTimestamp()
                    ],
                    ephemeral: true
                })
            }
    }

    if (commandName == "invite")
    {
        interaction.reply({
            content: "[Invite Me!](https://discord.com/api/oauth2/authorize?client_id=839151013167366154&permissions=275146385408&scope=bot%20applications.commands)"
        })
    }

    // write all updates
    fs.writeFile("userColors.json", JSON.stringify(userColors), err => {
        // Checking for errors
        if (err) throw err
    });

    fs.writeFile("serverSettings.json", JSON.stringify(serverSettings), err => {
        // Checking for errors
        if (err) throw err
    });

    fs.writeFile("allRoles.json", JSON.stringify(allRoles), err => {
        // Checking for errors
        if (err) throw err
    })
})

client.login(process.env.TOKEN)