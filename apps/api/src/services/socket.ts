import { Server, Socket } from 'socket.io'
import { verifyAccess } from '../lib/tokens'
import { prisma } from '../lib/prisma'

export function setupSocket(io: Server) {
  // Middleware to authenticate socket connections
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) return next(new Error("Authentication error"));
    try {
      const decoded = verifyAccess(token);
      socket.data.user = decoded;
      next();
    } catch (err) {
      next(new Error("Authentication error"));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`Socket connected: ${socket.id} (User: ${socket.data.user.userId})`)

    // 1. Join a specific chat room
    // The client should pass a room ID like: "clientUserId_lawyerUserId" (alphabetically sorted)
    socket.on('join_room', (roomId: string) => {
      // Security check: ensure the user is part of this room
      if (!roomId.includes(socket.data.user.userId)) {
          console.warn(`User ${socket.data.user.userId} attempted to join unauthorized room ${roomId}`);
          return;
      }

      socket.join(roomId);
      console.log(`User ${socket.data.user.userId} joined room ${roomId}`);
    });

    // 2. Handle incoming messages
    socket.on('send_message', async (data: { roomId: string, content: string, fileUrl?: string }) => {
      try {
        const { roomId, content, fileUrl } = data;
        
        if (!roomId.includes(socket.data.user.userId)) return;

        // Persist message to database
        const message = await prisma.message.create({
            data: {
                conversationId: roomId,
                senderId: socket.data.user.userId,
                content,
                fileUrl
            }
        });

        // Broadcast to everyone else in the room
        io.to(roomId).emit('receive_message', message);
      } catch (error) {
        console.error("Socket send_message error:", error);
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`)
    })
  })
}
