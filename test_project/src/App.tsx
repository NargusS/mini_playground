import { useEffect, useState } from 'react'
import reactLogo from './assets/react.svg'
import './App.css'

function Playground(){
  const [position, setPosition] = useState(0);
  const [ctx, setCtx] = useState(null);
  
  function updateDisplay(event, canvas) {
    if (ctx !== null)
    {
      ctx.clearRect(canvas.width - (canvas.width * 0.03), 0, canvas.width * 0.03, canvas.height);
    }
    setCtx(canvas?.getContext('2d'))
    if (event.nativeEvent.offsetY < canvas.height-(canvas.height * 0.1))
      setPosition(event.nativeEvent.offsetY);
    else
      setPosition(canvas.height-(canvas.height * 0.1));
    ctx.fillStyle = 'rgba(0, 0, 255, 1)'
    ctx.fillRect(canvas.width-(canvas.width * 0.02), position, canvas.width * 0.02, canvas.height * 0.1)
  }

  // useEffect(() => {}, [position]);
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
