const bot = require('../index');

module.exports.generator = async (msg, args) => {
	const settings = await bot.db.settings.findOne({});
	if(!settings) return msg.channel.createMessage('Unable to find bot settings.');
    
	await updatePrefix(msg.channel.guild, args[0]);
	return msg.channel.createMessage(`Set the prefix to ${args[0]}`);
};
async function updatePrefix(guild, prefix){
	await bot.registerGuildPrefix(guild.id, [prefix, '@mention']);
	await bot.db.settings.update({}, { $set: {guild: guild.id} }, {});
	await bot.db.settings.update({}, { $set: {prefix: prefix} }, {});
	return;
}
module.exports.options = {
	name: 'prefix',
	description: 'Update the bot\'s prefix.',
	enabled: true,
	aliases: ['p'],
	fullDescription:'Change the prefix for the bot.',
	usage:'L!',
	argsRequired: true,
	guildOnly: true,
	requirements: {
		userIDs: ['517012288071401476', '143414786913206272']
	}
};