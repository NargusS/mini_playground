import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket ,WebSocketServer} from '@nestjs/websockets';
import { WsGameService } from './ws_game.service';
import { CreateWsGameDto } from './dto/create-ws_game.dto';
import { UpdateWsGameDto } from './dto/update-ws_game.dto';
import { Server } from 'socket.io';
import { Socket } from 'dgram';
import { OnModuleInit } from '@nestjs/common';

@WebSocketGateway(4242, {transports:['websocket'], cors:true})
export class WsGameGateway implements OnModuleInit{
  @WebSocketServer()
  server: Server;
  constructor(private readonly wsGameService: WsGameService) {}
  
  //creer un tableau d'objet room {room_name, number_of_player or clients[], scores[], is_playing}

  onModuleInit() {
    this.server.on("connection",(socket) =>{
      console.log(socket.id);
      console.log("Connected");
    })
  }

  @SubscribeMessage('test')
  test(client:Socket, @MessageBody() data:string) {
    console.log(data + client);
    return data + {client};
  }

}
