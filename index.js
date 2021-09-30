'use strict';

// init enviroment vars
require('dotenv').config()

// Import modules
const Discord = require('discord.js')
const namer = require('color-namer')
const isHexColor = require('validate.io-color-hexadecimal')
const fs = require("fs")
var colorRoles = require('./colorRoles.json')
var allColors = require('./colors.json')
var settings = require('./settings.json')

// Create an instance of a Discord client
const client = new Discord.Client()

// init vars
const prefix = "_"
let regex = new RegExp("^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$")

client.on('ready', () => {
  console.log('I am ready!')
})

client.on('message', (msg) => {
    if (msg.channel.type != "dm")
    {
        // check if guild json data exists, otherwise create an entry 
        if (!colorRoles[msg.guild.id])
        {
            colorRoles[msg.guild.id] = {}
        } 
        
        if (!allColors[msg.guild.id])
        {
            allColors[msg.guild.id] = []
        }

        if (msg.content.startsWith(prefix + "help"))
        {
            msg.channel.send(new Discord.MessageEmbed()
            .setTitle("Color Bot Help")
            .setDescription("List of Commands")
            .addFields(
                { name: "Help", value: "This Command!"},
                { name: "Color", value: "Gives you a new color"},
                { name: "Reset", value: "Resets color to default (Or non color server assigned role)"},
                { name: "Invite", value: "Sends the link to invite this bot to your server!"},
                { name: "Settings", value: "Server settings for the bot. Can be viewed by anyone. Can be edited if you have Manage Roles. (This is planned but not yet implemeted)"},
            ))
        }

        // main color command
        if (msg.content.startsWith(prefix + "color" || prefix + "colour"))
        {
                const HighestRole = msg.guild.me.roles.highest

                let args = msg.content.split(" ")
                let color

                if (regex.test(args[1]))
                {   
                    if (args[1].startsWith("#"))
                    {
                        color = namer(args[1])
                    } else {
                        color = namer("#" + args[1])
                    }

                    if (colorRoles[msg.guild.id][msg.member.id] && colorRoles[msg.guild.id][msg.member.id] != null)
                    {
                        let role = msg.guild.roles.cache.find(x => x.name === colorRoles[msg.guild.id][msg.member.id])
                        msg.member.roles.remove(role.id)
                    }
                    colorRoles[msg.guild.id][msg.member.id] = color.ntc[0].name

                    let roleName = color.ntc[0].name;
                    let role = msg.guild.roles.cache.find(x => x.name === roleName);
                    if (role === undefined) {
                        msg.guild.roles.create({
                            data: {
                            name: roleName,
                            color: color.ntc[0].hex,
                            hoist: false,
                            position: HighestRole.position
                            }
                        })
                        .then(r => msg.member.roles.add(r))
                        .then(() => allColors[msg.guild.id].push(color.ntc[0].name))
                        .catch(console.error)
                    } 
                    
                    else {
                        msg.member.roles.add(role.id)
                    }

                    msg.channel.send(new Discord.MessageEmbed()
                    .setColor("#" + color.ntc[0].hex)
                    .setTitle("Color Role Added!")
                    .setDescription("Your color is now " + color.ntc[0].name + " (#" + color.ntc[0].hex + ")")
                    .setFooter("The bot gives the closest color with a name")
                    .setTimestamp())

                } else {
                    msg.reply("That's not a valid hex color! Make sure to include a #")
                }
            }
        

        // reset color to no custom color
        if (msg.content.startsWith(prefix + "reset"))
        {
            if (colorRoles[msg.guild.id][msg.member.id] && colorRoles[msg.guild.id][msg.member.id] != null)
                {
                    let role = msg.guild.roles.cache.find(x => x.name === colorRoles[msg.guild.id][msg.member.id])
                    msg.member.roles.remove(role.id)
                }
            colorRoles[msg.guild.id][msg.member.id] = null

            msg.channel.send(new Discord.MessageEmbed()
            .setTitle("Reset your color!")
            .setTimestamp())
        }

        // send a link to invite the bot
        if (msg.content.startsWith(prefix + "invite"))
        {
            msg.channel.send(new Discord.MessageEmbed()
            .addField("Invite Link:", "[Here!](https://discord.com/api/oauth2/authorize?client_id=839151013167366154&permissions=268437504&scope=bot)"))
        }
    }

    // write all updates
    fs.writeFile("colorRoles.json", JSON.stringify(colorRoles), err => {
     
        // Checking for errors
        if (err) throw err
    });

    fs.writeFile("colors.json", JSON.stringify(allColors), err => {
     
        // Checking for errors
        if (err) throw err
    });
})

// Log our bot in using the token from https://discord.com/developers/applications
client.login(process.env.TOKEN)