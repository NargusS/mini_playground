import { WebSocketGateway, SubscribeMessage, MessageBody, ConnectedSocket ,WebSocketServer, OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect} from '@nestjs/websockets';
import { WsGameService } from './ws_game.service';
import { Server, Socket } from 'socket.io';

@WebSocketGateway(4242, {transports:['websocket'], namespace: 'ws-game', cors: true})

// export class WsGameGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect{
export class WsGameGateway{
  @WebSocketServer() server: Server;
  // server: Server;
  constructor(private readonly wsGameService: WsGameService) {}
  
  //creer un tableau d'objet room {room_name, number_of_player or clients[], scores[], is_playing}

  afterInit() {
    console.log("Init");
  }
  
  @SubscribeMessage('ConnectedPlayer')
  handleConnectedPlayer(data:number): number {
    console.log("Event connection")
    return data;
  }

  handleConnection(client: Socket) {
    console.log("New Connection")
    this.wsGameService.newUserConnected(client, this.server);
  }

  handleDisconnect(client: Socket) {
    console.log("New Disconnection")
    this.wsGameService.userDisconnected(client, this.server);
  }

  // Function for create a room for playing
  // @SubscribeMessage('CreateRoom')
  // handleCreateRoom(@ConnectedSocket() client: Socket): void {
  //   this.wsGameService.createRoom(client, this.server);
  // }

  @SubscribeMessage('matchmaking')
  handleMatchmaking(@ConnectedSocket() client: Socket): void {
    this.wsGameService.matchmaking(client, this.server);
  }

  @SubscribeMessage('JoinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room_name: string): void {
    this.wsGameService.joinRoom(client, this.server, room_name);
  }

  @SubscribeMessage('MakeMove')
  handleMakeMove(@ConnectedSocket() client: Socket, @MessageBody() data: any): void {
    this.wsGameService.MakeMove(client, this.server,data);
  }

  // Function for join a room for playing
  // @SubscribeMessage('JoinRoom')
  // handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() room_name: string): void {
  //   this.wsGameService.joinRoom(client, this.server, room_name);
  // }
  // Function for leave a room for playing

  // Function for start a game

  // Function for list all player in a room 

}
