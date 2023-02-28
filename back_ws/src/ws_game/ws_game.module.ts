import { Module } from '@nestjs/common';
import { WsGameService } from './ws_game.service';
import { WsGameGateway } from './ws_game.gateway';

@Module({
  providers: [WsGameGateway, WsGameService]
})
export class WsGameModule {}
