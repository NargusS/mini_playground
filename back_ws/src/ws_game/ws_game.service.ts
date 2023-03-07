import { Injectable } from '@nestjs/common';
import { ConnectedSocket } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {v4 as uuidv4} from 'uuid';

type Room = {
  room_name: string;
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
  rooms: Room[] = [];
  queue: Socket[] = [];

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

  createRoom(client1:Socket,client2:Socket,server:Server): void {
    const room: Room = {
      room_name: uuidv4(),
      player1: '',
      player2: '',
      spectators: [],
      player1_score: 0,
      player2_score: 0,
      is_playing: false
    }

    this.rooms.push(room);
  
    // client1.join(room.room_name.toString());
    // client2.join(room.room_name.toString());
    console.log("Room created: " + room.room_name);
    server.to(room.room_name).emit('RoomCreated', room.room_name);
    server.to([client1.id, client2.id]).emit('FindGame', room.room_name);
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

  matchmaking(client:Socket, server:Server): void {
    if (this.queue.includes(client))
      return; // already in queue
    this.queue.push(client);
    if (this.queue.length > 1) {
      const player1: Socket = this.queue[0];
      const player2: Socket = this.queue[1];
      this.queue.splice(0, 2);
      this.createRoom(player1, player2, server);
    }
  }

  MakeMove(client: Socket, server:Server, data: any): void {
    console.log("MakeMove: " + data.id_game + " " + data.player + " " + data.position);
    server.to(data.id_game.toString()).emit('UpdateCanvas', {player_role: data.player, position: data.position});
  }

  getRoles(room_name: string, playerId: string): number {
    const room: Room = this.rooms.find(room => room.room_name === room_name);
    if (room) {
      if (room.player1 == playerId)
        return 1;
      else if (room.player2 == playerId)
        return 2;
      else
        return 3;
    }
    return 0;
  }

  joinRoom(client:Socket, server:Server, room_name:string): void {
    console.log("JoinRoom: " + room_name + " " + client.id);
    const room: Room = this.rooms.find(room => room.room_name === room_name);
    if (room) {
      console.log("JoinRoom: " + room_name + " " + client.id + " P1 :" + room.player1 + " P2:" + room.player2)
      if (client.id === room.player1 || client.id === room.player2 || room.spectators.includes(client.id)) 
        return;
      if (room.player1 === '') {
        room.player1 = client.id;
        client.join(room.room_name);
      }
      else if (room.player2 === '') {
        room.player2 = client.id;
        client.join(room.room_name);
      }
      else {
        room.spectators.push(client.id);
        client.join(room.room_name);
      }
    }
  }
  getRooms(): Room[] {
    return this.rooms;
  }
}
