import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import { useEffect, useState, createContext } from 'react';
import { io, Socket } from 'socket.io-client';

export const SocketContext = createContext({} as Socket);

export default function App({ Component, pageProps }: AppProps) {
  const [socket, setSocket] = useState(io("http://localhost:4242/ws-game", {transports:["websocket"], autoConnect:false}));

  useEffect(() => {
    socket.connect();
  },[])

  return (
    <SocketContext.Provider value={socket}>
      <Component {...pageProps} />
    </SocketContext.Provider>
  );
}
