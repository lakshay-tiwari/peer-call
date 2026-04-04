import type { ClientWebSocket } from "../types/clientWebSocket/types"

interface User {
  id: string,
  socket: ClientWebSocket
}

interface Room {
  user1: User
  user2: User 
}

export class RoomManager {
  private rooms: Map<string,Room>; 

  constructor(){
    this.rooms = new Map();

    setInterval(()=> {
      console.log('rooms: ')
      console.log(Object.fromEntries(this.rooms))
      console.log("")
    },5000)
  }

  createRoom(user1: User, user2: User){
    const roomId = this.generate();
    this.rooms.set(roomId, { user1: user1 , user2: user2 })
    // send to anyone websocket server to create offer and send to another

    user1.socket.send(JSON.stringify({ role: "sender" , message: "create-offer", roomId: roomId }));
    user2.socket.send(JSON.stringify({ role: "receiver", message :"wait for offer...", roomId: roomId }));
  }

  deleteRoom(roomId: string){
    this.rooms.delete(roomId);
  }

  onOffer(roomId: string, sdp: string , senderSocketId: string){
    const room = this.rooms.get(roomId);
    if (!room){
      return;
    }
    const receiverSocket = room.user1.id === senderSocketId ? room.user2 : room.user1 ; 
    receiverSocket.socket.send(JSON.stringify({ message: "onOffer", sdp: sdp, roomId: roomId}));
  }

  onAnswer(roomId: string, sdp: string, senderSocketId: string){
    const room = this.rooms.get(roomId)
    if (!room){
      return;
    }
    const receiverSocket = room.user1.id === senderSocketId ? room.user2 : room.user1;
    receiverSocket.socket.send(JSON.stringify({sdp: sdp, roomId: roomId, message: "OnAnswer"}))
  }
  
  onIceCandidates(roomId: string, candidate: any, senderSocketId: string){
    const room = this.rooms.get(roomId)
    if (!room){
      return;
    }
    const receiverSocket = room.user1.id === senderSocketId ? room.user2 : room.user1;
    receiverSocket.socket.send(JSON.stringify({candidate: candidate, roomId: roomId, message: "onIceCandidate"}))
  }

  generate(){
    const id = crypto.randomUUID();
    // check whether it exist or not but we are using randomUUID-> very hard collision occurs
    return id; 
  }

}