const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const path = require('path');

const PORT = process.env.PORT || 3000;

// Serve static files
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Store waiting users
let waitingUsers = [];
// Store active connections
let activeConnections = new Map();

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user looking for a chat partner
  socket.on('find-partner', () => {
    console.log('User looking for partner:', socket.id);
    
    // If there's someone waiting, pair them
    if (waitingUsers.length > 0) {
      const partner = waitingUsers.shift();
      
      // Create a room for these two users
      const roomId = `${socket.id}-${partner}`;
      
      // Store the connection
      activeConnections.set(socket.id, { partner, roomId });
      activeConnections.set(partner, { partner: socket.id, roomId });
      
      // Join both to the room
      socket.join(roomId);
      io.sockets.sockets.get(partner)?.join(roomId);
      
      // Notify both users that they're matched
      socket.emit('partner-found', { partner, initiator: true });
      io.to(partner).emit('partner-found', { partner: socket.id, initiator: false });
      
      console.log(`Paired ${socket.id} with ${partner}`);
    } else {
      // No one waiting, add this user to waiting list
      waitingUsers.push(socket.id);
      socket.emit('waiting');
      console.log('User added to waiting list:', socket.id);
    }
  });

  // Handle WebRTC signaling
  socket.on('signal', (data) => {
    const connection = activeConnections.get(socket.id);
    if (connection) {
      io.to(connection.partner).emit('signal', {
        signal: data.signal,
        from: socket.id
      });
    }
  });

  // Handle chat messages
  socket.on('chat-message', (message) => {
    const connection = activeConnections.get(socket.id);
    if (connection) {
      io.to(connection.partner).emit('chat-message', message);
    }
  });

  // Handle skip/next
  socket.on('skip', () => {
    handleDisconnection(socket, true);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    handleDisconnection(socket, false);
  });

  function handleDisconnection(socket, isSkip) {
    // Remove from waiting list if present
    const waitingIndex = waitingUsers.indexOf(socket.id);
    if (waitingIndex > -1) {
      waitingUsers.splice(waitingIndex, 1);
    }

    // Notify partner if in active connection
    const connection = activeConnections.get(socket.id);
    if (connection) {
      const partner = connection.partner;
      const roomId = connection.roomId;
      
      // Notify partner
      io.to(partner).emit('partner-disconnected');
      
      // Clean up
      socket.leave(roomId);
      io.sockets.sockets.get(partner)?.leave(roomId);
      
      activeConnections.delete(socket.id);
      activeConnections.delete(partner);
      
      console.log(`Disconnected pair: ${socket.id} and ${partner}`);
    }
  }
});

http.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT}`);
});
