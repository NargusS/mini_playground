import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {v4 as uuidv4} from 'uuid';

type Room = {
	name: string;
	player1: string;
	player2: string;
	spectators: string[];
	player1_score: number;
	player2_score: number;
	is_playing: boolean;
}

@Injectable()
export class WsGameService {
	number_of_player: number = 0;
	rooms: {[key:string]:Room} = {};
	queue: string[] = [];
	clients:{[key:string]:Socket} = {};

	getNumberOfConnectedPeople(): number {
		return this.number_of_player;
	}

	newUserConnected(client:Socket, server:Server): void {
		this.number_of_player++;
		server.emit('ConnectedPlayer', this.number_of_player);
		console.log("Connected "+ client.id + " ConnectedClient:" + this.getNumberOfConnectedPeople());
	}
	
	userDisconnected(client:Socket, server:Server): void {
		this.number_of_player--;
		server.except(client.id).emit('ConnectedPlayer', this.number_of_player);
		console.log("Disconnected "+client.id + " ConnectedClient:" + this.getNumberOfConnectedPeople());
	}

	// createRoom(client:Socket,server:Server): void {
	//   const room: Room = {
	//     room_name: uuidv4(),
	//     player1: client.id,
	//     player2: '',
	//     spectators: [],
	//     player1_score: 0,
	//     player2_score: 0,
	//     is_playing: false
	//   }

	//   this.rooms.push(room);
	
	//   client.join(room.room_name);
	//   console.log("Room created: " + room.room_name);
	//   server.to(room.room_name).emit('RoomCreated', room.room_name);
	//   server.emit('newRoom', this.rooms);
	// }

	createRoom(client1:string,client2:string,server:Server): void {
		const room: Room = {
			name: uuidv4(),
			player1: client1,
			player2: client2,
			spectators: [],
			player1_score: 0,
			player2_score: 0,
			is_playing: false
		}

		this.rooms[room.name] = room;
	
		// client1.join(room.room_name.toString());
		// client2.join(room.room_name.toString());
		console.log("Room created: " + room.name);
		server.to(room.name).emit('RoomCreated', room.name);
		server.to([this.clients[client1].id, this.clients[client2].id]).emit('FindGame', room.name);
		// server.in(room.room_name).fetchSockets().then((sockets) => {
		//   console.log(sockets.length)
		// })
	}

	// joinRoom(client:Socket, server:Server, room_name:string): void {
	//   const room: Room = this.rooms.find(room => room.room_name === room_name);
	//   if (room) {
	//     if (room.player2 === '') {
	//       room.player2 = client.id;
	//       client.join(room.room_name);
	//       server.to(room.room_name).emit('RoomJoined', room.room_name);
	//     } else {
	//       room.spectators.push(client.id);
	//       client.join(room.room_name);
	//       server.to(room.room_name).emit('RoomJoined', room.room_name);
	//     }
	//   }
	// }

	ClientSession(client:Socket, server:Server, playerId:string): void {
		console.log("NewClientSession: " + playerId);
		console.log("Clients: " + this.clients);
		this.clients[playerId] = client;
	}

	matchmaking(client:string, server:Server): void {
		if (this.queue.includes(client))
			return; // already in queue
		// Verifier si le client est connecte
		this.queue.push(client);
		if (this.queue.length > 1) {
			const player1: string = this.queue[0];
			const player2: string = this.queue[1];
			this.queue.splice(0, 2);
			this.createRoom(player1, player2, server);
		}
	}

	MakeMove(client: Socket, server:Server, data: any): void {
		console.log("MakeMove: " + data.id_game + " " + data.player + " " + data.position);
		server.to(data.id_game.toString()).except(client.id).emit('UpdateCanvas', {player_role: data.player, position: data.position});
	}

	getRoles(room_name: string, playerId: string): number {
		const room: Room = this.rooms[room_name];
		if (room !== undefined) {
			if (room.player1 == playerId)
				return 1;
			else if (room.player2 == playerId)
				return 2;
			else
				return 3;
		}
		return 0;
	}

	joinRoom(room_name:string, client_id:string,server:Server): void {
		console.log("JoinRoom: " + room_name + " " + client_id);
		const room: Room = this.rooms[room_name];
		if (room !== undefined) {
			console.log("JoinRoom: " + room_name + " " + client_id + " P1 :" + room.player1 + " P2:" + room.player2)
			if (room.player1 === client_id) {
				this.clients[client_id].join(room.name);
			}
			else if (room.player2 === client_id) {
				this.clients[client_id].join(room.name);
				server.emit('NewMatch', this.rooms);
			}
			else {
				room.spectators.push(client_id);
				this.clients[client_id].join(room.name);
			}
		}
	}

	getRooms(): {[key:string]:Room}{
		return this.rooms;
	}
}
