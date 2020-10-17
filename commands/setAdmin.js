const bot = require('../index');

module.exports.generator = async (msg, args) => {
	// load bot sttings
	const settings = await bot.db.settings.findOne({});
	if(!settings) return msg.channel.createMessage('Unable to bot settings.');
	let query = args.join(' ');
	let sent = await msg.channel.createMessage('setting up...');
	// resolve role
	let role = resolveRole(query, msg.channel.guild);
	if(!role) return msg.channel.createMessage('I Couldnt find that role.');
	await bot.db.settings.update({}, { $set: {managers: role.id} }, {});
	return sent.edit(`Set ${role.name} as the manager's role.`);
};
function resolveRole(string, guild){
	let role = guild.roles.get(string) || guild.roles.find(role => role.mention === string) || guild.roles.find(role => role.name === string);

	return role;
}
module.exports.options = {
	name: 'setadmin',
	description: 'Adds a role as manager.',
	enabled: true,
	aliases: ['admin', 'setad'],
	fullDescription:'Updates the bot\'s managers role.',
	usage:'',
	guildOnly: true,
	argsRequired: true,
	requirements: {
		userIDs: ['517012288071401476', '143414786913206272']
	}
};