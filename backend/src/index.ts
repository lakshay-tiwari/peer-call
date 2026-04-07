import { userManger } from "./managers/userManager";
import type { ClientWebSocket } from "./types/clientWebSocket/types";
import type { WSMessage } from "./types/messageType/type";

Bun.serve({
  port: 3000,
  fetch(req, server) {
    // upgrade the request to a WebSocket
    if (server.upgrade(req)) {
      return; // do not return a Response
    }
    return new Response("Upgrade failed", { status: 500 });
  },
  websocket: { // handlers

    open: (ws:ClientWebSocket)=>{
      console.log('Connection Established')
    }, 

    message: (ws:ClientWebSocket,message) => {
      if (Buffer.isBuffer(message)){
        ws.send(JSON.stringify({ message: "Send in string format"}))
        return; 
      }
      
      try {
        const { type, payload }: WSMessage = JSON.parse(message)
  
        if (type == "user:add"){
          userManger.addUser(ws);
          return 
        }
        if (type == "webrtc:offer" || type == "webrtc:answer" || type == "webrtc:ice-candidate"){
          userManger.messageHandler(ws,type,payload)
          return;
        }
        if (type == "user:remove"){
          userManger.removeUser(ws.userId)
          return;
        }
      } catch (error) {
        ws.send(JSON.stringify({ type: "invalid-message" }))
      }
    }, 

    close: (ws:ClientWebSocket) => {
      userManger.removeUser(ws.userId)
      console.log('websocket connection closes')
    }
  }, 
});

