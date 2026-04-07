import { useState, useRef, useEffect, useCallback } from "react";
import {
  Mic, MicOff, Video, VideoOff, PhoneOff, SkipForward,
  MessageCircle, X, Send, SwitchCamera, Maximize2, Minimize2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue } from "framer-motion";
import videoCall2 from "@/assets/video-call-2.jpg";
import videoCall4 from "@/assets/video-call-4.jpg";

type ChatMessage = {
  id: string;
  text: string;
  sender: "you" | "stranger";
  timestamp: Date;
};

type WSMessage = {
  type: string;
  payload: any;
};

type ConnectionStatus = "idle" | "searching" | "connected" | "disconnected";

const VideoChat = () => {
  
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const [mobileTab, setMobileTab] = useState<"video" | "chat">("video");
  const [fullscreen, setFullscreen] = useState(false);
  const [status, setStatus] = useState<ConnectionStatus>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [strangerImg, setStrangerImg] = useState(videoCall2);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const desktopVideoRef = useRef<HTMLVideoElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // refs near your existing refs
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const remoteStreamRef = useRef<MediaStream>(new MediaStream());
  const roomIdRef = useRef<string | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const wsRef = useRef<WebSocket | null>(null);

  const createPeerConnection = (roomId: string) => {
    const pc = new RTCPeerConnection();
    roomIdRef.current = roomId;

    // 1) Add local tracks (this sends your camera/mic)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        pc.addTrack(track, streamRef.current!);
      });
    }

    // 2) Receive remote tracks
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

  // 3) Send ICE candidates through WS
    pc.onicecandidate = (event) => {
      if (!event.candidate) return;
      wsRef.current?.send(
        JSON.stringify({
          type: "webrtc:ice-candidate",
          payload: {
            roomId,
            candidate: event.candidate,
          },
        })
      );
    };

    pcRef.current = pc;
    return pc;
  };

  

  useEffect(()=>{
    const ws = new WebSocket('ws://localhost:3000')
    ws.onopen = ()=>{
      wsRef.current = ws; 
      console.log('Websocket connections...') 
    }

    ws.onclose = ()=>{
      console.log('Websocket connection closed...');
    }

    ws.onmessage = async (event) => {
      try {
        const { type, payload }: WSMessage = JSON.parse(event.data)
        if (type == "waiting-for-match"){
          setStatus("searching");
        }
        if (type == "match-found"){
          const { roomId, role } = payload;
          const pc = createPeerConnection(roomId);

          if (role === "offerer"){
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);
            wsRef.current?.send(
              JSON.stringify({
                type: "webrtc:offer",
                payload: { roomId, sdp: pc.localDescription },
              })
            );
          }
          if (role == 'answerer'){
            console.log("you are answerer");
          }

          setStatus("connected");
        }
        if (type == "webrtc:offer"){
          const { roomId, sdp } = payload;
          if (!sdp){
            console.error("SDP not present");
            return;
          }
          const pc = pcRef.current ?? createPeerConnection(roomId);
          await pc.setRemoteDescription
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          wsRef.current?.send(
            JSON.stringify({
              type: "webrtc:ice-candidate",
              payload: { roomId, sdp: pc.localDescription }
            })
          )
        }
        if (type === "webrtc:answer"){
          const { roomId, sdp } = payload;
          if (!pcRef.current) return;
          if (!sdp){
            console.error("SDP not present");
            return;
          }
          await pcRef.current.setRemoteDescription(sdp);
        }
        if (type == "webrtc:ice-candidate"){
          const { roomId, candidate } = payload;
          if (!pcRef.current) return;
          if (!candidate){
            console.error("Candidate not present");
            return;
          }
          await pcRef.current.addIceCandidate(candidate);
        }
      } catch (error) {
        console.error("Invalid message:", error);
      }
      
    }

    return ()=>{
      ws.close();
    }
  },[])

  // Persistent drag position — survives re-renders
  const pipX = useMotionValue(0);
  const pipY = useMotionValue(0);

  const startCamera = useCallback(async (facing: "user" | "environment" = facingMode) => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facing },
        audio: true,
      });
      streamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      if (desktopVideoRef.current) {
        desktopVideoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  }, [facingMode]);

  useEffect(() => {
    startCamera();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (streamRef.current) {
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = streamRef.current;
      }
      if (desktopVideoRef.current) {
        desktopVideoRef.current.srcObject = streamRef.current;
      }
    }
  }, [mobileTab, camOn, status]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSwitchCamera = async () => {
    const newFacing = facingMode === "user" ? "environment" : "user";
    setFacingMode(newFacing);
    await startCamera(newFacing);
  };

  const strangerImages = [videoCall2, videoCall4];

  const handleStart = () => {
    // here message go for creating room
    if (!wsRef.current) return;
    wsRef.current.send(JSON.stringify({ type: "user:add" }));
    console.log("user added");
    
    // setMessages([]);
    // setStrangerImg(strangerImages[Math.floor(Math.random() * strangerImages.length)]);
    // setTimeout(() => {
    //   setStatus("connected");
    //   setMessages([
    //     { id: "system-1", text: "You are now connected with a stranger. Say hi!", sender: "stranger", timestamp: new Date() },
    //   ]);
    // }, 2000);
  };

  const handleNext = () => {
    // remove old connections make new one
    setStatus("searching");
    setMessages([]);
    setStrangerImg(strangerImages[Math.floor(Math.random() * strangerImages.length)]);
    setTimeout(() => {
      setStatus("connected");
      setMessages([
        { id: "system-" + Date.now(), text: "You are now connected with a new stranger. Say hi!", sender: "stranger", timestamp: new Date() },
      ]);
    }, 2000);
  };

  const handleStop = () => {
    // stop the websocket connections and stop everything
    setStatus("disconnected");
    setMessages((prev) => [
      ...prev,
      { id: "disc-" + Date.now(), text: "You have disconnected.", sender: "stranger", timestamp: new Date() },
    ]);
  };

  const handleSendMessage = () => {
    // this is done once video works 
    if (!input.trim() || status !== "connected") return;
    setMessages((prev) => [
      ...prev,
      { id: "you-" + Date.now(), text: input.trim(), sender: "you", timestamp: new Date() },
    ]);
    setInput("");
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: "stranger-" + Date.now(), text: "That's cool! Nice to meet you 😄", sender: "stranger", timestamp: new Date() },
      ]);
    }, 1500);
  };

  const toggleMic = () => {
    setMicOn((v) => !v);
    streamRef.current?.getAudioTracks().forEach((t) => { t.enabled = !t.enabled; });
  };

  const toggleCam = () => {
    setCamOn((v) => !v);
    streamRef.current?.getVideoTracks().forEach((t) => { t.enabled = !t.enabled; });
  };

  const statusLabel: Record<ConnectionStatus, string> = {
    idle: "Click Start to find someone",
    searching: "Looking for a stranger...",
    connected: "Connected",
    disconnected: "Disconnected",
  };

  // ─── Chat Messages ───
  const ChatMessages = () => (
    <>
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.sender === "you" ? "justify-end" : "justify-start"}`}>
          <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
            msg.sender === "you"
              ? "bg-gradient-primary text-primary-foreground rounded-br-md"
              : "bg-muted text-foreground rounded-bl-md"
          }`}>
            {msg.text}
          </div>
        </div>
      ))}
      <div ref={chatEndRef} />
    </>
  );

  // ─── Chat Input ───
  const ChatInput = () => (
    <form
      onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
      className="flex gap-2"
    >
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={status === "connected" ? "Type a message..." : "Connect to chat"}
        disabled={status !== "connected"}
        className="flex-1 bg-muted border border-border rounded-full px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary disabled:opacity-50"
      />
      <Button
        type="submit"
        size="icon"
        className="rounded-full bg-gradient-primary text-primary-foreground shrink-0"
        disabled={status !== "connected" || !input.trim()}
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );

  // ─── Stranger Video ───
  const StrangerVideoPanel = ({ className = "" }: { className?: string }) => (
    
    <div className={`relative h-full w-full bg-card overflow-hidden ${className}`}>
      {status === "connected" ? (
        <div className="absolute inset-0">
          <img
            src={strangerImg}
            alt="Stranger"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
          <p className="absolute bottom-4 left-4 text-sm text-foreground font-medium bg-background/60 backdrop-blur-sm px-3 py-1 rounded-full">
            Stranger
          </p>
        </div>
      ) : status === "searching" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
          <motion.div
            className="w-16 h-16 rounded-full border-2 border-primary border-t-transparent"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <p className="text-muted-foreground text-sm">Finding someone...</p>
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-6">
          <Video className="w-12 h-12 text-muted-foreground/50" />
          <p className="text-muted-foreground text-sm text-center">
            {status === "disconnected"
              ? 'Stranger disconnected. Click "Next" to find someone new.'
              : 'Click "Start" to begin video chatting'}
          </p>
        </div>
      )}
    </div>
  );

  // ─── Control Buttons ───
  const ControlButtons = ({ compact = false }: { compact?: boolean }) => {
    const btnSize = compact ? "w-10 h-10" : "w-12 h-12";
    return (
      <div className="flex items-center justify-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full ${btnSize} ${
            !micOn ? "bg-destructive/20 text-destructive hover:bg-destructive/30" : "bg-muted hover:bg-muted/80 text-foreground"
          }`}
          onClick={toggleMic}
        >
          {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className={`rounded-full ${btnSize} ${
            !camOn ? "bg-destructive/20 text-destructive hover:bg-destructive/30" : "bg-muted hover:bg-muted/80 text-foreground"
          }`}
          onClick={toggleCam}
        >
          {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </Button>

        {status === "idle" || status === "disconnected" ? (
          <Button
            className={`rounded-full ${compact ? "h-10 px-6 text-sm" : "h-12 px-8"} bg-gradient-primary text-primary-foreground hover:opacity-90 glow-primary`}
            onClick={handleStart}
          >
            Start
          </Button>
        ) : (
          <>
            <Button
              className={`rounded-full ${compact ? "h-10 px-4 text-sm" : "h-12 px-6"} bg-accent text-accent-foreground hover:opacity-90`}
              onClick={handleNext}
            >
              <SkipForward className="w-4 h-4 mr-1" />
              Next
            </Button>
            <Button
              className={`rounded-full ${btnSize} bg-destructive text-destructive-foreground hover:bg-destructive/90`}
              size="icon"
              onClick={handleStop}
            >
              <PhoneOff className="w-5 h-5" />
            </Button>
          </>
        )}
      </div>
    );
  };

  // ═══════════════════════════════════════════
  // SINGLE LAYOUT — responsive via CSS
  // ═══════════════════════════════════════════
  return (
    <div className="h-[100dvh] bg-background flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="h-12 md:h-14 border-b border-border flex items-center justify-between px-3 md:px-4 shrink-0 z-20">
        <a href="/" className="flex items-center gap-1.5 md:gap-2">
          <div className="w-6 h-6 md:w-7 md:h-7 rounded-md md:rounded-lg bg-gradient-primary flex items-center justify-center">
            <Video className="w-3 h-3 md:w-3.5 md:h-3.5 text-primary-foreground" />
          </div>
          <span className="text-base md:text-lg font-display font-bold text-foreground">
            Peer<span className="text-gradient-primary">Call</span>
          </span>
        </a>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              status === "connected" ? "bg-accent" : status === "searching" ? "bg-yellow-400 animate-pulse" : "bg-muted-foreground"
            }`} />
            <span className="text-xs md:text-sm text-muted-foreground">{statusLabel[status]}</span>
          </div>
          {/* Desktop chat toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="hidden md:flex text-muted-foreground"
            onClick={() => setChatOpen((v) => !v)}
          >
            <MessageCircle className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Mobile tabs — only on small screens */}
      <div className="h-11 border-b border-border flex shrink-0 md:hidden">
        <button
          onClick={() => setMobileTab("video")}
          className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors ${
            mobileTab === "video"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground"
          }`}
        >
          <Video className="w-4 h-4" />
          Video
        </button>
        <button
          onClick={() => setMobileTab("chat")}
          className={`flex-1 flex items-center justify-center gap-2 text-sm font-medium transition-colors relative ${
            mobileTab === "chat"
              ? "text-foreground border-b-2 border-primary"
              : "text-muted-foreground"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Chat
          {messages.length > 0 && mobileTab !== "chat" && (
            <span className="absolute top-2 right-[30%] w-2 h-2 rounded-full bg-accent" />
          )}
        </button>
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0">
        {/* ─── MOBILE: Video or Chat tab ─── */}
        <div className="flex-1 flex flex-col min-w-0 md:hidden">
          <div className="flex-1 min-h-0 relative">
            <div className={mobileTab === "video" ? "h-full w-full relative" : "hidden h-full w-full relative"} ref={videoContainerRef}>
              <StrangerVideoPanel className="absolute inset-0" />

              <motion.div
                drag
                dragMomentum={false}
                dragElastic={0.05}
                dragConstraints={videoContainerRef}
                style={{ x: pipX, y: pipY, touchAction: "none" }}
                className="absolute bottom-3 right-3 w-28 h-36 rounded-xl shadow-2xl border-2 border-primary/40 overflow-hidden z-10 cursor-grab active:cursor-grabbing touch-none"
              >
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${!camOn ? "hidden" : ""} ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
                />
                {!camOn && (
                  <div className="absolute inset-0 bg-card flex items-center justify-center">
                    <VideoOff className="w-6 h-6 text-muted-foreground" />
                  </div>
                )}
                <button
                  onClick={(e) => { e.stopPropagation(); handleSwitchCamera(); }}
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-background/60 backdrop-blur-sm flex items-center justify-center"
                >
                  <SwitchCamera className="w-3.5 h-3.5 text-foreground" />
                </button>
                <p className="absolute bottom-1 left-1.5 text-[10px] text-foreground font-medium bg-background/60 backdrop-blur-sm px-2 py-0.5 rounded-full">
                  You
                </p>
              </motion.div>
            </div>

            <div className={mobileTab === "chat" ? "h-full flex flex-col" : "hidden h-full flex flex-col"}>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-muted-foreground text-sm text-center">
                      {status === "connected"
                        ? "Start chatting! Send a message below."
                        : "Connect to start chatting."}
                    </p>
                  </div>
                ) : (
                  <ChatMessages />
                )}
              </div>
              <div className="p-3 border-t border-border shrink-0">
                <ChatInput />
              </div>
            </div>
          </div>

          <div className="h-[72px] border-t border-border flex items-center justify-center shrink-0 bg-background px-2">
            <ControlButtons compact />
          </div>
        </div>

        {/* ─── DESKTOP: Side by side videos ─── */}
        <div className="hidden md:flex flex-1 flex-col min-w-0">
          <div className="flex-1 grid grid-cols-2 gap-1 p-1">
            {/* Your video — left */}
            <div className="relative bg-card rounded-lg overflow-hidden">
              <video
                ref={desktopVideoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${!camOn ? "hidden" : ""} ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
              />
              {!camOn && (
                <div className="absolute inset-0 bg-card flex items-center justify-center">
                  <VideoOff className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <p className="absolute bottom-3 left-3 text-sm text-foreground font-medium bg-background/60 backdrop-blur-sm px-3 py-1 rounded-full">
                You
              </p>
            </div>

            {/* Stranger video — right */}
            <StrangerVideoPanel className="rounded-lg" />
          </div>

          {/* Desktop controls */}
          <div className="h-20 border-t border-border flex items-center justify-center gap-3 px-4 shrink-0">
            <ControlButtons />
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full w-12 h-12 bg-muted hover:bg-muted/80 text-foreground"
              onClick={() => setFullscreen((v) => !v)}
            >
              {fullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Desktop chat sidebar */}
        {chatOpen && (
          <div className="hidden md:flex w-80 border-l border-border flex-col shrink-0">
            <div className="h-12 border-b border-border flex items-center justify-between px-4 shrink-0">
              <span className="font-display font-semibold text-sm text-foreground">Chat</span>
              <button onClick={() => setChatOpen(false)} className="text-muted-foreground hover:text-foreground">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
              <ChatMessages />
            </div>

            <div className="p-3 border-t border-border shrink-0">
              <ChatInput />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoChat;
