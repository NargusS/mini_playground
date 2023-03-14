import { useRouter } from 'next/router';
import { useContext, useEffect, useRef, useState } from 'react';
import { SocketContext } from './_app';
import { v4 as uuidv4 } from 'uuid';
import { Socket } from 'socket.io-client';
import data from './game_data.ts';

async function fetchRole(id_game:string, playerId:string){
	const res = await fetch("http://localhost:3000/ws-game/rooms/"+ id_game + "/"+ playerId);
	const data = await res.json();
	return data;
}

function drawBall(canvas:HTMLCanvasElement){
	const ctx = canvas.getContext('2d');
	if (!ctx)
		return;//console.log("ctx is null");
	ctx.beginPath();
	ctx.arc(canvas.width * data.ballObj.x, canvas.height * data.ballObj.y, canvas.width * data.ballObj.radius, 0, 2 * Math.PI);
	ctx.fillStyle = "yellow";
	ctx.fill();
	ctx.closePath();
	data.ballObj.x += (data.ballObj.dx * data.ballObj.speed);
	data.ballObj.y += (data.ballObj.dy * data.ballObj.speed);
}

function wallColission(canvas:HTMLCanvasElement){
	if (canvas.width == 0 || canvas.height == 0)
		return;
	if (data.playground.orientation == 0){
		if ((data.ballObj.x * canvas.width) - (canvas.width * data.ballObj.radius) <= (canvas.width * data.player2.width) && (data.ballObj.y >= data.player2.y && data.ballObj.y <= data.player2.y + data.player2.height) ){
			data.ballObj.dx = -data.ballObj.dx;
		}
		else if ((data.ballObj.x * canvas.width) + (canvas.width * data.ballObj.radius) >= (canvas.width - (canvas.width * data.player1.width)) && (data.ballObj.y >= data.player1.y && data.ballObj.y <= data.player1.y + data.player1.height)){
			data.ballObj.dx = -data.ballObj.dx;
		}
		else if ((data.ballObj.x * canvas.width) - (canvas.width * data.ballObj.radius) <= (canvas.width * data.player1.width)){
			console.log("GOAL 1: ORIENTATION 0")
			data.ballObj.x = 0.5;
			data.ballObj.y = 0.5;
		}
		else if ((data.ballObj.x * canvas.width) + (canvas.width * data.ballObj.radius) >= (canvas.width - (canvas.width * data.player2.width))){
			console.log("GOAL 2 Orientation 0")
			data.ballObj.x = 0.5;
			data.ballObj.y = 0.5;
		}
		else if ((data.ballObj.y * canvas.height) - (canvas.width * data.ballObj.radius) < 0){
			data.ballObj.dy = -data.ballObj.dy;
		}
		else if ((data.ballObj.y * canvas.height) + (canvas.width * data.ballObj.radius)  >= canvas.height){
			data.ballObj.dy = -data.ballObj.dy;
		}
	}
	else if (data.playground.orientation == 1){
		if ((data.ballObj.y * canvas.height) - (canvas.width * data.ballObj.radius) <= (canvas.height * data.player2.height) && (data.ballObj.x >= data.player2.x && data.ballObj.x <= data.player2.x + data.player2.width) ){
			data.ballObj.dy = -data.ballObj.dy;
		}
		else if ((data.ballObj.y * canvas.height) + (canvas.width * data.ballObj.radius) >= (canvas.height - (canvas.height * data.player1.height)) && (data.ballObj.x >= data.player1.x && data.ballObj.x <= data.player1.x + data.player1.width)){
			data.ballObj.dy = -data.ballObj.dy;
		}
		else if ((data.ballObj.y * canvas.height) - (canvas.width * data.ballObj.radius) <= (canvas.height * data.player2.height)){
			console.log("GOAL 2 Orientation 1")
			data.ballObj.x = 0.5;
			data.ballObj.y = 0.5;
		}
		else if ((data.ballObj.y * canvas.height) + (canvas.width * data.ballObj.radius) >= (canvas.height - (canvas.height * data.player1.height))){
			console.log("GOAL 1 Orientation 1")
			data.ballObj.x = 0.5;
			data.ballObj.y = 0.5;
		}
		else if ((data.ballObj.x * canvas.width) - (canvas.width * data.ballObj.radius) < 0){
			data.ballObj.dx = -data.ballObj.dx;
		}
		else if ((data.ballObj.x * canvas.width) + (canvas.width * data.ballObj.radius)  >= canvas.width){
			data.ballObj.dx = -data.ballObj.dx;
		}
	}
}

