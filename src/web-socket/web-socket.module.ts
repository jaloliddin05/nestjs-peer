import { Module } from '@nestjs/common';
import { MYTGateway } from './web-socket.gateway';
@Module({
  imports: [],
  providers: [MYTGateway],
})
export class MYTSocketModule {}
