import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function Playground(){
  const [otherplayer, setOtherPlayer] = useState(0);

  function updateDisplay(event, canvas) {
    const ctx = canvas?.getContext('2d');
    ctx.clearRect(canvas.width - (canvas.width * 0.03), 0, canvas.width * 0.03, canvas.height);
    ctx.fillStyle = 'rgba(0, 0, 255, 1)'
    if (event.nativeEvent.offsetY <= 0)
      ctx.fillRect(canvas.width-(canvas.width * 0.02), 0, canvas.width * 0.02, canvas.height * 0.1)
    else if (event.nativeEvent.offsetY < canvas.height-(canvas.height * 0.1))
      ctx.fillRect(canvas.width-(canvas.width * 0.02), event.nativeEvent.offsetY, canvas.width * 0.02, canvas.height * 0.1)
    else
      ctx.fillRect(canvas.width-(canvas.width * 0.02), canvas.height-(canvas.height * 0.1), canvas.width * 0.02, canvas.height * 0.1)
  }
  
  async function updateOtherplayer(canvas){

  }

  useEffect(() => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas?.getContext('2d');
    ctx.fillStyle = 'rgba(0, 0, 255, 1)'
    ctx.fillRect(canvas.width-(canvas.width * 0.02), 0, canvas.width * 0.02, canvas.height * 0.1)
    // ctx.fillStyle = 'rgba(255, 0, 0, 1)'
    // ctx.fillRect(0, 0, canvas.width * 0.02, canvas.height * 0.1)
  }, [])

  useEffect(() => {
    const updateOtherplayer = setInterval(() => {
      const canvas = document.getElementById("canvas");
      const ctx = canvas?.getContext('2d');
      ctx.clearRect(0, 0, canvas.width * 0.03, canvas.height);
      setOtherPlayer(value => {
        if (value < canvas.height-(canvas.height * 0.1))
          return value + 1
        else
          return 0
      })
      ctx.fillStyle = 'rgba(255, 0, 0, 1)'
      ctx.fillRect(0, otherplayer, canvas.width * 0.02, canvas.height * 0.1)
    }, 10);
    return () => {
      clearInterval(updateOtherplayer)
    }
  }, [otherplayer])
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
