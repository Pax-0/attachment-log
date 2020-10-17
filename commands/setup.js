const bot = require('../index');

module.exports.generator = async (msg, args) => {
	if(args.length < 3) return msg.channel.createMessage('Not enough arguments supplied.');
	// load bot sttings
	const settings = await bot.db.settings.findOne({});
	if(!settings) return msg.channel.createMessage('Unable to bot settings.');
	
	let sent = await msg.channel.createMessage('setting up...');
	// resolve channel
	let attacthmentLog = resolveChannel(args[0], msg.channel.guild);
	if(!attacthmentLog) return msg.channel.createMessage('I Couldnt find the channel for attatchment logs.');
	
	let controlPanel = resolveChannel(args[1], msg.channel.guild);
	if(!controlPanel) return msg.channel.createMessage('I Couldnt find the control-panel channel. ');
	
	let welcomeChannel = resolveChannel(args[2], msg.channel.guild);
	if(!welcomeChannel) return msg.channel.createMessage('I Couldnt find the welcome channel. ');
	

	// set them up, and save to db!
	await setup(attacthmentLog, controlPanel, welcomeChannel, msg.channel.guild);
	await sendControlPanelEmbeds(controlPanel, settings);
	return sent.edit('finished saving the log channels to db!');
};
function resolveChannel(string, guild){
	let channel = guild.channels.get(string) || guild.channels.find(channel => channel.mention === string) || guild.channels.find(channel => channel.name === string);

	return channel;
}
async function setup(attacthmentLog, controlPanel, welcomeChannel, guild){
	await bot.db.settings.update({}, { $set: {'modules.attatchmentLog.channelID': attacthmentLog.id} }, {});
	await bot.db.settings.update({}, { $set: {'modules.attatchmentLog.enabled': true} }, {});
	await bot.db.settings.update({}, { $set: {'modules.welcome.enabled': true} }, {});
	await bot.db.settings.update({}, { $set: {'modules.welcome.channelID': welcomeChannel.id} }, {});

	await bot.db.settings.update({}, { $set: {'controlPanel.enabled': true} }, {});
	await bot.db.settings.update({}, { $set: {'controlPanel.channelID': controlPanel.id} }, {});

	await bot.db.settings.update({}, { $set: {setup: true} }, {});
	await bot.db.settings.update({}, { $set: {guild: guild.id} }, {});
    
}
async function sendControlPanelEmbeds(channel){
	let welcomeLogMSG = await channel.createMessage('welcome panel test');
	await welcomeLogMSG.addReaction('🔁');

	let attatchmentLogMSG = await channel.createMessage('attatchment panel test');
	await attatchmentLogMSG.addReaction('🔁');

	await bot.db.settings.update({}, { $addToSet: { 'controlPanel.messages': {msgId: welcomeLogMSG.id, module: 'welcome'} } }); 
	await bot.db.settings.update({}, { $addToSet: { 'controlPanel.messages': {msgId: attatchmentLogMSG.id, module: 'attatchmentLog'} } }); 

}
module.exports.options = {
	name: 'setup',
	description: 'Sets the bot up',
	enabled: true,
	aliases: ['start', 'enable'],
	fullDescription:'Sets the control pannel channel, log channel, and enables logging.',
	usage:'#attatchment-log #control-panel #welcome-channel',
	argsRequired: true,
	guildOnly: true,
	requirements: {
		userIDs: ['517012288071401476', '143414786913206272']
	}
};