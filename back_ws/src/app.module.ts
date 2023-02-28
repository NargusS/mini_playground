import { Module } from '@nestjs/common';
import { WsGameModule } from './ws_game/ws_game.module';

@Module({
  imports: [WsGameModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