function drawPlayer(canvas:HTMLCanvasElement){
	const ctx = canvas.getContext('2d');
	if (!ctx)
		return;//console.log("ctx is null");
	if (data.playground.orientation == 0){
		data.player1.x = 0;
		data.player2.x = 1 - data.player2.width;
		if (data.player1.y < 0)
			data.player1.y = 0;
		else if (data.player1.y > 1 - data.player1.height)
			data.player1.y = 1 - data.player1.height;
		if (data.player2.y < 0)
			data.player2.y = 0;
		else if (data.player2.y > 1 - data.player2.height)
			data.player2.y = 1 - data.player2.height;
		ctx.fillStyle = 'rgba(0, 0, 255, 1)'
		ctx.fillRect(canvas.width-(canvas.width * data.player2.width), data.player1.y * canvas.height, canvas.width * data.player1.width, canvas.height * data.player1.height)
		ctx.fillStyle = 'rgba(255, 0, 0, 1)'
		ctx.fillRect(0, data.player2.y * canvas.height, canvas.width * data.player2.width, canvas.height * data.player2.height)
	}
	else if (data.playground.orientation == 1){
		data.player1.y = 0;
		data.player2.y = 1 - data.player2.height;
		if (data.player1.x < 0)
			data.player1.x = 0;
		else if (data.player1.x > 1 - data.player1.width)
			data.player1.x = 1 - data.player1.width;
		if (data.player2.x < 0)
			data.player2.x = 0;
		else if (data.player2.x > 1 - data.player2.width)
			data.player2.x = 1 - data.player2.width;
		ctx.fillStyle = 'rgba(0, 0, 255, 1)'
		ctx.fillRect(data.player1.x * canvas.width, canvas.height - (canvas.height * data.player2.height), canvas.width * data.player1.width, canvas.height * data.player1.height)
		ctx.fillStyle = 'rgba(255, 0, 0, 1)'
		ctx.fillRect(data.player2.x * canvas.width, 0, canvas.width * data.player2.width, canvas.height * data.player2.height)
	}
}

