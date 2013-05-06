var socketio = require('socket.io'),
    guestNumber = 0,
	roomsHistory = {},		// Rooms list with their history
    nickNames = {},			// Rooms nicknames, every room have own nick
	namesUsed = [],	   		// Names used, prevent duplicate
    currentRoom = {};  		// Current room (socket : room)

exports.listen = function(server) {
    var io = socketio.listen(server);
    io.set('log level', 1);
	io.sockets.on('connection', function (socket) {
		/* Generating random nickname and insert as Lobby nick */
		var genRandomNick = function () {
			var nick = 'user' + Math.floor((Math.random()*10000)+1); 
			nickNames[socket.id] = {};
			nickNames[socket.id]['Lobby'] = nick;
		}();
		/* Get nick in room */
		var getRoomNick = function (where) {
			if (!where) { 
				if (nickNames[socket.id][currentRoom[socket.id]]) {
					return nickNames[socket.id][currentRoom[socket.id]];		
				} else {
					return nickNames[socket.id]['Lobby'];
				}
			} else {
				return nickNames[socket.id][where];
			};
		};
		/* Send rooms list */
		var updateRoomList = function () {
			var rooms_list = [];
			for (x in roomsHistory) {
				if (rooms_list.indexOf(roomsHistory) === -1) {
					rooms_list.push(x);
				};				
			};
			io.sockets.emit('roomsList', {'rooms' : rooms_list});
		};
		/* User counter */
		var updateCounter = function () { 
			io.sockets.emit('userCount', { 'count' : guestNumber });
		};
		
		guestNumber += 1;
		socket.join('Lobby');
		currentRoom[socket.id] = 'Lobby';
		io.sockets.emit('joinResult', getRoomNick('Lobby'));
		updateCounter();	// Update user counter
		
		/* Loading Lobby history */
		if (!roomsHistory['Lobby']) roomsHistory['Lobby'] = [];		// Create Lobby history if not exist
		socket.emit('roomHistory', {'current' : 'Lobby', 'history' : roomsHistory['Lobby']});
		updateRoomList();	// Update room list for everyone
		
		/* Changing nickname */
		socket.on('nickChange', function (data) {
			if (namesUsed.indexOf(data) === -1) {
				namesUsed.push(data);
				var old = getRoomNick();
				nickNames[socket.id][currentRoom[socket.id]] = data;	// Set nick in current room
				socket.emit('nickStatus', data);
				socket.broadcast.emit('nickChangeResult', { 'old' : old, 'nick' : data });
			} else {
				socket.emit('nickUsed', data);
			};
		});
		/* Changing room */
		socket.on('roomChange', function (data) {
			var oldRoom = currentRoom[socket.id],
				newRoom = data;
			
			socket.broadcast.to(currentRoom[socket.id])	// Message for previous room
			.emit('roomLeave', {'nick' : getRoomNick()});
			socket.leave(oldRoom);
			/* Join new room, load/create history, and inform */
			socket.join(newRoom);
			currentRoom[socket.id] = newRoom;
			if (!roomsHistory[newRoom]) roomsHistory[newRoom] = [];
			socket.emit('roomHistory', {'current' : newRoom, 'history' : roomsHistory[currentRoom[socket.id]]});
			socket.broadcast.to(currentRoom[socket.id]).emit('roomJoin', {'nick' : getRoomNick()});
			updateRoomList();
		});
		/* Messages */
		socket.on('msg', function (data) {						
			if (!nickNames[socket.id][currentRoom[socket.id]]) {	// If nick in room not created, use nick from Lobby
				roomsHistory[currentRoom[socket.id]].				// Insert message to room history
				push(getRoomNick('Lobby') + ' : ' + data);		
				io.sockets.in(currentRoom[socket.id])				// Emit message
				.emit('onmsg', { 'nick': getRoomNick('Lobby'), 'msg' : data });
			} else {												// Use nick from room
				roomsHistory[currentRoom[socket.id]].
				push(getRoomNick() + ' : ' + data);
				io.sockets.in(currentRoom[socket.id])
				.emit('onmsg', { 'nick': getRoomNick(), 'msg' : data });
			};
		});		 
		/* Disconnect user */
		socket.on('disconnect', function (data) {
			guestNumber -= 1;
			updateCounter();	// Update user counter
			socket.broadcast.emit('logout', getRoomNick('Lobby'));
		});
    });
};
