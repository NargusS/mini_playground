import { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from './_app';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io-client';

async function fetchRole(id_game:string, playerId:string){
	const res = await fetch("http://localhost:3000/ws-game/rooms/"+ id_game + "/"+ playerId);
	const data = await res.json();
	return data;
}

function Playground(props:{role:number, id_game:string, socket:Socket}){
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const role = props.role;
	const id_game = props.id_game;
	const socket = props.socket;
	const [size, setSize] = useState({orientation:0, width: 0, height: 0});
	const [player1, setPlayer1] = useState(0);
	const [player2, setPlayer2] = useState(0);
	const [prevPos, setPrevPos] = useState(0);
	

	useEffect(() => {
		function updateWindowDimensions() {
			const width = window.innerWidth * 0.8;
			const height = window.innerHeight * 0.8;
	
			if (width > height){
				if (width > height * (1.75))
					setSize({orientation:0, width: height*(1.75), height: height});
				else
					setSize({orientation:0, width: width, height: width/1.75});
			}
			else
			{
				if (height > width * (1.75))
					setSize({orientation:1,width: width, height: width*(1.75)});
				else
					setSize({orientation:1,width: height/1.75, height: height});
			}
		}
		updateWindowDimensions();
		window.addEventListener("resize", updateWindowDimensions);
		return () => window.removeEventListener("resize", updateWindowDimensions);
	}, [])

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas)
			return;//console.log("canvas is null");
		socket.on('UpdateCanvas', (data) => {
			if (data.player_role == 1)
		  		setPlayer1(data.position)
			else if (data.player_role == 2)
		  		setPlayer2(data.position)
		});
		// const ctx = canvas?.getContext('2d');
		// if (!ctx)
		// 	return;//console.log("ctx is null");
		// if (size.orientation === 0){
		// 	ctx.fillStyle = 'rgba(0, 0, 255, 1)'
		// 	ctx.fillRect(0, 0, canvas.width * 0.02, canvas.height * 0.1)
		// 	ctx.fillStyle = 'rgba(255, 0, 0, 1)'
		// 	ctx.fillRect(canvas.width-(canvas.width * 0.02), 0, canvas.width * 0.02, canvas.height * 0.1)
		// }
		// else{
		// 	ctx.fillStyle = 'rgba(0, 0, 255, 1)'
		// 	ctx.fillRect(0, 0, canvas.width * 0.1, canvas.height * 0.02)
		// 	ctx.fillStyle = 'rgba(255, 0, 0, 1)'
		// 	ctx.fillRect(0, canvas.height-(canvas.height * 0.02), canvas.width * 0.1, canvas.height * 0.02)
		// }
	}, [])

	function updateDisplay(event:any) {
		const canvas = canvasRef.current;
		if(!canvas)
			return;//console.log("canvas is null");
		const ctx = canvas.getContext('2d');
		if (!ctx)
			return;//console.log("ctx is null");
		// CHANGE POURCENTAGE FOR SPEED		
		if (size.orientation == 0 && Math.abs((prevPos / canvas.height) - (event.nativeEvent.offsetY/canvas.height)) < 0.03){
			return;
		}
		else if (size.orientation == 1 && Math.abs((prevPos / canvas.width) - (event.nativeEvent.offsetX/canvas.width)) < 0.03){
			return;
		}
		else{
			if (size.orientation == 0){
				setPrevPos(event.nativeEvent.offsetY);
			}
			else{
				setPrevPos(event.nativeEvent.offsetX);
			}
		}

		if (size.orientation == 0){
			if (role == 1)
				ctx.clearRect(0, 0, canvas.width * 0.03, canvas.height);
			else if (role == 2)
				ctx.clearRect(canvas.width - (canvas.width * 0.03), 0, canvas.width * 0.03, canvas.height);
			if (event.nativeEvent.offsetY <= 0){
				if (role == 1){
				ctx.fillStyle = 'rgba(0, 0, 255, 1)'
				ctx.fillRect(0, 0, canvas.width * 0.02, canvas.height * 0.1)
				}
				else if (role == 2){
				ctx.fillStyle = 'rgba(255, 0, 0, 1)'
				ctx.fillRect(canvas.width-(canvas.width * 0.02), 0, canvas.width * 0.02, canvas.height * 0.1)
				}
				socket.emit('MakeMove', {id_game:id_game,player:role, position: 0});
			}
			else if (event.nativeEvent.offsetY < canvas.height-(canvas.height * 0.1)){
				if (role == 1){
				ctx.fillStyle = 'rgba(0, 0, 255, 1)'
				ctx.fillRect(0, event.nativeEvent.offsetY, canvas.width * 0.02, canvas.height * 0.1)
				}
				else if (role == 2){
				ctx.fillStyle = 'rgba(255, 0, 0, 1)'
				ctx.fillRect(canvas.width-(canvas.width * 0.02), event.nativeEvent.offsetY, canvas.width * 0.02, canvas.height * 0.1)
				}
				socket.emit('MakeMove', {id_game:id_game,player:role, position: event.nativeEvent.offsetY/(canvas.height)});
			}
			else{
				if (role == 1){
					ctx.fillStyle = 'rgba(0, 0, 255, 1)'
					ctx.fillRect(0, canvas.height-(canvas.height * 0.1), canvas.width * 0.02, canvas.height * 0.1)
				}
				else if (role == 2){
					ctx.fillStyle = 'rgba(255, 0, 0, 1)'
					ctx.fillRect(canvas.width-(canvas.width * 0.02), canvas.height-(canvas.height * 0.1), canvas.width * 0.02, canvas.height * 0.1)
				}
				socket.emit('MakeMove', {id_game:id_game,player:role, position: 0.9});
			}
		}
		else{
			// ORIENTATION 1
			if (role == 1)
				ctx.clearRect(0, canvas.height - (canvas.height * 0.03), canvas.width, canvas.height* 0.03);
			else if (role == 2)
				ctx.clearRect(0, 0, canvas.width, canvas.height * 0.03);
			if (event.nativeEvent.offsetX <= 0){
				if (role == 1){
					ctx.fillStyle = 'rgba(0, 0, 255, 1)'
					ctx.fillRect(0, canvas.height - (canvas.height * 0.02), canvas.width * 0.1, canvas.height * 0.02)
				}
				else if (role == 2){
					ctx.fillStyle = 'rgba(255, 0, 0, 1)'
					ctx.fillRect(0, 0, canvas.width * 0.1, canvas.height * 0.02)
				}
				socket.emit('MakeMove', {id_game:id_game,player:role, position: 0});
			}
			else if (event.nativeEvent.offsetX < canvas.width-(canvas.width * 0.1)){
				if (role == 1){
					ctx.fillStyle = 'rgba(0, 0, 255, 1)'
					ctx.fillRect(event.nativeEvent.offsetX, canvas.height - (canvas.height * 0.02), canvas.width * 0.1, canvas.height * 0.02)
				}
				else if (role == 2){
					ctx.fillStyle = 'rgba(255, 0, 0, 1)'
					ctx.fillRect(event.nativeEvent.offsetX, 0, canvas.width * 0.1, canvas.height * 0.02)
				}
				socket.emit('MakeMove', {id_game:id_game,player:role, position: event.nativeEvent.offsetX/(canvas.width)});
			}
			else{
				if (role == 1){
					ctx.fillStyle = 'rgba(0, 0, 255, 1)'
					ctx.fillRect(canvas.width - (canvas.width * 0.1), canvas.height - (canvas.height * 0.02), canvas.width * 0.1, canvas.height * 0.02)
				}
				else if (role == 2){
					ctx.fillStyle = 'rgba(255, 0, 0, 1)'
					ctx.fillRect(canvas.width - (canvas.width * 0.1), 0, canvas.width * 0.1, canvas.height * 0.02)
				}
				socket.emit('MakeMove', {id_game:id_game,player:role, position: 0.9});
			}
		}
	}
  
  
	
  
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas)
			return;// throw new Error("Canvas not found");
		const ctx = canvas?.getContext('2d');
		if (!ctx)
			return;// throw new Error("Context not found");
		ctx.fillStyle = 'rgba(0, 0, 255, 1)'
		if (size.orientation == 0){
			ctx.clearRect(0, 0, canvas.width * 0.03, canvas.height);
			ctx.fillRect(0, canvas.height * player1, canvas.width * 0.02, canvas.height * 0.1)
		}
		else{
			ctx.clearRect(0, canvas.height - (canvas.height * 0.03), canvas.width, canvas.height * 0.03);
			ctx.fillRect(player1 * canvas.width, canvas.height - (canvas.height * 0.02), canvas.width * 0.1, canvas.height * 0.02)
		}
	}, [player1])
  
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas)
		  return;// throw new Error("Canvas not found");
		const ctx = canvas?.getContext('2d');
		if (!ctx)
		  return;// throw new Error("Context not found");
		ctx.fillStyle = 'rgba(255, 0, 0, 1)'
		if (size.orientation == 0){
			ctx.clearRect(canvas.width - (canvas.width * 0.03), 0, canvas.width * 0.03, canvas.height);
			ctx.fillRect(canvas.width-(canvas.width * 0.02), canvas.height*player2, canvas.width * 0.02, canvas.height * 0.1)
		}
		else
		{
			ctx.clearRect(0, 0, canvas.width, canvas.height * 0.03);
			ctx.fillRect(player2 * canvas.width, 0, canvas.width * 0.1, canvas.height * 0.02)
		}
	}, [player2])

	return (
		<>
			<canvas id="canvas" ref={canvasRef} width={size.width} height={size.height} className="border-slate-700 border-8" onMouseMove={(evt)=> updateDisplay(evt)}  onMouseLeave={(evt)=> updateDisplay(evt)}></canvas>
		</>
	);
}