function Playground(props:{role:number, id_game:string, socket:Socket}){
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const role = props.role;
	const id_game = props.id_game;
	const socket = props.socket;
	const [size, setSize] = useState({
		orientation: -1,
		width: 0,
		height: 0
	});
	const [prevPos, setPrevPos] = useState(0);
	
	
	
	function getCanvasSize(){
		const width = window.innerWidth * 0.9;
		const height = window.innerHeight * 0.6;

		if (width > height){
			data.playground.orientation = 0;
			data.player1.width = 0.02;
			data.player1.height = 0.2;
			data.player2.width = 0.02;
			data.player2.height = 0.2;
			if (width * (4/7) < height){
				setSize({orientation:0, width: width, height: width*(4/7)});
				data.playground.width = width;
				data.playground.height = width*(4/7);
			}
			else{
				setSize({orientation:0, width: height*(7/4), height: height});
				data.playground.width = height*(7/4);
				data.playground.height = height;
			}
		}
		else
		{
			data.playground.orientation = 1;
			data.player1.width = 0.2;
			data.player1.height = 0.02;
			data.player2.width = 0.2;
			data.player2.height = 0.02;
			if (height * (4/7) < width){
				setSize({orientation:1,width: height*(4/7), height: height});
				data.playground.width = height*(4/7);
				data.playground.height = height;
			}
			else{
				data.playground.width = width;
				data.playground.height = width*(7/4);
				setSize({orientation:1,width: width, height: width*(7/4)});
			}
		}
	}

	// useEffect(() => {
	// 	const canvas = canvasRef.current;
	// 	if (!canvas)
	// 	return;//console.log("canvas is null");
	// 	socket.on('UpdateCanvas', (data) => {
	// 		if (data.player_role == 1)
	// 			setPlayer1(data.position)
	// 		else if (data.player_role == 2)
	// 			setPlayer2(data.position)
	// 	});
	// 	getCanvasSize();
	// 	window.addEventListener('resize', getCanvasSize);
	// 	return () => {
	// 		window.removeEventListener('resize', getCanvasSize);
	// 	}
	// }, [])

	// useEffect(() => {
	// 	const canvas = canvasRef.current;
	// 	if (!canvas)
	// 		return;//console.log("canvas is null");
	// 	const ctx = canvas.getContext('2d');
	// 	if (!ctx)
	// 		return;//console.log("ctx is null");
	// 	// posBall.x = canvas.width * 0.5;
	// 	// posBall.y = canvas.height * 0.5;
	// 	setInterval(() => {
	// 		// console.log(posBall);
	// 		// else if (posBall.x * canvas.width > 0.02 && posBall.x * canvas.width < (canvas.width * 0.04) && posBall.y * canvas.height > player2 && posBall.y * canvas.height < (player2 + (canvas.height * 0.5))){
	// 			// 	// console.log("player 2 hit")
	// 			// 	posBall.x = 0.04;
	// 			// 	posBall.dx = -posBall.dx;
	// 			// }
	// 			// console.log(posBall.x * canvas.width + " POS " + posBall.y * canvas.height);
	// 			// if (posBall.x * canvas.width > 0 && posBall.x * canvas.width < (canvas.width * 0.03) && canvas.height * posBall.y > player1 && canvas.height * posBall.y < (player1 + (canvas.height * 0.3))){
	// 				// 	posBall.dx = -posBall.dx;
	// 				// 	posBall.x = 0.03;
	// 				// }
			// if (posBall.x * canvas.width > 0 && posBall.x * canvas.width < (canvas.width * 0.03)){
			// 	posBall.dx = -posBall.dx;
			// }
			// else if (posBall.y * canvas.height > 0 && posBall.y * canvas.height < (canvas.height * 0.03)){
			// 	posBall.y = 0.03;
			// 	posBall.dy = -posBall.dy;
			// }
			// else if (posBall.x * canvas.width > (canvas.width - (canvas.width * 0.03)) && posBall.x * canvas.width < canvas.width){
			// 	posBall.dx = -posBall.dx;
			// }
			// else if (posBall.y * canvas.height >= (canvas.height - (canvas.height * 0.03)) && posBall.y*canvas.height <= canvas.height){
			// 	posBall.y = 0.97;
			// 	posBall.dy = -posBall.dy;
			// }
	// 		ctx.beginPath();
	// 		ctx.clearRect(canvas.width * 0.02, 0, canvas.width - (canvas.width * 0.04), canvas.height);
	// 		ctx.closePath();
	// 		ctx.fillStyle = 'rgba(255, 0, 0, 1)'
	// 		ctx.beginPath();
	// 		ctx.arc(canvas.width * posBall.x, canvas.height * posBall.y, canvas.width * 0.01, 0, 2 * Math.PI);
	// 		ctx.fill();
	// 		ctx.closePath();
	// 		posBall.x += posBall.dx;
	// 		posBall.y += posBall.dy;
	// 	}, 1000/15);
	// }, [])

	useEffect(() => {
		socket.on('UpdateCanvas', (data) => {
			if (data.player_role == 1)
				data.position = data.player1;	
			else if (data.player_role == 2)
				data.position = data.player2;
		});
		getCanvasSize();
		console.log(size.height)
		const canvas = canvasRef.current;
		if (!canvas)
			return;//console.log("canvas is null");
		const render = () => {
			const ctx = canvas.getContext('2d');
			if (!ctx)
			return;//console.log("ctx is null");
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			drawBall(canvas);
			wallColission(canvas);
			drawPlayer(canvas);
			requestAnimationFrame(render);
		};
		render();
		window.addEventListener('resize', getCanvasSize);
		return () => {
			window.removeEventListener('resize', getCanvasSize);
		}
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
			else if (size.orientation == 1){
				setPrevPos(event.nativeEvent.offsetX);
			}
			else
				return;
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
					ctx.fillRect(canvas.width-(canvas.width * 0.02), event.nativeEvent.offsetY, canvas.width * 0.02, canvas.height * 0.1)/////
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
		else if (size.orientation == 1){
			// size.orientation 1
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
  
  
	
  
	// useEffect(() => {
	// 	const canvas = canvasRef.current;
	// 	if (!canvas)
	// 		return;// throw new Error("Canvas not found");
	// 	const ctx = canvas?.getContext('2d');
	// 	if (!ctx)
	// 		return;// throw new Error("Context not found");
	// 	ctx.fillStyle = 'rgba(0, 0, 255, 1)'
	// 	if (size.orientation == 0){
	// 		ctx.clearRect(0, 0, canvas.width * 0.03, canvas.height);
	// 		ctx.fillRect(0, canvas.height * player1, canvas.width * 0.02, canvas.height * 0.1)
	// 	}
	// 	else if (size.orientation == 1){
	// 		ctx.clearRect(0, canvas.height - (canvas.height * 0.03), canvas.width, canvas.height * 0.03);
	// 		ctx.fillRect(player1 * canvas.width, canvas.height - (canvas.height * 0.02), canvas.width * 0.1, canvas.height * 0.02)
	// 	}
	// }, [player1])
  
	// useEffect(() => {
	// 	const canvas = canvasRef.current;
	// 	if (!canvas)
	// 	  return;// throw new Error("Canvas not found");
	// 	const ctx = canvas?.getContext('2d');
	// 	if (!ctx)
	// 	  return;// throw new Error("Context not found");
	// 	ctx.fillStyle = 'rgba(255, 0, 0, 1)'
	// 	if (size.orientation == 0){
	// 		ctx.clearRect(canvas.width - (canvas.width * 0.03), 0, canvas.width * 0.03, canvas.height);
	// 		ctx.fillRect(canvas.width-(canvas.width * 0.02), canvas.height*player2, canvas.width * 0.02, canvas.height * 0.1)
	// 	}
	// 	else if (size.orientation == 1)
	// 	{
	// 		ctx.clearRect(0, 0, canvas.width, canvas.height * 0.03);
	// 		ctx.fillRect(player2 * canvas.width, 0, canvas.width * 0.1, canvas.height * 0.02)
	// 	}
	// }, [player2])

	return (
		<div className="h-[70vh] w-full flex flex-col justify-center items-center">
			{/* <canvas id="canvas" ref={canvasRef} width={size.width} height={size.height} className="border-slate-700 border-8" onMouseMove={(evt)=> updateDisplay(evt)}  onMouseLeave={(evt)=> updateDisplay(evt)}></canvas> */}
			<canvas id="canvas" ref={canvasRef} width={size.width} height={size.height} className="border-slate-700 border-8" onMouseMove={(evt)=> {
				const canvas = canvasRef.current;
				if (!canvas)
					return;// throw new Error("Canvas not found");
				if (size.orientation == 0){
					if (role == 1)
						data.player1.y = evt.nativeEvent.offsetY/(canvas.height);
					else if (role == 2)
						data.player2.y = evt.nativeEvent.offsetY/(canvas.height);
				}
				else if (size.orientation == 1){
					if (role == 1)
						data.player1.x = evt.nativeEvent.offsetX/(canvas.width);
					else if (role == 2)
						data.player2.x = evt.nativeEvent.offsetX/(canvas.width);
				}
			}}  onMouseLeave={(evt)=> {
				const canvas = canvasRef.current;
				if (!canvas)
					return;// throw new Error("Canvas not found");
				if (size.orientation == 0){
					if (role == 1)
						data.player1.y = evt.nativeEvent.offsetY/(canvas.height);
					else if (role == 2)
						data.player2.y = evt.nativeEvent.offsetY/(canvas.height);
				}
				else if (size.orientation == 1){
					if (role == 1)
						data.player1.x = evt.nativeEvent.offsetX/(canvas.width);
					else if (role == 2)
						data.player2.x = evt.nativeEvent.offsetX/(canvas.width);
				}
			}}></canvas>
		</div>
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
	},[]);

	useEffect(() => {
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
	},[router.isReady, id_game, role]);

	return (
		<div className="w-screen h-screen top-0 left-0 absolute flex flex-col items-center justify-center">
			{/* <div className="w-screen h-screen absolute top-0 left-0 z-10 bg-black opacity-25">
			</div>
			<div className="absolute w-[90%] h-[70%] bg-white z-20 flex flex-col items-center justify-around">
				<h1 className="w-fit text-5xl">YOU WIN!!!!</h1>
				<h1 className="w-fit text-5xl">Score: 1:0</h1>
				<button className="bg-red-200 p-3 rounded-xl w-fit text-2xl">GO BACK TO MENU</button>
			</div> */}
			<div className="w-full h-[10vh] inline-flex justify-center items-center gap-2">
				<h1 className="w-fit h-min sm:text-4xl text-sm">1:0</h1>
				<div className="">
					<button className="sm:text-2xl text-sm bg-red-200 rounded-lg p-2" onClick={() => {
						socket.emit('LeaveRoom', {room_name:id_game, playerId:sessionStorage.playerId});
						router.push("/");
					}}>QUIT</button>
				</div>
			</div>
			{id_game !== "" && role !== 0 && socket.connected ? <Playground role={role} id_game={id_game} socket={socket}/> : <div>Loading...</div> }
			<div className="h-[20vh] max-w-screen w-screen inline-flex">
				<div className="grow bg-slate-600 flex flex-col">
					<h1 className="sm:text-xl text-sm w-full h-fit bg-slate-800 text-white text-center">CHAT</h1>
					<ul className="grow overflow-y-scroll flex flex-col p-3 sm:text-xl text-xs">
						<li className="w-fit h-fit">
							<p className="text-white font-bold">esafar</p>
							<p className="text-white font-light">Bonne Game les gars</p>
						</li>
						<li className="w-fit h-fit">
							<p className="text-white font-bold">achane-l</p>
							<p className="text-white font-light">Merci</p>
						</li>
						<li className="w-fit h-fit">
							<p className="text-white font-bold">mderome</p>
							<p className="text-white font-light">Je vais le battre tellement facilement</p>
						</li>
						<li className="w-fit h-fit">
							<p className="text-white font-bold">cmenasse</p>
							<p className="text-white font-light">100€ sur mderome</p>
						</li>
						<li className="w-fit h-fit">
							<p className="text-white font-bold">esafar</p>
							<p className="text-white font-light">T fou mec 150€ sur achane-l</p>
						</li>
						<li className="w-fit h-fit">
							<p className="text-white font-bold">chduong</p>
							<p className="text-white font-light">On va bien voir</p>
						</li>
					</ul>
					<div className="w-full inline-flex">
						<input type="text" className="border border-black grow h-full"></input>
						<button className="border border-black sm:p-2 p-1 text-white font-light sm:text-xl text-xs">SEND</button>
					</div>
				</div>
			</div>
		</div>
	)
}

export default GamePage;