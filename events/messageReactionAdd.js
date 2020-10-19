
const bot = require('../index');

async function handler(msg, emoji, userID){
	const user = await bot.getRESTUser(userID);
	if(user.bot) return;


	const settings = await bot.db.settings.findOne({});
	if(!settings && !settings.controlPanel.enabled && !settings.controlPanel.channelID && !settings.controlPanel.messages.length) return;
	if(emoji.name !== '🔁') return;
	
	const channel = await bot.getChannel(settings.controlPanel.channelID);
	
	const member = await channel.guild.getRESTMember(userID);
	if(!member) return;
	if(!member.roles.includes(settings.managers) && !member.permission.json.administrator) return;
	
	const originalMessage = await channel.getMessage(msg.id); 

	const module = getModule(settings, msg);

	
	const state = module.enabled;
	if(module.name === 'welcome'){
		await bot.db.settings.update({}, { $set: { 'modules.welcome.enabled' : !state } }); 
	}else{
		await bot.db.settings.update({}, { $set: { 'modules.attatchmentlog.enabled' : !state } }); 
	}

	const embed = makeEmbed(`The ${module.name} module is ${state ?  'disabled.' : 'enabled.'}`, `Last toggled by: <@${userID}>`, bot.user.username, `${!state ?  '3066993' : '15158332'}`, channel.guild.iconURL);
	await originalMessage.edit({content: '', embed});
	await originalMessage.removeReactions();
	await originalMessage.addReaction('🔁');
	return;
}
function makeEmbed(title, description,  footerText, color, iconURL){
	const embed = {
		title,
		description,
		footer: {
			text: footerText,
			icon_url: iconURL,
		},
		color,
		timestamp: new Date(),

	};
	return embed;
}
function getModule(settings, msg){
	const controlPanelMessage = settings.controlPanel.messages.find(item => item.msgId === msg.id);
	const modules = Object.values(settings.modules);
	const module = modules.find(m => m.name === controlPanelMessage.module);
	return module;
}
module.exports = {
	event: 'messageReactionAdd',
	enabled: true,
	handler: handler,
};