const bot = require('../index');

module.exports.generator = async (msg, args) => {
	// load bot sttings
	const settings = await bot.db.settings.findOne({});
	if(!settings) return sent.edit('Unable to bot settings.');
	let query = args.join(' ');
	let sent = await msg.channel.createMessage('setting up...');
	// resolve channel
	let channel = resolveChannel(query, msg.channel.guild);
	if(!channel) return msg.channel.createMessage('I Couldnt find that channel.');
	// make sure bot has appropriate perms in the channel
	let perms = channel.permissionsOf(bot.user.id);
	if( !perms.has('readMessages') || !perms.has('sendMessages') || !perms.has('attachFiles') || !perms.has('embedLinks')) return sent.edit(`Check my permisssions in ${channel.mention} and try again.`);
	// set it up, and save to db!
	await setupLogs(channel.id, msg.channel.guild);
	return sent.edit(`Set ${channel.mention} as the log channel`);
};
function resolveChannel(string, guild){
	let channel = guild.channels.get(string) || guild.channels.find(channel => channel.mention === string) || guild.channels.find(channel => channel.name === string);

	return channel;
}
async function setupLogs(channelID, guild){
	await bot.db.settings.update({}, { $set: {logChannel: channelID} }, {});
	await bot.db.settings.update({}, { $set: {setup: true} }, {});
	await bot.db.settings.update({}, { $set: {logEnabled: true} }, {});
	await bot.db.settings.update({}, { $set: {guild: guild.id} }, {});
    
}
module.exports.options = {
	name: 'setup',
	description: 'Sets the bot up',
	enabled: true,
	aliases: ['start', 'enable'],
	fullDescription:'Sets the log channel, and enables logging.',
	usage:'#channel',
	argsRequired: true,
	guildOnly: true,
	requirements: {
		userIDs: ['517012288071401476', '143414786913206272']
	}
};