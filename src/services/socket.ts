import { io, Socket } from 'socket.io-client';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'https://nourishnet-56.onrender.com').replace(/\/$/, '');
console.log("USING API URL:", API_BASE_URL);

let socket: Socket | null = null;

export function getSocketClient(): Socket {
  if (!socket) {
    socket = io(API_BASE_URL, {
      autoConnect: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });
  }
  return socket;
}
