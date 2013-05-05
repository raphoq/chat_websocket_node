var socketio = require('socket.io'),
    guestNumber = 0,
	roomsHistory = {},
    nickNames = {},
	namesUsed = [],
    currentRoom = {}; 	// Przynależność do pokoi, ( ID usera : Nazwa pokoju )

exports.listen = function(server) {
    var io = socketio.listen(server);
    io.set('log level', 1);
	io.sockets.on('connection', function (socket) {
		// Statystyki
		var stats = function (room) {
			io.sockets.emit('stats', { 'count' : guestNumber });
		
		};
		
		var roomList = function () {
			var rooms_list = [];
				
			for (x in roomsHistory) {
				if (rooms_list.indexOf(roomsHistory) === -1) {
					rooms_list.push(x);
				};				
			};
			return rooms_list;
		}
		
		guestNumber += 1;
		
		// Generowanie losowej ksywki na początek
		var nick = 'user' + Math.floor((Math.random()*10000)+1);
		
		nickNames[socket.id] = {};
		nickNames[socket.id]['Lobby'] = nick;
		
		// Przyłączamy nasz socket do grupy/pokoju lobby
		socket.join('Lobby');
		
		// Zapisujemy w literale, że ten user jest w pokoju lobby
		currentRoom[socket.id] = 'Lobby';
		
		io.sockets.emit('joinResult', nickNames[socket.id]['Lobby']);

		stats();
		
		// Wczytanie histori LOBBY !!!!!!!!!
		if (!roomsHistory['Lobby']) roomsHistory['Lobby'] = [];
		socket.emit('roomHistory', {'current' : 'Lobby', 'history' : roomsHistory['Lobby']});
		io.sockets.emit('roomsChanged', { 'rooms' : roomList()});
		
		// Zmiana nicku przez usera
		socket.on('nickChange', function (data) {
				if (namesUsed.indexOf(data) === -1 ) {
					namesUsed.push(data);
					var old = nickNames[socket.id][currentRoom[socket.id]];
					nickNames[socket.id][currentRoom[socket.id]] = data;
					socket.emit('nickStatus', data);
					socket.broadcast.emit('userJoin', { 'old' : old, 'nick' : data });
				} else {
					socket.emit('nickUsed', data);
				};
		});
		
		// Zmiana pokoju na czacie
		socket.on('roomChange', function (data) {
			var oldRoom = currentRoom[socket.id];
			var newRoom = data;
		
			// Informacja dla starego pokoju o wyjsciu
			socket.broadcast.to(currentRoom[socket.id]).emit('roomLeave', {'nick' : nickNames[socket.id][currentRoom[socket.id]]});
			socket.leave(oldRoom);
			
			// Informacja dla nowego pokoju o wejsciu i zapis aktualnego pokoju
			socket.join(newRoom);
			currentRoom[socket.id] = newRoom;
			
			if (!roomsHistory[newRoom]) roomsHistory[newRoom] = [];
			
			
			socket.emit('roomHistory', {'current' : newRoom, 'history' : roomsHistory[currentRoom[socket.id]]});
			io.sockets.emit('roomsChanged', {'rooms' : roomList()});
			socket.broadcast.to(currentRoom[socket.id]).emit('roomJoin', {'nick' : nickNames[socket.id][currentRoom[socket.id]]});
		});
		
		// Wiadomości
		socket.on('msg', function (data) {						
			if (!nickNames[socket.id][currentRoom[socket.id]]) {
				roomsHistory[currentRoom[socket.id]].push(nickNames[socket.id]['Lobby'] + ' : ' + data);
				io.sockets.in(currentRoom[socket.id])
				.emit('onmsg', { 'nick': nickNames[socket.id]['Lobby'], 'msg' : data });
			} else {
				roomsHistory[currentRoom[socket.id]].push(nickNames[socket.id][currentRoom[socket.id]] + ' : ' + data);
				io.sockets.in(currentRoom[socket.id])
				.emit('onmsg', { 'nick': nickNames[socket.id][currentRoom[socket.id]], 'msg' : data });
			}
		});		 
		
		// Wylogowywanie
		socket.on('disconnect', function (data) {
			// Zmniejszenie licznika userów
			guestNumber -= 1;
			stats();
			socket.broadcast.emit('logout', nickNames[socket.id]['Lobby']);
		});
		
    });
	
};
