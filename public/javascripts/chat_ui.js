function divEscapedContentElement(message) {
  return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
  return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp, socket) {
  var message = $('#send-message').val()
    , systemMessage;
  console.log('the message is: ' + message);
  // If user input begins with a slash, treat it as a command
  if (message[0] == '/') {
    systemMessage = chatApp.processCommand(message);
    if (systemMessage) {
      $('#messages').append(divSystemContentElement(systemMessage));
    }

  // Broadcast non-command input to other users
  } else {
    chatApp.sendMessage($('#room').text(), message);
    $('#messages').append(divEscapedContentElement(message));
    $('#messages').scrollTop($('#messages').prop('scrollHeight'));
  }

  $('#send-message').val('');
}

var socket = io.connect('http://127.0.0.1:4000');

$(document).ready(function() {
  var chatApp = new Chat(socket);

  // Display the results of a name change attempt
  socket.on('nameResult', function(result) {
    var message;
    console.log(result);
    if (result.success) {
      message = 'You are now known as ' + result.name + '.';
    } else {
      message = result.message;
    }

    $('#messages').append(divSystemContentElement(message));
  });

  // Display the results of a room change
  socket.on('joinResult', function(result) {
    $('#room').text(result.room);
    $('#messages').append(divSystemContentElement('Room changed.'));
  });

  // Display received messages
  socket.on('message', function (message) {
    var newElement = $('<div></div>').text(message.text);
    $('#messages').append(newElement);
  });


  socket.on('coordinateChanged', function (message) {
    console.log(message);
  });

  socket.on('contactOnline', function (message) {
    console.log(message);
  });

  // handle a user going offline
  socket.on('userOffline', function (user) {
    console.log('user logged off - ' + user.name);
    console.log(user);
    // remove the user from the list?
  });


  // Display the initial list of folks who are being tracked
  socket.on('folksOnline', function (message) {
    console.log(message);
    var trackedpeople = [];
    var folksOnline = message.folksOnline;
    for(var propName in folksOnline){
      trackedpeople.push({name: folksOnline[propName].name, coordinates: folksOnline[propName].coordinates});
    }
    console.log(trackedpeople);
  });


  // Display list of rooms available
  socket.on('rooms', function(rooms) {
    $('#room-list').empty();
    for(var room in rooms) {
      room = room.substring(1, room.length);
      if (room != '') {
        $('#room-list').append(divEscapedContentElement(room));
      }
    }

    // Allow the click of a room name to change to that room
    $('#room-list div').click(function() {
      chatApp.processCommand('/join ' + $(this).text());
      $('#send-message').focus();
    });
  });

  // Request list of rooms available intermittantly
  setInterval(function() {
    socket.emit('rooms');
  }, 1000);

  $('#send-message').focus();

  // Allow clicking the send button to send a chat message
  $('#send-form').submit(function() {
    processUserInput(chatApp, socket);
    return false;
  });
});
