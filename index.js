const fs = require('fs');
const eris = require('eris');
const Datastore = require('nedb-promises');
const {token} = require('./config.json');

const clientOptions = {
	autoreconnect: true,
	restMode: true,
	ignoreBots: true,
	ignoreSelf: true
};
const commandOptions = {
	description: 'a log for attatchments.',
	name: 'attatchment-log',
	owner: 'Uproar',
	prefix: ['@mention', 'L!'],
};

const bot = new eris.CommandClient(token, clientOptions, commandOptions);


bot.on('ready', async () => { // When the bot is ready
	console.log(`Logged is as ${bot.user.username}!`); // Log "Ready!"
	await loadCommands('./commands');
	await loadEvents('./events');
	await loadDB(bot);
	await checkDBSettings(bot);
	await enSurePrefix();
	await enSureDownloadsDirExists();
	// await fetchMessages(bot);
	console.log('Ready!'); // Log "Ready!"
	//let doc = await bot.db.settings.findOne({});
	//console.log(doc, '  ');
});

async function loadDB(bot){
	const settingsStore = Datastore.create('./data/settings.db');
	bot.db = {
		settings: settingsStore
	};
	
	await bot.db.settings.load();
	return console.log('Connected to DB!');
}

async function loadEvents(dir){
	let events = await fs.readdirSync(dir);
	if(!events.length) return console.log('No events found!');

	for(const eventFile of events){
		let event = require(`./events/${eventFile}`);

		if (event.enabled) {
			bot[event.once ? 'once' : 'on'](event.event, event.handler);
			console.log('Loaded handler for ' + event.event);
		}
	}
}
async function loadCommands(dir){
	let commands = await fs.readdirSync(dir);
	if(!commands.length) return console.log('Error: no commands found.');
	for(const commandFile of commands){
		let command = require(`./commands/${commandFile}`);
		if(command.options.enabled && command.options.hasSubCommands && command.options.subCommands.length ){
			console.log(`loading parent command: ${command.options.name}`);
			let parent = await bot.registerCommand(command.options.name, command.generator, command.options);
			command.options.subCommands.forEach(async element => {
				let subcmd = require(`./commands/${command.options.name}_${element}`);
				await parent.registerSubcommand(element, subcmd.generator, subcmd.options);    
				console.log(`loading sub command: ${subcmd.options.name} of ${parent.label}`);
			});
		}
		else if(command.options.enabled && !command.options.isSubCommand){
			console.log(`loading command: ${command.options.name}`);
			await bot.registerCommand(command.options.name, command.generator, command.options);
		}
	}
}

async function loadDefaultDbSettings(bot){
	// users is used to store user-song links, the other props are self-explanatory.
	const doc = {
		setup: false,
		prefix: null,
		guild: null,
		managers: null,
		modules: {
			attatchmentLog: {
				enabled: false,
				channelID: null,
				name: 'attatchmentLog',
			},
			welcome: {
				enabled: false,
				channelID: null,
				name: 'welcome',
			}
		},
		controlPanel: {
			enabled: false,
			channelID: null,
			messages: [],
		}
	}; // add the doc if it dosnt exist already.
	await bot.db.settings.insert(doc);
	return;
}
async function checkDBSettings(bot){
	// Ensure the props/settings needed for the bot to work are in the db, if not add default ones.
	const settings = await bot.db.settings.findOne({});
	if(!settings) return loadDefaultDbSettings(bot);
}
async function enSurePrefix(){
	// Ensure the props/settings needed for the bot to work are in the db, if not add default ones.
	const settings = await bot.db.settings.findOne({});
	if(!settings) return;

	if(settings.prefix && settings.guild) return bot.registerGuildPrefix(settings.guild, [settings.prefix, '@mention']);
}
/*
async function fetchMessages(bot){
	let settings = await bot.db.settings.findOne({});
	if(settings && settings.controlPanel.enabled && settings.controlPanel.messages.length){
		let channel = bot.getChannel(settings.controlPanel.channelID);
		for(const msgID of settings.controlPanel.messages){
			// eslint-disable-next-line no-unused-vars
			let originalMessage = await channel.getMessage(msgID);
		}
	}
}
*/
function enSureDownloadsDirExists(){
	fs.access('./downloads', fs.constants.F_OK, (err) => {
		if(err){
			fs.mkdir('./downloads', function(err) {
				if (err) {
					console.log(err);
				} else {
					console.log('Created empty downloads directory!'); // this directory is temporary, all files downloaded should be deleted after they are uploaded to discord.
				}
			});
		}
	});
}
bot.connect();

module.exports = bot;
