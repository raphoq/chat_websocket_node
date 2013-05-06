$(document).ready(function () {
    'use strict';
    var socket = io.connect('http://localhost:3000');
	
    console.log('connecting…');
    socket.on('connect', function () {
        console.log('Połączony!');
    });
	/* Inform about connect */
	socket.on('joinResult', function (data) {	
		joinResult(data);
	});
	/* Print rooms list */
	socket.on('roomsList', function (data) {	
		roomsList(data.rooms, function (clickRoom) {
			socket.emit('roomChange', clickRoom);		
		});
	});
	/* Load room history */
	socket.on('roomHistory', function (data) {	
		loadHistory(data.current, data.history);
	});
	/* Inform about room join */
	socket.on('roomJoin', function (data) {		
		roomJoin(data.nick);
	});
	/* Inform about room leave */
	socket.on('roomLeave', function (data) {	
		roomLeave(data.nick);
	});
	/* Inform user about change name himself */
	socket.on('nickStatus', function (data) {	
		nickStatus(data);
	});
	/* Inform user about used nickname */
	socket.on('nickUsed', function (data) {		
		nickUsed(data);
	});
	/* Inform users about your nick change */
	socket.on('nickChangeResult', function (data) {
		nickChangeResult(data.old, data.nick);
	});
	/* User counter */
	socket.on('userCount', function (data) {
		userCount(data.count);
	});
	/* Inform users about disconnect */
	socket.on('logout', function (data) {
		logoutInfo(data);
	});
	/* Print received messages */
	socket.on('onmsg', function (data) {
		onMsg(data.nick, data.msg);
	});
	/* Nick change button */
	nickBtn(function(nick) {
		socket.emit('nickChange', nick);	
	});
	/* Room change button */
	roomBtn(function(room) {
		socket.emit('roomChange', room);	
	});
	/* Send message, and process chat operations */
	sendBtn(function() {
		socket.emit(arguments[0], arguments[1]);
	});
	
});