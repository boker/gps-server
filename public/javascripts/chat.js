var Chat = function(socket) {
  this.socket = socket;
};

Chat.prototype.sendMessage = function(room, text) {
  var message = {
    room: room,
    text: text
  };

  this.socket.emit('message', message);
};

Chat.prototype.changeRoom = function(room) {
  this.socket.emit('join', {
    newRoom: room
  });
};

Chat.prototype.processCommand = function(command) {
  console.log('inside command processor');
  var words = command.split(' ')
    // Parse command from first word
    , command = words[0].substring(1, words[0].length).toLowerCase()
    , message = false;

  switch(command) {
    // Handle room changing/creation
    case 'join':
      words.shift();
      var room = words.join(' ');
      this.changeRoom(room);
      break;

    // Handle name change attempts
    case 'nick':
      console.log('inside nick processor!');
      words.shift();
      var param = words.join(' ');
      words = param.split('|');
      var name = words[0];
      var coordinates= words[1].split(':');
      this.socket.emit('enrollForTracking', {name: name, coordinates: {x: coordinates[0], y: coordinates[1]}});
      break;

    // Handle name change attempts
    case 'coord':
      console.log('inside coord processor!');
      words.shift();
      var coordinates = words.join(' ').split(':');
      this.socket.emit('changeCoordinates', {x: coordinates[0], y: coordinates[1]});
      break;

    // Return an error message if the command isn't recognized
    default:
      message = 'Unrecognized command.';
      break;
  }

  return message;
};
