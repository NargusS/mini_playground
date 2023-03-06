import { Injectable } from '@nestjs/common';
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

  getNumberOfConnectedPeople(): number {
    return this.number_of_player;
  }

  newUserConnected(client:Socket, server:Server): void {
    this.number_of_player++;
    server.except(client.id).emit('ConnectedPlayer', this.number_of_player);
    console.log("Connected "+ client.id + " ConnectedClient:" + this.getNumberOfConnectedPeople());
  }
  
  userDisconnected(client:Socket, server:Server): void {
    this.number_of_player--;
    server.except(client.id).emit('ConnectedPlayer', this.number_of_player);
    console.log("Disconnected "+client.id + " ConnectedClient:" + this.getNumberOfConnectedPeople());
  }

  createRoom(client:Socket,server:Server): void {
    const room: Room = {
      room_name: uuidv4(),
      player1: client.id,
      player2: '',
      spectators: [],
      player1_score: 0,
      player2_score: 0,
      is_playing: false
    }

    this.rooms.push(room);
  
    client.join(room.room_name);
    server.to(room.room_name).emit('RoomCreated', room.room_name);
    console.log("Room:"+room.room_name+" was Created")
  }

  joinRoom(client:Socket, server:Server, room_name:string): void {
    const room: Room = this.rooms.find(room => room.room_name === room_name);
    if (room) {
      if (room.player2 === '') {
        room.player2 = client.id;
        client.join(room.room_name);
        server.to(room.room_name).emit('RoomJoined', room.room_name);
      } else {
        room.spectators.push(client.id);
        client.join(room.room_name);
        server.to(room.room_name).emit('RoomJoined', room.room_name);
      }
    }
  }

  listRoom(): Room[] {
    return this.rooms;
  }
}
