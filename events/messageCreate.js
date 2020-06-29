const bot = require('../index');
const fs = require('fs');
const axios = require('axios').default;
const Path = require('path');

async function handler(msg){
	if(msg.author.bot) return;
	const settings = await bot.db.settings.findOne({});
	if(!settings) return console.log('Unable to find bot settings.');

	let attachments = msg.attachments;
	if(attachments.length && msg.channel.guild.id === settings.guild && settings.logEnabled && settings.logChannel){
		let channel = msg.channel.guild.channels.get(settings.logChannel);
		if(!channel) return console.log('invalid log channel in db.');
		
		let videoTypes = ['mp4', 'flv', 'avi', 'wmv', 'mov'];
		let imageTypes = ['png', 'jpeg', 'jpg'];
		let gifTypes = ['gif'];
		for(const attachment of attachments){
			if(attachment.size >= 1024 * 1024 * 8) continue;
			
			let extension = attachment.filename.split('.')[1];
			if( videoTypes.includes(extension) ){
			//     ^^ common video types
			// we download the vieo fist from discord, save it, *upload it* <-- not yet then delete it, same idea for others.
				await download(attachment.url, attachment.filename); // <---- downloading it from discord
				const path = Path.resolve(__dirname, '../downloads', attachment.filename);
				let video = await fs.readFileSync(path); // <---- getting the file from storage
				if(!video) continue;
                
				const embed = makeVideoEmbed(msg, attachment.filename);
				await channel.createMessage({embed});
				await channel.createMessage('', {file: video, name: attachment.filename});
				// deleting the file.
				await fs.unlinkSync(path);
				continue;
			}
			if( imageTypes.includes(extension) ){							
			// ^^ common video types, we can download it but thats redundant.
				const embed = makeEmbed(msg, attachment, 'image');
			
				let imgBuffer = await getImageBuffer(attachment.url);
				await channel.createMessage({embed}, {file: imgBuffer, name: attachment.filename});
				continue;
			}
			if(gifTypes.includes(extension)){
				await download(attachment.url, attachment.filename); // <---- downloading it from discord
				const path = Path.resolve(__dirname, '../downloads', attachment.filename);
				let gif = await fs.readFileSync(path); // <---- getting the file from storage
				if(!gif) continue;
				// console.log(video); // <--- file buffer here, works
				const embed = makeEmbed(msg, attachment, 'gif');
				await channel.createMessage({embed}, {file: gif, name: attachment.filename});
				// deleting the file.
				await fs.unlinkSync(path);
				continue;
			}
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
function makeEmbed(msg, attachment, type){
	const embed = { // `${msg.author.username} Uploaded ${msg.attachments.length} ${msg.attachments.length > 1 ? `$: 's'}`
		title: `${msg.author.username} Uploaded ${type === 'image' ? 'an' : 'a'} ${type}` , // Title of the embed
		author: { // Author property
			name: msg.author.username,
			icon_url: msg.author.avatarURL
		},
		color: 0x008000, // Color, either in hex (show), or a base-10 integer
		image: {
			url: `attachment://${attachment.filename}`
		},
		fields: [ // Array of field objects
			{
				name: 'User ID', // Field title
				value: msg.author.id,
				inline: true // Whether you want multiple fields in same line
			},
			{
				name: 'Message ID',
				value: `${msg.id} | [link](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id})`,
				inline: true
			}
		],
		footer: { // Footer text
			text: '#' + msg.channel.name
		}
	};
	return embed;
}
function makeVideoEmbed(msg){
	const embed = { // `${msg.author.username} Uploaded ${msg.attachments.length} ${msg.attachments.length > 1 ? `$: 's'}`
		title: `${msg.author.username} Uploaded a video` , // Title of the embed
		author: { // Author property
			name: msg.author.username,
			icon_url: msg.author.avatarURL
		},
		color: 0x008000, // Color, either in hex (show), or a base-10 integer
		fields: [ // Array of field objects
			{
				name: 'User ID', // Field title
				value: msg.author.id,
				inline: true // Whether you want multiple fields in same line
			},
			{
				name: 'Message ID',
				value: `${msg.id} | [link](https://discordapp.com/channels/${msg.channel.guild.id}/${msg.channel.id}/${msg.id})`,
				inline: true
			}
		],
		footer: { // Footer text
			text: '#' + msg.channel.name
		}
	};
	return embed;
}
async function download(url, name) {
	const path = Path.resolve(__dirname, '../downloads', name);
	const writer = fs.createWriteStream(path);

	const response = await axios({
		url,
		method: 'GET',
		responseType: 'stream'
	});

	response.data.pipe(writer);

	return new Promise((resolve, reject) => {
		writer.on('finish', resolve);
		writer.on('error', reject);
	});
}

module.exports = {
	event: 'messageCreate',
	enabled: true,
	handler: handler,
};