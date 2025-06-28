import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

const connectedUsers = new Map();
const userSockets = new Map();

export const setupSocketHandlers = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.isActive) {
        return next(new Error('User not found or inactive'));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
      
    } catch (error) {
      logger.error('Socket authentication error:', error);
      next(new Error('Authentication failed'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    const user = socket.user;
    
    logger.info(`User connected: ${user.username} (${userId})`);
    
    // Store user connection
    connectedUsers.set(userId, {
      id: userId,
      username: user.username,
      role: user.role,
      socketId: socket.id,
      connectedAt: new Date()
    });
    
    // Store socket reference
    if (!userSockets.has(userId)) {
      userSockets.set(userId, new Set());
    }
    userSockets.get(userId).add(socket.id);

    // Join user to their personal room
    socket.join(`user:${userId}`);
    
    // Join user to role-based rooms
    socket.join(`role:${user.role}`);
    
    // Send current online users to the newly connected user
    socket.emit('online_users', Array.from(connectedUsers.values()));
    
    // Broadcast user connection to all users
    socket.broadcast.emit('user_connected', {
      id: userId,
      username: user.username,
      role: user.role
    });

    // Handle real-time content updates
    socket.on('content_update', (data) => {
      try {
        // Validate user permissions
        if (!user.hasPermission('content.write')) {
          socket.emit('error', { message: 'Insufficient permissions' });
          return;
        }

        // Broadcast content update to all users
        socket.broadcast.emit('content_updated', {
          type: data.type,
          resourceId: data.resourceId,
          changes: data.changes,
          updatedBy: {
            id: userId,
            username: user.username
          },
          timestamp: new Date()
        });

        logger.info(`Content updated by ${user.username}:`, data);
        
      } catch (error) {
        logger.error('Content update error:', error);
        socket.emit('error', { message: 'Failed to update content' });
      }
    });

    // Handle theme updates
    socket.on('theme_update', (themeData) => {
      try {
        // Validate user permissions
        if (!user.hasPermission('theme.write')) {
          socket.emit('error', { message: 'Insufficient permissions' });
          return;
        }

        // Broadcast theme update to all users
        io.emit('theme_updated', {
          settings: themeData,
          updatedBy: {
            id: userId,
            username: user.username
          },
          timestamp: new Date()
        });

        logger.info(`Theme updated by ${user.username}`);
        
      } catch (error) {
        logger.error('Theme update error:', error);
        socket.emit('error', { message: 'Failed to update theme' });
      }
    });

    // Handle scheme updates
    socket.on('scheme_update', (data) => {
      try {
        // Validate user permissions
        if (!user.hasPermission('schemes.write')) {
          socket.emit('error', { message: 'Insufficient permissions' });
          return;
        }

        // Broadcast scheme update to all users
        io.emit('scheme_updated', {
          schemeId: data.schemeId,
          action: data.action, // 'created', 'updated', 'deleted'
          scheme: data.scheme,
          updatedBy: {
            id: userId,
            username: user.username
          },
          timestamp: new Date()
        });

        logger.info(`Scheme ${data.action} by ${user.username}:`, data.schemeId);
        
      } catch (error) {
        logger.error('Scheme update error:', error);
        socket.emit('error', { message: 'Failed to update scheme' });
      }
    });

    // Handle user activity tracking
    socket.on('user_activity', (activity) => {
      try {
        // Broadcast user activity to admins only
        io.to('role:admin').emit('user_activity_update', {
          userId,
          username: user.username,
          activity: activity.type,
          page: activity.page,
          timestamp: new Date()
        });
        
      } catch (error) {
        logger.error('User activity tracking error:', error);
      }
    });

    // Handle typing indicators for collaborative editing
    socket.on('typing_start', (data) => {
      socket.to(data.room).emit('user_typing', {
        userId,
        username: user.username,
        resource: data.resource
      });
    });

    socket.on('typing_stop', (data) => {
      socket.to(data.room).emit('user_stopped_typing', {
        userId,
        resource: data.resource
      });
    });

    // Handle collaborative editing
    socket.on('join_editing_session', (data) => {
      const room = `editing:${data.resourceType}:${data.resourceId}`;
      socket.join(room);
      
      socket.to(room).emit('user_joined_editing', {
        userId,
        username: user.username,
        resource: data.resourceId
      });
    });

    socket.on('leave_editing_session', (data) => {
      const room = `editing:${data.resourceType}:${data.resourceId}`;
      socket.leave(room);
      
      socket.to(room).emit('user_left_editing', {
        userId,
        resource: data.resourceId
      });
    });

    // Handle real-time notifications
    socket.on('send_notification', (data) => {
      try {
        // Validate user permissions
        if (!user.hasPermission('all') && user.role !== 'admin') {
          socket.emit('error', { message: 'Insufficient permissions' });
          return;
        }

        const notification = {
          id: Date.now().toString(),
          type: data.type || 'info',
          title: data.title,
          message: data.message,
          from: {
            id: userId,
            username: user.username
          },
          timestamp: new Date()
        };

        // Send to specific user or broadcast to all
        if (data.targetUserId) {
          io.to(`user:${data.targetUserId}`).emit('notification', notification);
        } else if (data.targetRole) {
          io.to(`role:${data.targetRole}`).emit('notification', notification);
        } else {
          io.emit('notification', notification);
        }

        logger.info(`Notification sent by ${user.username}:`, notification);
        
      } catch (error) {
        logger.error('Notification error:', error);
        socket.emit('error', { message: 'Failed to send notification' });
      }
    });

    // Handle analytics updates
    socket.on('analytics_update', (data) => {
      try {
        // Only admins can trigger analytics updates
        if (user.role !== 'admin') {
          return;
        }

        io.to('role:admin').emit('analytics_updated', {
          type: data.type,
          data: data.data,
          timestamp: new Date()
        });
        
      } catch (error) {
        logger.error('Analytics update error:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${user.username} (${reason})`);
      
      // Remove socket from user's socket set
      if (userSockets.has(userId)) {
        userSockets.get(userId).delete(socket.id);
        
        // If no more sockets for this user, remove from connected users
        if (userSockets.get(userId).size === 0) {
          userSockets.delete(userId);
          connectedUsers.delete(userId);
          
          // Broadcast user disconnection
          socket.broadcast.emit('user_disconnected', {
            id: userId,
            username: user.username
          });
        }
      }
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error(`Socket error for user ${user.username}:`, error);
    });
  });

  // Periodic cleanup of stale connections
  setInterval(() => {
    const now = Date.now();
    const staleThreshold = 30 * 60 * 1000; // 30 minutes
    
    for (const [userId, userData] of connectedUsers.entries()) {
      if (now - userData.connectedAt.getTime() > staleThreshold) {
        const sockets = userSockets.get(userId);
        if (sockets) {
          for (const socketId of sockets) {
            const socket = io.sockets.sockets.get(socketId);
            if (socket && !socket.connected) {
              sockets.delete(socketId);
            }
          }
          
          if (sockets.size === 0) {
            userSockets.delete(userId);
            connectedUsers.delete(userId);
            logger.info(`Cleaned up stale connection for user: ${userData.username}`);
          }
        }
      }
    }
  }, 5 * 60 * 1000); // Run every 5 minutes

  return {
    getConnectedUsers: () => Array.from(connectedUsers.values()),
    getUserSocketCount: () => connectedUsers.size,
    sendToUser: (userId, event, data) => {
      io.to(`user:${userId}`).emit(event, data);
    },
    sendToRole: (role, event, data) => {
      io.to(`role:${role}`).emit(event, data);
    },
    broadcast: (event, data) => {
      io.emit(event, data);
    }
  };
};