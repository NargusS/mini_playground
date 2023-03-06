import { Controller } from '@nestjs/common';
import { Get } from '@nestjs/common';
import { WsGameService } from './ws_game.service';

@Controller('ws-game')
export class WsGameController {
	constructor(private readonly WsGameService: WsGameService) {}
	@Get('/connectedPlayer')
	getConnectedPlayer(): number {
		return this.WsGameService.getNumberOfConnectedPeople();
	}

	@Get('/listRoom')
	getListRooms(): any {
		return this.WsGameService.listRoom();
	}

}
