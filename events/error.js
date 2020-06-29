

async function handler(error){
	return console.log(error);
}
module.exports = {
	event: 'error',
	enabled: true,
	handler: handler,
};