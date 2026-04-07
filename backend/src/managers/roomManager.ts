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
  }

  createRoom(user1: User, user2: User){
    const roomId = this.generate();
    this.rooms.set(roomId, { user1: user1 , user2: user2 })

    // send to anyone websocket server to create offer and send to another

    user1.socket.send(JSON.stringify({
      type: "match:found",
      payload: {
        roomId: roomId,
        role: "offerer"
      }
    }));
    user2.socket.send(JSON.stringify({
      type: "match:found",
      payload: {
        roomId: roomId,
        role: "answerer"
      }
    }));
  }

  deleteRoom(roomId: string){
    this.rooms.delete(roomId);
  }

  // send offer to the receiver
  onOffer(roomId: string, sdp: string , senderSocketId: string){
    const room = this.rooms.get(roomId);
    if (!room){
      return;
    }
    const receiverSocket = room.user1.id === senderSocketId ? room.user2 : room.user1 ;
    receiverSocket.socket.send(JSON.stringify({
      type: "webrtc:offer",
      payload: {
        roomId: roomId,
        sdp: sdp
      }
    }));
  }

  onAnswer(roomId: string, sdp: string, senderSocketId: string){
    const room = this.rooms.get(roomId)
    if (!room){
      return;
    }
    const receiverSocket = room.user1.id === senderSocketId ? room.user2 : room.user1;
    receiverSocket.socket.send(JSON.stringify({
      type: "webrtc:answer",
      payload: {
        roomId: roomId,
        sdp: sdp
      }
    }));
  }
  
  onIceCandidates(roomId: string, candidate: any, senderSocketId: string){
    const room = this.rooms.get(roomId)
    if (!room){
      return;
    }
    const receiverSocket = room.user1.id === senderSocketId ? room.user2 : room.user1;
    receiverSocket.socket.send(JSON.stringify({
      type: "webrtc:ice-candidate",
      payload: {
        roomId: roomId,
        candidate: candidate
      }
    }));
  }

  generate(){
    const id = crypto.randomUUID();
    // check whether it exist or not but we are using randomUUID-> very hard collision occurs
    return id; 
  }

}