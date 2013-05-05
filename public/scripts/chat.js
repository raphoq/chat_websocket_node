$(document).ready(function () {
    'use strict';
    var socket = io.connect('http://localhost:3000'),
        entry_el = $('#send-message');
		entry_el.attr('autocomplete', 'off');
	var nickChangePattern = /^\/nick [A-Za-z0-9]*$/;
	var roomChangePattern = /^\/join [A-Za-z0-9]*$/;
	var myRoom = '';
	
    console.log('connecting…');

    socket.on('connect', function () {
        console.log('Połączony!');
    });

	socket.on('joinResult', function (data) {
		$('#info').append('<li class="join">Użytkownik ' + data + ' dołączył do czatu</li>');
	});
	
	
	socket.on('roomsChanged', function (data) {
		$('#room-list').empty();
		for (var i = 0; i < data.rooms.length; i += 1) {
			$('#room-list').append('<li>' + data.rooms[i] + '</li>');
		};
		
		$('#room-list li').click(function () {
			socket.emit('roomChange', $(this).text());
		});
		
		$('#room-list li:contains(' + myRoom + ')').css({"color": "red", "font-weight": "bold"});
	
	});
	
	
	socket.on('roomHistory', function (data) {
		$('#info').append('<li class="nicks">Zmieniłeś pokój na ' + data.current + '</li>');
		myRoom = data.current;
		$('#messages').empty();
		for (var i = 0; i < data.history.length; i += 1) {
			$('#messages').append('<li class="history">' + data.history[i] + '</li>');
		};	
	});
	
	socket.on('roomJoin', function (data) {
		$('#info').append('<li class="join">Użytkownik ' + data.nick + ' dołączył do grupy</li>');
	});
	
	socket.on('roomLeave', function (data) {
		$('#info').append('<li class="leave">' + data.nick + ' odłączył się od grupy</li>');
	});
	
	socket.on('nickStatus', function (data) {
		$('#info').append('<li class="nicks">Zmieniłeś nick na ' + data + '</li>');
	});
	
	socket.on('nickUsed', function (data) {
		alert('Ktoś używa już nicku ' + data);
	});
	
	socket.on('userJoin', function (data) {
		$('#info').append('<li class="nicks">Użytkownik ' + data.old + ' zmienił ksywkę na ' + data.nick + '</li>');
	});
	
	
	
	socket.on('onmsg', function (data) {
		$('#messages').append('<li style="display:none">' + data.nick + ' : ' + data.msg + '</li>');
		$('#messages li').fadeIn(500);
	});
	
	socket.on('stats', function (data) {
		$('#counter').html('Online: ' + data.count);
		
	});
	
	socket.on('logout', function (data) {
		$('#info').append('<li class="leave">Wylogowany użytkownik ' + data + '</li>');
	});
	
	$(entry_el).keypress(function(e){
		if (e.keyCode === 13){
			e.preventDefault();
			$("#send-button").trigger('click');
		};
	});
	
	$('#nick-button').click(function () {
		var nick = prompt('Podaj ksywkę');
		if (nick !== null) {
			socket.emit('nickChange', nick);
		};
		entry_el.focus();
	});
	
	$('#room-button').click(function () {
		var room = prompt('Pokój');
		if (room !== null) {
			socket.emit('roomChange', room);
		};
		entry_el.focus();
	});
	
	$('#send-button').click(function () {
		var message = entry_el.attr('value');
		
		if (nickChangePattern.test(message) === true) {
			var nickname = message.slice(6);
			socket.emit('nickChange', nickname);
		} else {
			if (roomChangePattern.test(message) === true) {
				var to_join = message.slice(6);
				socket.emit('roomChange', to_join);
			} else {
				if (message !== '') {
					socket.emit('msg', message);
				};
			};
		};
		
		
		entry_el.attr('value', '');
		
		entry_el.focus();
		
		
	});
   
});