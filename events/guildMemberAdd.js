
async function handler(member){
	return console.log(member);
}
module.exports = {
	event: 'guildMemberAdd',
	enabled: true,
	handler: handler,
};