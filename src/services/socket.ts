import { io, Socket } from 'socket.io-client';

const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

let socket: Socket | null = null;

export function getSocketClient(): Socket {
  if (!socket) {
    socket = API_BASE_URL
      ? io(API_BASE_URL, {
          autoConnect: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000
        })
      : io({
          autoConnect: true,
          reconnectionAttempts: 10,
          reconnectionDelay: 1000
        });
  }
  return socket;
}
