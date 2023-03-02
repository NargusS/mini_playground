import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'
import io from 'socket.io-client'

const socket = io('http://127.0.0.1:4242', {transports: ['websocket']});

function Playground(){
  const [player_role, setPlayer_role] = useState(0);
  const [player1, setPlayer1] = useState(0);
  const [player2, setPlayer2] = useState(0);

  function updateDisplay(event, canvas) {
    const ctx = canvas?.getContext('2d');
    if (player_role == 1)
      ctx.clearRect(0, 0, canvas.width * 0.03, canvas.height);
    else if (player_role == 2)
      ctx.clearRect(canvas.width - (canvas.width * 0.03), 0, canvas.width * 0.03, canvas.height);
    if (event.nativeEvent.offsetY <= 0){
      if (player_role == 1){
        ctx.fillStyle = 'rgba(0, 0, 255, 1)'
        ctx.fillRect(0, 0, canvas.width * 0.02, canvas.height * 0.1)
      }
      else if (player_role == 2){
        ctx.fillStyle = 'rgba(255, 0, 0, 1)'
        ctx.fillRect(canvas.width-(canvas.width * 0.02), 0, canvas.width * 0.02, canvas.height * 0.1)
      }
      socket.emit('test', {player:player_role, position: 0});
    }
    else if (event.nativeEvent.offsetY < canvas.height-(canvas.height * 0.1)){
      if (player_role == 1){
        ctx.fillStyle = 'rgba(0, 0, 255, 1)'
        ctx.fillRect(0, event.nativeEvent.offsetY, canvas.width * 0.02, canvas.height * 0.1)
      }
      else if (player_role == 2){
        ctx.fillStyle = 'rgba(255, 0, 0, 1)'
        ctx.fillRect(canvas.width-(canvas.width * 0.02), event.nativeEvent.offsetY, canvas.width * 0.02, canvas.height * 0.1)
      }
      socket.emit('test', {player:player_role, position: event.nativeEvent.offsetY});
    }
    else{
      if (player_role == 1){
        ctx.fillStyle = 'rgba(0, 0, 255, 1)'
        ctx.fillRect(0, canvas.height-(canvas.height * 0.1), canvas.width * 0.02, canvas.height * 0.1)
      }
      else if (player_role == 2){
        ctx.fillStyle = 'rgba(255, 0, 0, 1)'
        ctx.fillRect(canvas.width-(canvas.width * 0.02), canvas.height-(canvas.height * 0.1), canvas.width * 0.02, canvas.height * 0.1)
      }
      socket.emit('test', {player:player_role, position: canvas.height-(canvas.height * 0.1)});
    }
  }


  useEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas?.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 255, 1)'
    ctx.fillRect(0, 0, canvas.width * 0.02, canvas.height * 0.1)
    ctx.fillStyle = 'rgba(255, 0, 0, 1)'
    ctx.fillRect(canvas.width-(canvas.width * 0.02), 0, canvas.width * 0.02, canvas.height * 0.1)
    return () => {
      socket.off("disconnect");
    }
  }, [])

  socket.on('connect', () => {
    console.log('connected');
  })

  socket.on('playerid', (data) => {
    if (socket.id == data.id){
      setPlayer_role(data.player);
    }
  })
  

  useEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas?.getContext('2d');

    ctx.fillStyle = 'rgba(0, 0, 255, 1)'
    ctx.clearRect(0, 0, canvas.width * 0.03, canvas.height);
    ctx.fillRect(0, player1, canvas.width * 0.02, canvas.height * 0.1)
  }, [player1])

  useEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas?.getContext('2d');
  
    ctx.fillStyle = 'rgba(255, 0, 0, 1)'
    ctx.clearRect(canvas.width - (canvas.width * 0.03), 0, canvas.width * 0.03, canvas.height);
    ctx.fillRect(canvas.width-(canvas.width * 0.02), player2, canvas.width * 0.02, canvas.height * 0.1)
  }, [player2])

  socket.on('test', (data) => {
    if (data.player == 1)
      setPlayer1(data.position)
    else if (data.player == 2)
      setPlayer2(data.position)
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
