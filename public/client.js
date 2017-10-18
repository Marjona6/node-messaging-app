const element = function(id) {
	return document.getElementById(id);
}

const status = element('status');
const messages = element('messages');
const textarea = element('textarea');
const username = element('username');
const clearButton = element('clearButton');

// set default status
var statusDefault = status.textContent;

var setStatus = function(s) {
	status.textContent = s;

	if(s !== statusDefault) {
		var delay = setTimeout(function() {
			setStatus(statusDefault);
		}, 4000);
	}
}

// connect to socket.io
const socket = io.connect('http://127.0.0.1:8080');

// check for connection
if (socket !== undefined) {
	console.log('Connected to socket');

	socket.on('output', function(data) {
		// console.log(data);
		if (data.length) {
			for (let i = 0; i < data.length; i++) {
				// build the message div
				let message = document.createElement('div');
				message.setAttribute('class', "chatMessage");
				message.textContent = data[i].name + ': ' + data[i].message;
				messages.appendChild(message);
				messages.insertBefore(message, messages.firstChild);
			}
		}
	});

	// get status from server
	socket.on('status', function(data) {
		// get message status
		setStatus((typeof data === 'object') ? data.message : data);

		// if status is clear, clear text
		if (data.clear) {
			textarea.value = '';
		}
	});

	// handle input
	textarea.addEventListener('keydown', function(event) {
		if (event.which === 13 && event.shiftKey == false) {
			// emit to server input
			socket.emit('input', {
				name: username.value,
				message: textarea.value
			});

			event.preventDefault();
		}
	});

	// handle clear button
	clearButton.addEventListener('click', function() {
		socket.emit('clear');
	});

	socket.on('cleared', function() {
		messages.textContent = ''; // clear button doesn't work except on page refresh
	});
}