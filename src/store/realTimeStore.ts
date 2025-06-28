import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';
import toast from 'react-hot-toast';

interface RealTimeState {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
  }>;
  
  // Actions
  connect: (token: string) => void;
  disconnect: () => void;
  sendMessage: (event: string, data: any) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
}

export const useRealTimeStore = create<RealTimeState>((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  notifications: [],

  connect: (token) => {
    // For demo purposes, we'll simulate WebSocket connection
    // In production, this would connect to your actual WebSocket server
    const mockSocket = {
      connected: true,
      emit: (event: string, data: any) => {
        console.log('WebSocket emit:', event, data);
        
        // Simulate real-time updates
        if (event === 'article_updated' || event === 'article_created' || event === 'article_deleted') {
          window.dispatchEvent(new CustomEvent('content_updated', { detail: data }));
        }
        
        if (event === 'theme_updated') {
          window.dispatchEvent(new CustomEvent('theme_updated', { detail: data }));
        }
      },
      on: () => {},
      off: () => {},
      disconnect: () => {}
    } as any;

    set({ 
      socket: mockSocket, 
      isConnected: true,
      onlineUsers: ['admin', 'editor', 'user1', 'user2'] // Mock online users
    });

    // Simulate connection success
    setTimeout(() => {
      toast.success('Real-time connection established');
    }, 1000);

    console.log('Real-time connection established (demo mode)');
  },

  disconnect: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, onlineUsers: [] });
    }
  },

  sendMessage: (event, data) => {
    const { socket } = get();
    if (socket && socket.connected) {
      socket.emit(event, data);
      
      // Show real-time feedback
      switch (event) {
        case 'article_created':
          toast.success(`Article "${data.title}" created and synced to all users`);
          break;
        case 'article_updated':
          toast.success(`Article "${data.title}" updated and synced to all users`);
          break;
        case 'article_deleted':
          toast.success('Article deleted and synced to all users');
          break;
        case 'theme_updated':
          toast.success('Theme updated and applied to all users');
          break;
        case 'theme_reset':
          toast.success('Theme reset and applied to all users');
          break;
      }
    }
  },

  markNotificationRead: (id) => {
    set(state => ({
      notifications: state.notifications.map(n => 
        n.id === id ? { ...n, read: true } : n
      )
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  }
}));