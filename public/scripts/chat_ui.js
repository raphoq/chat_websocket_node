var entry_el = $('#send-message');
	entry_el.attr('autocomplete', 'off');
var nickChangePattern = /^\/nick [A-Za-z0-9]*$/;
var roomChangePattern = /^\/join [A-Za-z0-9]*$/;
var myRoom = '';

$(entry_el).keypress(function(e){
	if (e.keyCode === 13){
		e.preventDefault();
		$("#send-button").trigger('click');
	};
});

var nickBtn = function (socketCall) {
	$('#nick-button').click(function () {
		var nick = prompt('Podaj ksywkę');
		if (nick !== null) {
			socketCall(nick);
		};
		entry_el.focus();
	});
};

var roomBtn = function (socketCall) {
	$('#room-button').click(function () {
		var room = prompt('Pokój');
		if (room !== null) {
			socketCall(room);
		};
		entry_el.focus();
	});
};

var sendBtn = function (socketCall) {
	$('#send-button').click(function () {
		var message = entry_el.attr('value');
		
		if (nickChangePattern.test(message) === true) {
			var nickname = message.slice(6);
			socketCall('nickChange', nickname);
		} else {
			if (roomChangePattern.test(message) === true) {
				var to_join = message.slice(6);
				socketCall('roomChange', to_join);
			} else {
				if (message !== '') {
					socketCall('msg', message);
				};
			};
		};
		entry_el.attr('value', '');
		entry_el.focus();
	});
};
	
var joinResult = function (who) {
	$('#info').append('<li class="join">Użytkownik ' + who + ' dołączył do czatu</li>');
};

var roomsList = function (rooms, changeRoom) {
	$('#room-list').empty();
	for (var i = 0; i < rooms.length; i += 1) {
		$('#room-list').append('<li>' + rooms[i] + '</li>');
	};
	$('#room-list li:contains(' + myRoom + ')').css({"color": "red", "font-weight": "bold"});
	
	$('#room-list li').click(function () {
		var clickRoom = $(this).text();
		changeRoom(clickRoom);
	});
};

var loadHistory = function (current, history) {
	$('#info').append('<li class="nicks">Zmieniłeś pokój na ' + current + '</li>');
	myRoom = current;
	$('#messages').empty();
	for (var i = 0; i < history.length; i += 1) {
		$('#messages').append('<li class="history">' + history[i] + '</li>');
	};	
};

var roomJoin = function (who) {
	$('#info').append('<li class="join">Użytkownik ' + who + ' dołączył do grupy</li>');
};

var roomLeave = function (who) {
	$('#info').append('<li class="leave">' + who + ' odłączył się od grupy</li>');
};

var nickStatus = function (nick) {
	$('#info').append('<li class="nicks">Zmieniłeś nick na ' + nick + '</li>');
};

var nickUsed = function (nick) {
	alert('Ktoś używa już nicku ' + nick);
};

var nickChangeResult = function (old, nick) {
	$('#info').append('<li class="nicks">Użytkownik ' + old + ' zmienił ksywkę na ' + nick + '</li>');
};

var userCount = function (count) {
	$('#counter').html('Online: ' + count);
};

var logoutInfo = function (who) {
	$('#info').append('<li class="leave">Wylogowany użytkownik ' + who + '</li>');
};

var onMsg = function (nick, msg) {
	$('#messages').append('<li style="display:none">' + nick + ' : ' + msg + '</li>');
	$('#messages li').fadeIn(500);
};