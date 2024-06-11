import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  SubscribeMessage,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway()
export class MYTGateway implements OnGatewayInit {
  socketIds = new Map()
  constructor(){}

  @WebSocketServer()
  server: Server;

  afterInit(server: Server) {
    console.log('WebSocket server initialized!');
  }

  async handleConnection(@ConnectedSocket() client: Socket) {  
    console.log('kirdi     '+client.handshake.query.userId);
     this.socketIds.set(client.handshake.query.userId,client.id)
    this.server.to(client.id).emit('message', 'you connected successfully');
  }

  handleDisconnect(client: any) {
    console.log('chiqdi     '+client.handshake.query.userId);
    this.socketIds.delete(client.handshake.query.userId)
    this.server.to(client.id).emit('message', 'you disconnected successfully');
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(client: Socket, room: string) {
    client.join(room);
  }

  @SubscribeMessage('leave-room')
  handleLeaveRoom(client: Socket, room: string) {
    client.leave(room);
  }

  @SubscribeMessage('request-call')
  async requestToCallTwoUsers(client: Socket,{id,room,name}){    
    const user = this.socketIds.get(id)
    
    if(!user){
     return this.server.to(client.id).emit('not-online')
    }

    console.log(user);
    
    this.server.to(client.id).emit('calling-process')

    room = `room${room}`
    client.join(room)
    console.log(room);
    

    console.log(this.server.sockets.adapter.rooms.get(room).size);

    client.to(user).emit('audio-call',{room,name})
  }

  @SubscribeMessage('accept-call')
  async acceptCall(client: Socket,{room,name}){    
     client.join(room)
     this.server.to(room).emit('start-call',room)
     client.broadcast.to(room).emit('send-name',{name})

     console.log(this.server.sockets.adapter.rooms.get(room).size);
  }

  @SubscribeMessage('reject-call')
  async rejectCall(client: Socket,room){ 
    console.log('reject-call');
      
    this.server.to(room).emit('receive-reject-call') 
     this.server.in(room).socketsLeave(room)
     console.log(this.server.sockets.adapter.rooms?.get(room)?.size);
     
  }

  @SubscribeMessage('busy-call')
  async busytCall(client: Socket,room){ 
    console.log('busy-call');
      
    this.server.to(room).emit('receive-busy-call') 
     this.server.in(room).socketsLeave(room)
     console.log(this.server.sockets.adapter.rooms?.get(room)?.size);
     
  }

  @SubscribeMessage('end-call')
  async sendCall(client: Socket,room){ 
    this.server.to(room).emit('receive-end-call') 
     this.server.in(room).socketsLeave(room)
  }

  @SubscribeMessage('voice-message')
  async sendRoomMessage(client: Socket,message){ 
    console.log(message);
    
  client.broadcast.to('room').emit('receive-voice-message',message)  
  }




  async requestToCallRoom(){
    // check online users
    // choose random user
  }


}