import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressPeerServer } from 'peer';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const server = app.getHttpServer();
  const peerServer = ExpressPeerServer(server);

  peerServer.on('connection', (client) => {
    console.log(client.getId());
  });

  peerServer.on('disconnect', (client) => {
    console.log(`Peer disconnected: ${client.getId()}`);
  });

  peerServer.on('call',(call)=>{
    console.log(call);
    
  })


  app.use('/peer-server', peerServer);

  await app.listen(3000);
}
bootstrap();
