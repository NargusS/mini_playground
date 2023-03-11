import { useContext, useEffect, useState } from "react"
import { useRouter } from "next/router"
import { SocketContext } from "./_app"
import { v4 as uuidv4 } from 'uuid';

async function getRooms() {
	const res = await fetch("http://localhost:3000/ws-game/rooms");
	const data = await res.json();
	return data;
}

async function getConnectedUser() {
	const res = await fetch("http://localhost:3000/ws-game/players");
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
			const new_rooms = Object.entries(data);
			setRooms(new_rooms);
		})
		getConnectedUser().then((data) => {
			setConnectedUser(data);
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
							<li key={room[0]}>
								IDROOM:{room[0]}
								<button className="bg-blue-500 text-white p-1 rounded-[8px]" onClick={() => {
									router.push("/" + room[0]);
								} }>Join</button>
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