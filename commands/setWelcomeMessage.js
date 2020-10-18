
const bot = require('../index');

module.exports.generator = async (msg, args) => {
	const sent = await msg.channel.createMessage('Updating..');

	const settings = await bot.db.settings.findOne({});
	if(!settings) return sent.edit('Error! bot settings not found!');
    
	await bot.db.settings.update({}, { $set: {'modules.welcome.message': args.join(' ')} }, {});
	return sent.edit(`Updated the welcome text to: \`${args.join(' ')}\``);
};

module.exports.options = {
	name: 'welcomemsg',
	aliases: ['setwelcome', 'welcome'],
	description: 'Updates the custom welcome message.',
	enabled: true,
	fullDescription:'Changes the welcome message sent on user-join.',
	usage:'enjoy your stay!',
	argsRequired: true,
	guildOnly: true,
	requirements: {
		userIDs: ['517012288071401476', '143414786913206272']
	}
};