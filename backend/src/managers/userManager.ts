import type { ClientWebSocket } from "../types/clientWebSocket/types"
import { RoomManager } from "./roomManager"

// id is used to know because in queue we only push Ids
interface User {
  id: string,
  socket: ClientWebSocket
}

interface Payload {
  roomId: string, 
  sdp?: string
  candidate?: string
}

class UserManager {
  private users: Map<string,User>
  private queue: string[]
  private roomManger: RoomManager 

  constructor(){
    this.users = new Map();
    this.queue = [] 
    this.roomManger = new RoomManager()

    // setInterval(()=>{
    //   console.log('user obj: ')
    //   console.log(Object.fromEntries(this.users))
    //   console.log("")
    // }, 3000)

  }

  addUser(ws:ClientWebSocket){
    const id = crypto.randomUUID();
    ws.userId = id
    this.users.set(id,{ id: id, socket: ws })
    this.queue.push(id)
    
    ws.send(JSON.stringify({ type: "waiting-for-match" }))

    this.clearQueue();

  }

  clearQueue(){
    if (this.queue.length < 2){
      return
    }
    while(this.queue.length >= 2){
      const id1 = this.queue.shift()!
      const id2 = this.queue.shift()!

      const user1 = this.users.get(id1)
      const user2 = this.users.get(id2)
      if (!user1 || !user2) return

      this.roomManger.createRoom(user1,user2)
      user1.socket.send("room created")
      user2.socket.send("room created")
    }
  }

  removeUser(id: string){
    this.users.delete(id)
    this.queue = this.queue.filter(uid => uid != id)
  }

  messageHandler(ws:ClientWebSocket,type:string, payload:Payload){
    if (type === "webrtc:offer"){

      /*
          payload: {roomId, sdp,ws}
      */
      const { roomId, sdp } = payload 
      console.log('payload')
      console.log(JSON.stringify(payload))
      if (!sdp){
        ws.send(JSON.stringify({ type: "sdp-not-present" }))
        return
      }
      this.roomManger.onOffer(roomId,sdp,ws.userId)

    } else if (type === "webrtc:answer"){
      const { roomId , sdp } = payload 
      if (!sdp){
        ws.send(JSON.stringify({ type: "sdp-not-present" }))
        return
      }
      this.roomManger.onAnswer(roomId,sdp,ws.userId)
    }
    else if (type === "webrtc:ice-candidate"){
      const { roomId, candidate } = payload
      if (!candidate){
        ws.send(JSON.stringify({ type: "candidate-not-present" }))
        return;
      }
      this.roomManger.onIceCandidates(roomId,candidate,ws.userId)
    }
  }
}


export const userManger = new UserManager();




/*
  // for user:add

  {
    "type": "user:add",
    "payload": {}
  }

  // for webrtc:offer

  {
    "type": "webrtc:offer",
    "payload": {
      "sdp": "",
      "roomId"
    }
  }


  {
    "type": "webrtc:answer",
    "payload": {
      "sdp": "",
      "roomId"
    }
  }

  {
    "type": "webrtc:ice-candidate",
    "payload": {
      "candidate": "",
      "roomId"
    }
  }


*/