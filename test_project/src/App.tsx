import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import io from 'socket.io-client'

const socket = io('http://10.18.199.128:4242', {transports: ['websocket']});

function Playground(){
  const [otherplayer, setOtherPlayer] = useState(0);
  const [player, setPlayer] = useState(0);

  function updateDisplay(event, canvas) {
    const ctx = canvas?.getContext('2d');
    if (player == 1)
      ctx.clearRect(0, 0, canvas.width * 0.03, canvas.height);
    else if (player == 2)
      ctx.clearRect(canvas.width - (canvas.width * 0.03), 0, canvas.width * 0.03, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 255, 1)'
    if (event.nativeEvent.offsetY <= 0){
      if (player == 1)
        ctx.fillRect(0, 0, canvas.width * 0.02, canvas.height * 0.1)
      else if (player == 2)
      ctx.fillRect(canvas.width-(canvas.width * 0.02), 0, canvas.width * 0.02, canvas.height * 0.1)
      socket.emit('test', {player:player, position: 0});
    }
    else if (event.nativeEvent.offsetY < canvas.height-(canvas.height * 0.1)){
      if (player == 1)
        ctx.fillRect(0, event.nativeEvent.offsetY, canvas.width * 0.02, canvas.height * 0.1)
      else if (player == 2)
        ctx.fillRect(canvas.width-(canvas.width * 0.02), event.nativeEvent.offsetY, canvas.width * 0.02, canvas.height * 0.1)
      socket.emit('test', {player:player, position: event.nativeEvent.offsetY});
    }
    else{
      if (player == 1)
        ctx.fillRect(0, canvas.height-(canvas.height * 0.1), canvas.width * 0.02, canvas.height * 0.1)
      else if (player == 2)
        ctx.fillRect(canvas.width-(canvas.width * 0.02), canvas.height-(canvas.height * 0.1), canvas.width * 0.02, canvas.height * 0.1)
      socket.emit('test', {player:player, position: canvas.height-(canvas.height * 0.1)});
    }
  }


  useEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas?.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 255, 1)'
    if (player == 1)
      ctx.fillRect(0, 0, canvas.width * 0.02, canvas.height * 0.1)
    else if (player == 2)
      ctx.fillRect(canvas.width-(canvas.width * 0.02), 0, canvas.width * 0.02, canvas.height * 0.1)
    ctx.fillStyle = 'rgba(255, 0, 0, 1)'
    if (player == 1)
      ctx.fillRect(canvas.width-(canvas.width * 0.02), 0, canvas.width * 0.02, canvas.height * 0.1)
    else if (player == 2)
      ctx.fillRect(0, 0, canvas.width * 0.02, canvas.height * 0.1)
    return () => {
      socket.off("disconnect");
    }
  }, [])

  useEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas?.getContext('2d');
    if (player == 1)
      ctx.clearRect(canvas.width - (canvas.width * 0.03), 0, canvas.width * 0.03, canvas.height);
    else if (player == 2)
      ctx.clearRect(0, 0, canvas.width * 0.03, canvas.height);
    ctx.fillStyle = 'rgba(255, 0, 0, 1)'
    ctx.fillRect(0, otherplayer, canvas.width * 0.02, canvas.height * 0.1)
  }, [otherplayer])

  socket.on('connect', () => {
    console.log('connected');
  })

  socket.on('playerid', (data) => {
    if (socket.id == data.id){
      setPlayer(data.player);
    }
  })


  socket.on('test', (data) => {
    console.log(data);
    if (player==1 && data.player == 2)
      setOtherPlayer(data.position);
    else if (player==2 && data.player == 1)
      setOtherPlayer(data.position);
  });

  return (
  <>
    <canvas id="canvas" width={window.innerWidth/2} height={window.innerHeight/2} className="border-slate-700 border-8" onMouseMove={(evt)=> updateDisplay(evt, document.getElementById("canvas"))} onMouseEnter={(evt)=> updateDisplay(evt, document.getElementById("canvas"))} onMouseLeave={(evt)=> updateDisplay(evt, document.getElementById("canvas"))}></canvas>
  </>
 ); 
}

function App() {
  return (
    <div className="w-screen h-screen top-0 left-0 absolute grid grid-cols-1 items-center justify-items-center">
      <Playground />
    </div>
  )
}

export default App
