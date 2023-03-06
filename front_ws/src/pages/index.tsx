import { useEffect, useState } from "react"
import { io } from "socket.io-client"

// const socket = io("http://localhost:4242/ws-game", {transports:["websocket"]})

function Home() {
  // const [socket, setSocket] = useState<any>(null); // FIXME
  // const [isConnected, setIsConnected] = useState(socket.connected);
  const [connectedUser, setConnectedUser] = useState(0);
  const [socket, setSocket] = useState(io("http://localhost:4242/ws-game", {transports:["websocket"], autoConnect:false}));
  
  // useEffect(() => {
  //   // socket.on("connection", () => {
  //   //   setIsConnected(true);
  //   // })

  //   // socket.on("disconnect", () => {
  //   //   setIsConnected(false);
  //   // })
  
    
  //   return () => {
  //     socket.off('connect');
  //     socket.off('disconnect');
  //   };
  // }, [isConnected]);
  // useEffect(() => {
  // }, [])
  
  useEffect(() => {
    socket.connect();
    socket.on("ConnectedPlayer", (value:number) => {
      setConnectedUser(value);
    })
  },[])

  return (
    <>
      <main>
        <h1>Playground</h1>
        <h3>Connected Users: {connectedUser}</h3>
      </main>
    </>
  )
}

export default Home;