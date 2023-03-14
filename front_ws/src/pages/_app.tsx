import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState, createContext } from 'react';
import { io, Socket } from 'socket.io-client';

export const SocketContext = createContext({} as Socket);

export default function App({ Component, pageProps }: AppProps) {
  const [socket, setSocket] = useState(io("http://10.18.199.128:4242/ws-game", {transports:["websocket"], autoConnect:false, reconnection:true,reconnectionAttempts: 3, reconnectionDelay: 1000}));

  return (
    <SocketContext.Provider value={socket}>
      <Component {...pageProps} />
    </SocketContext.Provider>
  );
}
