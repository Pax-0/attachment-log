/* eslint-disable no-useless-escape */
const bot = require('../index');

module.exports.generator = async (msg, args) => {
	const settings = await bot.db.settings.findOne({});
	if(!settings) return msg.channel.createMessage('Unable to find bot settings.');
	if(args.length){
		if(args[0].toLowerCase() === 'enable' || args[0].toLowerCase() === 'yes'){
			// enable it
			let sent = await msg.channel.createMessage('Enabling...');
			let state = true;
			await updateLogState(state);
			return sent.edit('Enabled!');
		}
		if(args[0].toLowerCase() === 'disable' || args[0].toLowerCase() === 'no'){
			// disable it
			let sent = await msg.channel.createMessage('Disabling...');
			let state = false;
			await updateLogState(state);
			return sent.edit('Disabled!!');
		}
		else {
			return msg.channel.createMessage('invalid argument supplied, please use one of the following: \`Enable\`, \`Disable\`, \`Yes\`, \`No\`, or run this command without arguments to toggle it.');
		}
	}else{
		let sent = await msg.channel.createMessage('Toggling...');
		await toggleLogging(settings.logEnabled);
		let newState = settings.logEnabled ? 'Disabled' : 'Enabled';
		return sent.edit(`${newState} logs!`);
	}
};
async function toggleLogging(current){
	let state = !current;
	await updateLogState(state);
	return;
}
async function updateLogState(state){
	await bot.db.settings.update({}, { $set: {logEnabled: state} }, {});
	return;
}
module.exports.options = {
	name: 'togglelog',
	description: 'toggle logs.',
	enabled: true,
	fullDescription:'enables/disables the logs.',
	usage:'enable/disable',
	guildOnly: true,
	aliases: ['tl', 'log'],
	requirements: {
		userIDs: ['517012288071401476', '143414786913206272']
	}
};