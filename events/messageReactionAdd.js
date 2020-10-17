
const bot = require('../index');

async function handler(msg, emoji, userID){
	const user = await bot.getRESTUser(userID);
	if(user.bot) return;


	const settings = await bot.db.settings.findOne({});
	if(emoji.name !== '🔁' || !settings && !settings.controlPanel.enabled && !settings.controlPanel.channelID && !settings.controlPanel.messages.length) return;

	
	const channel = await bot.getChannel(settings.controlPanel.channelID);
	
	const member = await channel.guild.getRESTMember(userID);
	if(!member || !member.roles.includes(settings.managers)) return;
	
	const originalMessage = await channel.getMessage(msg.id); 

	const module = getModule(settings, msg);

	// eslint-disable-next-line no-unused-vars
	const query = `modules.${module.name}.enabled`.toString();
	const state = module.enabled;
	await bot.db.settings.update({}, { $set: { query : !state } }); 
	const embed = makeEmbed(`The ${module.name} module is ${state ?  'enabled.' : 'disabled.'}`, `Last toggeled by: <@${userID}>`, bot.user.username, `${!state ?  '15158332' : '3066993'}`, channel.guild.iconURL);
	await originalMessage.edit({content: '', embed});
	await originalMessage.removeReactions();
	await originalMessage.addReaction('🔁');
	return; // console.log(`${userID} toggeled a module. `+ module.name);
}

// eslint-disable-next-line no-unused-vars
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
	console.log(module);
	return module;
}
module.exports = {
	event: 'messageReactionAdd',
	enabled: true,
	handler: handler,
};