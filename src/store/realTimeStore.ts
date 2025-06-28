import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from './authStore';

interface OnlineUser {
  id: string;
  username: string;
  role: string;
  socketId: string;
  connectedAt: string;
}

interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  from?: {
    id: string;
    username: string;
  };
  timestamp: string;
  read: boolean;
  persistent?: boolean;
}

interface RealTimeState {
  socket: Socket | null;
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  onlineUsers: OnlineUser[];
  notifications: Notification[];
  unreadCount: number;
  lastActivity: string | null;
  
  // Real-time data
  liveAnalytics: any;
  activeEditors: Record<string, string[]>; // resourceId -> usernames
  
  // Actions
  connect: (token: string) => void;
  disconnect: () => void;
  sendMessage: (event: string, data: any) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  clearNotifications: () => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  joinEditingSession: (resourceType: string, resourceId: string) => void;
  leaveEditingSession: (resourceType: string, resourceId: string) => void;
  sendTypingIndicator: (resourceType: string, resourceId: string, isTyping: boolean) => void;
  trackUserActivity: (activity: { type: string; page: string; metadata?: any }) => void;
}

export const useRealTimeStore = create<RealTimeState>((set, get) => ({
  socket: null,
  isConnected: false,
  connectionStatus: 'disconnected',
  onlineUsers: [],
  notifications: [],
  unreadCount: 0,
  lastActivity: null,
  liveAnalytics: null,
  activeEditors: {},

  connect: (token) => {
    const { socket: existingSocket } = get();
    
    // Disconnect existing socket if any
    if (existingSocket) {
      existingSocket.disconnect();
    }

    set({ connectionStatus: 'connecting' });

    const socketUrl = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    const socket = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    // Connection events
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      set({ 
        socket, 
        isConnected: true, 
        connectionStatus: 'connected',
        lastActivity: new Date().toISOString()
      });
      toast.success('Real-time connection established', { duration: 2000 });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      set({ 
        isConnected: false, 
        connectionStatus: 'disconnected',
        onlineUsers: [],
        activeEditors: {}
      });
      
      if (reason === 'io server disconnect') {
        // Server initiated disconnect, don't show error
        toast('Connection closed by server', { duration: 2000 });
      } else {
        toast.error('Real-time connection lost', { duration: 3000 });
      }
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      set({ connectionStatus: 'error' });
      toast.error('Failed to establish real-time connection', { duration: 4000 });
    });

    socket.on('reconnect', (attemptNumber) => {
      console.log('Socket reconnected after', attemptNumber, 'attempts');
      set({ connectionStatus: 'connected' });
      toast.success('Real-time connection restored', { duration: 2000 });
    });

    socket.on('reconnect_error', (error) => {
      console.error('Socket reconnection error:', error);
      set({ connectionStatus: 'error' });
    });

    // User presence events
    socket.on('online_users', (users: OnlineUser[]) => {
      set({ onlineUsers: users });
    });

    socket.on('user_connected', (user: OnlineUser) => {
      set(state => ({
        onlineUsers: [...state.onlineUsers.filter(u => u.id !== user.id), user]
      }));
      
      // Show notification for admin users
      const authUser = useAuthStore.getState().user;
      if (authUser?.role === 'admin') {
        get().addNotification({
          type: 'info',
          title: 'User Connected',
          message: `${user.username} joined the platform`
        });
      }
    });

    socket.on('user_disconnected', (user: { id: string; username: string }) => {
      set(state => ({
        onlineUsers: state.onlineUsers.filter(u => u.id !== user.id)
      }));
    });

    // Content update events
    socket.on('content_updated', (data) => {
      console.log('Content updated:', data);
      
      get().addNotification({
        type: 'info',
        title: 'Content Updated',
        message: `${data.updatedBy.username} updated ${data.type}`,
        from: data.updatedBy
      });

      // Dispatch custom event for components to listen
      window.dispatchEvent(new CustomEvent('content_updated', { detail: data }));
    });

    // Theme update events
    socket.on('theme_updated', (data) => {
      console.log('Theme updated:', data);
      
      get().addNotification({
        type: 'success',
        title: 'Theme Updated',
        message: `${data.updatedBy.username} updated the theme`,
        from: data.updatedBy
      });

      // Apply theme changes immediately
      window.dispatchEvent(new CustomEvent('theme_updated', { detail: data.settings }));
    });

    // Scheme update events
    socket.on('scheme_updated', (data) => {
      console.log('Scheme updated:', data);
      
      const actionText = {
        created: 'created',
        updated: 'updated',
        deleted: 'deleted'
      }[data.action] || 'modified';

      get().addNotification({
        type: data.action === 'deleted' ? 'warning' : 'success',
        title: 'Scheme Updated',
        message: `${data.updatedBy.username} ${actionText} a scheme`,
        from: data.updatedBy
      });

      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('scheme_updated', { detail: data }));
    });

    // Notification events
    socket.on('notification', (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
      get().addNotification(notification);
    });

    // Analytics events
    socket.on('analytics_updated', (data) => {
      set({ liveAnalytics: data.data });
      
      // Dispatch custom event
      window.dispatchEvent(new CustomEvent('analytics_updated', { detail: data }));
    });

    // Collaborative editing events
    socket.on('user_joined_editing', (data) => {
      set(state => ({
        activeEditors: {
          ...state.activeEditors,
          [data.resource]: [
            ...(state.activeEditors[data.resource] || []).filter(u => u !== data.username),
            data.username
          ]
        }
      }));
    });

    socket.on('user_left_editing', (data) => {
      set(state => ({
        activeEditors: {
          ...state.activeEditors,
          [data.resource]: (state.activeEditors[data.resource] || []).filter(u => u !== data.username)
        }
      }));
    });

    socket.on('user_typing', (data) => {
      // Dispatch typing event
      window.dispatchEvent(new CustomEvent('user_typing', { detail: data }));
    });

    socket.on('user_stopped_typing', (data) => {
      // Dispatch stop typing event
      window.dispatchEvent(new CustomEvent('user_stopped_typing', { detail: data }));
    });

    // User activity events
    socket.on('user_activity_update', (data) => {
      // Dispatch activity event for admin dashboard
      window.dispatchEvent(new CustomEvent('user_activity_update', { detail: data }));
    });

    // Error handling
    socket.on('error', (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'Real-time connection error');
    });

    set({ socket });
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ 
        socket: null, 
        isConnected: false, 
        connectionStatus: 'disconnected',
        onlineUsers: [],
        activeEditors: {}
      });
    }
  },

  sendMessage: (event, data) => {
    const { socket, isConnected } = get();
    if (socket && isConnected) {
      socket.emit(event, data);
      
      // Update last activity
      set({ lastActivity: new Date().toISOString() });
    } else {
      console.warn('Cannot send message: Socket not connected');
      toast.error('Real-time connection not available');
    }
  },

  markNotificationRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      ),
      unreadCount: Math.max(0, state.unreadCount - 1)
    }));
  },

  markAllNotificationsRead: () => {
    set(state => ({
      notifications: state.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0
    }));
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },

  addNotification: (notification) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      read: false
    };

    set(state => ({
      notifications: [newNotification, ...state.notifications.slice(0, 49)], // Keep last 50
      unreadCount: state.unreadCount + 1
    }));

    // Show toast notification
    const toastOptions = {
      duration: notification.persistent ? 0 : 4000,
      position: 'top-right' as const
    };

    switch (notification.type) {
      case 'success':
        toast.success(notification.message, toastOptions);
        break;
      case 'error':
        toast.error(notification.message, toastOptions);
        break;
      case 'warning':
        toast(notification.message, { ...toastOptions, icon: '⚠️' });
        break;
      default:
        toast(notification.message, toastOptions);
    }
  },

  joinEditingSession: (resourceType, resourceId) => {
    get().sendMessage('join_editing_session', { resourceType, resourceId });
  },

  leaveEditingSession: (resourceType, resourceId) => {
    get().sendMessage('leave_editing_session', { resourceType, resourceId });
  },

  sendTypingIndicator: (resourceType, resourceId, isTyping) => {
    const room = `editing:${resourceType}:${resourceId}`;
    if (isTyping) {
      get().sendMessage('typing_start', { room, resource: resourceId });
    } else {
      get().sendMessage('typing_stop', { room, resource: resourceId });
    }
  },

  trackUserActivity: (activity) => {
    get().sendMessage('user_activity', activity);
  }
}));

// Auto-connect when user is authenticated
useAuthStore.subscribe((state) => {
  const realTimeStore = useRealTimeStore.getState();
  
  if (state.isAuthenticated && state.token && !realTimeStore.isConnected) {
    realTimeStore.connect(state.token);
  } else if (!state.isAuthenticated && realTimeStore.isConnected) {
    realTimeStore.disconnect();
  }
});