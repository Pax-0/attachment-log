const bot = require('../index');

async function handler(guild, member){
	if(member.bot) return;

	const settings = await bot.db.settings.findOne({});
	if(!settings) return console.log('Bot settings not found.');
	if(!settings.modules.welcome.enabled) return;

	const channel = await bot.getChannel(settings.modules.welcome.channelID);
	if(!channel) return console.log('welcome log channel not found.');
	
	const embed = makeEmbed(guild, member, settings);
	return channel.createMessage({embed});
}

// eslint-disable-next-line no-unused-vars
function makeEmbed(guild, member, settings){
	const customText = settings.modules.welcome.message ? settings.modules.welcome.message : 'Enjoy your stay!';
	const embed = {
		title:`Welcome to ${guild.name}`,
		description:`${member.mention} ${customText}`,
		footer: {
			icon_url: member.iconURL,
		},
		color:'3066993',
		timestamp: new Date(),

	};
	return embed;
}
module.exports = {
	event: 'guildMemberAdd',
	enabled: true,
	handler: handler,
};