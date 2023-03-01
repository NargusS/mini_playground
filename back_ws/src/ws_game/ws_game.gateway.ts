import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket ,WebSocketServer} from '@nestjs/websockets';
import { WsGameService } from './ws_game.service';
import { CreateWsGameDto } from './dto/create-ws_game.dto';
import { UpdateWsGameDto } from './dto/update-ws_game.dto';
import { Server } from 'socket.io';
import { Socket } from 'socket.io';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway(4242, {transports:['websocket'], cors:true})
export class WsGameGateway implements OnModuleInit{
  @WebSocketServer()
  server: Server;
  number_of_player: number = 0;
  constructor(private readonly wsGameService: WsGameService) {}
  
  //creer un tableau d'objet room {room_name, number_of_player or clients[], scores[], is_playing}

  onModuleInit() {
    this.server.on("connection",(socket) =>{
      console.log(socket.id);
      console.log("Connected");
      this.number_of_player++;
      this.server.emit('playerid', {id:socket.id,player:this.number_of_player});
    })
  }
  
  @SubscribeMessage('disconnect')
  disconnect(@ConnectedSocket() client: Socket):void{
    this.number_of_player--;
  }

  @SubscribeMessage('playerid')
  playerid(@ConnectedSocket() client: Socket, @MessageBody()data):void{
    this.server.except([client.id]).emit('playerid', {id:client.id,player:this.number_of_player});
  }

  @SubscribeMessage('test')
  test(@ConnectedSocket() client: Socket, @MessageBody() data):void{
    this.server.except([client.id]).emit('test', data);
  }

}
