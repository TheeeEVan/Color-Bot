'use strict';

// Import modules
const Discord = require('discord.js')
const namer = require('color-namer')
const isHexColor = require( 'validate.io-color-hexadecimal' )
const fs = require("fs")
var colorRoles = require('./colorRoles.json')

// Create an instance of a Discord client
const client = new Discord.Client()

// init vars
const prefix = "_"

client.on('ready', () => {
  console.log('I am ready!')
})

client.on('message', (msg) => {
    if (!colorRoles[msg.guild.id])
    {
        colorRoles[msg.guild.id] = {}
    }

    if (msg.content.startsWith(prefix + "color"))
    {
        const HighestRole = msg.guild.me.roles.highest; // Your bot's highest role in the Guid.

        let args = msg.content.split(" ")
        let color

        if (isHexColor(args[1]))
        {   
            if (args[1].startsWith("#"))
            {
                color = namer(args[1])
            } else {
                color = namer("#" + args[1])
            }

            if (colorRoles[msg.guild.id][msg.member.id])
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
                    hoist: true,
                    position: HighestRole.position
                    }
                })
                .then(r => msg.member.roles.add(r))
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
            msg.reply("That's not a valid hex color! Make sure to include all six characters.")
        }
    }

    fs.writeFile("colorRoles.json", JSON.stringify(colorRoles), err => {
     
        // Checking for errors
        if (err) throw err
    });
})

// Log our bot in using the token from https://discord.com/developers/applications
client.login('ODM5MTUxMDEzMTY3MzY2MTU0.YJFeSA.cia-EGMmJ8_uw7UpJ7K6Wtpe4Eg')