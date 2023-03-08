import { useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import { SocketContext } from "./_app"
import { v4 as uuidv4 } from 'uuid';

async function getRooms() {
	const res = await fetch("http://localhost:3000/ws-game/rooms");
	const data = await res.json();
	return data;
}

function Home() {
	const [connectedUser, setConnectedUser] = useState(0);
	const [rooms, setRooms] = useState<any>([]);
	const socket = useContext(SocketContext);
	// const [socket, setSocket] = useState(io("http://localhost:4242/ws-game", {transports:["websocket"], autoConnect:false}));
	const router = useRouter();

	useEffect(() => {
		socket.connect();
		if (sessionStorage.playerId == undefined){
			sessionStorage.setItem("playerId", uuidv4());
			socket.emit("ClientSession", sessionStorage.playerId);
		}
		else{
			socket.emit("ClientSession", sessionStorage.playerId);
		}
		getRooms().then((data) => {
			console.log(data)
			setRooms(data);
		})
		socket.on("ConnectedPlayer", (value:number) => {
			setConnectedUser(value);
		})

		socket.on("NewMatch", (value:any) => {
			setRooms(value);
		})

		socket.on("FindGame", (value:any) => {
			router.push("/" + value);
		})
	},[])
	
	return (
		<>
			<main>
				<h1 className="text-3xl">Playground</h1>
				<h3 className="text-xl">Connected Users: {connectedUser}</h3>
				<ul>
					{rooms.length > 0 ? rooms.map((room:any) => {
						return (
							<li key={room.room_name}>
								IDROOM:{room.room_name}
							</li>
						)
					}) : <li>No rooms</li>}
				</ul>
				<button onClick={() => {
					socket.emit("matchmaking", sessionStorage.playerId)
				}}>Matchmaking</button>
			</main>
		</>
	)
}

export default Home;