function GamePage({}) {
	const router = useRouter();
	const [id_game, setId_game] = useState<string>("");
	const socket = useContext(SocketContext);
	const [role, setPlayer_role] = useState<number>(0);
	
	useEffect(() => {
		if (!socket.connected)
			socket.connect();
		console.log("Role: " + role + " id_game: " + id_game + " socket: " + socket.connected);
		if (router.isReady){
			setId_game(router.query.id_game as string);
			if (sessionStorage.playerId == undefined){
				sessionStorage.setItem("playerId", uuidv4());
				socket.emit("ClientSession", sessionStorage.playerId);
			}
			else
				socket.emit("ClientSession", sessionStorage.playerId);
			socket.emit('JoinRoom', {room_name:id_game, playerId:sessionStorage.playerId});
			if (id_game != "" && sessionStorage.playerId != undefined){
				fetchRole(id_game, sessionStorage.playerId).then((data:number) => {
					setPlayer_role(data);
				})
			}
		}
	},[socket,router.isReady, id_game, role]);

	return (
		<div className="w-screen h-screen top-0 left-0 absolute grid grid-cols-1 items-center justify-items-center">
			{id_game !== "" && role !== 0 ? <Playground role={role} id_game={id_game} socket={socket}/> : <div>Loading...</div> }
		</div>
	)
}

export default GamePage;