const bot = require('../index');

module.exports.generator = async (msg, args) => {
	const settings = await bot.db.settings.findOne({});
	if(!settings) return sent.edit('Unable to bot settings.');
	let query = args.join(' ');
    let sent = await msg.channel.createMessage('Updating...');
	let channel = resolveChannel(query, msg.channel.guild);
    if(!channel) return msg.channel.createMessage('I Couldnt find that channel.');
	
	let perms = channel.permissionsOf(bot.user.id);
	if( !perms.has('readMessages') || !perms.has('sendMessages') || !perms.has('attachFiles') || !perms.has('embedLinks')) return sent.edit(`Check my permisssions in ${channel.mention} and try again.`)

	await updateLogChannel(channel.id);
	return sent.edit(`Updated the log channel to ${channel.mention}`);
};
function resolveChannel(string, guild){
	let channel = guild.channels.get(string) || guild.channels.find(channel => channel.mention === string) || guild.channels.find(channel => channel.name === string);

    return channel;
}
async function updateLogChannel(channelID){
	return bot.db.settings.update({}, { $set: {logChannel: channelID} }, {});
}
module.exports.options = {
	name: 'setlog',
	description: 'Changes the log channel.',
	aliases: ['sl', 'setlogchannel'],
	enabled: true,
	fullDescription:'Updates the channel where logs will be sent.',
	usage:'#channel',
	argsRequired: true,
	guildOnly: true,
	requirements: {
        userIDs: ['517012288071401476', '143414786913206272']
	}
};