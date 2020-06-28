const bot = require('../index');
const fs = require('fs');
const axios = require('axios').default;

async function handler(msg){
    if(msg.author.bot) return;
    const settings = await bot.db.settings.findOne({});
    if(!settings) return console.log('Unable to find bot settings.');

    let attachments = msg.attachments;
    if(attachments.length && msg.channel.guild.id === settings.guild && settings.logEnabled && settings.logChannel){
        let channel = msg.channel.guild.channels.get(settings.logChannel);
        if(!channel) return console.log('invalid log channel in db.');
        for(const img of attachments){
            const embed = makeEmbed(msg, img);
            let imgBuffer = await getImageBuffer(img.url);
            if(img.size <= 1024 * 1024 * 8 /*&& (img.filename.endsWith('png') || img.filename.endsWith('jpg') || img.filename.endsWith('jpeg'))*/) await channel.createMessage({embed}, {file: imgBuffer, name: img.filename});
        }
    }
}

async function getImageBuffer(url){
    const {data} = await axios({
        url,
        method: 'GET',
        responseType: 'arraybuffer'
      });
      return data;
}
function makeEmbed(msg, img){
    const embed = {
        title: `${msg.author.username} Uploaded ${msg.attachments.length} ${msg.attachments.length > 1 ? 'attachments.' : 'attachment.'}`, // Title of the embed
        author: { // Author property
            name: msg.author.username,
            icon_url: msg.author.avatarURL
        },
        color: 0x008000, // Color, either in hex (show), or a base-10 integer
        image: {
            url: `attachment://${img.filename}`
        },
        fields: [ // Array of field objects
            {
                name: "User ID", // Field title
                value: msg.author.id,
                inline: true // Whether you want multiple fields in same line
            },
            {
                name: "Message ID",
                value: `${msg.id} | [link](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id})`,
                inline: true
            }
        ],
        footer: { // Footer text
            text: '#' + msg.channel.name
        }
    }
    return embed;
}

module.exports = {
	event: 'messageCreate',
	enabled: true,
	handler: handler,
};