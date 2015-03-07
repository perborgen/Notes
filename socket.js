module.exports = function(socket){
	console.log('connected to socket via socket.js');

	data = [{id: 1, title: "My Socket title", text: "My server socket notes"},
	{id: 2, title: "My Socket title2", text: "My server socket notes 2"}]

	socket.emit('init', data);
	socket.on('message', function(data){
		console.log(data)
	});




}