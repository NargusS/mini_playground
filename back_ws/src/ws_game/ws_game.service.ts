import { Injectable } from '@nestjs/common';
import { Socket } from 'dgram';
import { CreateWsGameDto } from './dto/create-ws_game.dto';
import { UpdateWsGameDto } from './dto/update-ws_game.dto';

@Injectable()
export class WsGameService {

  findAll() {
    return `This action returns all wsGame`;
  }

  findOne(id: number) {
    return `This action returns a #${id} wsGame`;
  }

  update(id: number, updateWsGameDto: UpdateWsGameDto) {
    return `This action updates a #${id} wsGame`;
  }

  remove(id: number) {
    return `This action removes a #${id} wsGame`;
  }
}
