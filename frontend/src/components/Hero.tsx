import { Video, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import videoCall1 from "@/assets/video-call-1.jpg";
import videoCall2 from "@/assets/video-call-2.jpg";
import videoCall3 from "@/assets/video-call-3.jpg";
import videoCall4 from "@/assets/video-call-4.jpg";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Background glow */}
      <div className="absolute inset-0" style={{ background: "var(--gradient-glow)" }} />
      
      {/* Decorative flowing lines */}
      <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 1440 900" fill="none">
        <path
          d="M-100 400 C200 200, 400 600, 700 350 S1100 500, 1540 300"
          stroke="hsl(245, 58%, 58%)"
          strokeWidth="2"
          fill="none"
        />
        <path
          d="M-50 500 C250 300, 450 700, 750 450 S1150 600, 1590 400"
          stroke="hsl(280, 60%, 55%)"
          strokeWidth="1.5"
          fill="none"
        />
      </svg>

      {/* Floating dots */}
      {[
        { top: "15%", left: "12%", size: 6, delay: 0 },
        { top: "25%", left: "30%", size: 4, delay: 0.5 },
        { top: "60%", left: "8%", size: 5, delay: 1 },
        { top: "40%", right: "15%", size: 4, delay: 0.3 },
        { top: "70%", right: "10%", size: 6, delay: 0.8 },
        { top: "20%", right: "25%", size: 3, delay: 1.2 },
      ].map((dot, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full bg-muted-foreground/30"
          style={{ top: dot.top, left: dot.left, right: (dot as any).right, width: dot.size, height: dot.size }}
          animate={{ opacity: [0.3, 0.7, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, delay: dot.delay }}
        />
      ))}

      <div className="max-w-7xl mx-auto px-6 w-full grid lg:grid-cols-2 gap-12 items-center relative z-10">
        {/* Left: Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold leading-tight mb-6">
            Connect face
            <br />
            to face,{" "}
            <span className="text-gradient-primary">instantly</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-lg mb-8 leading-relaxed">
            Experience crystal-clear peer-to-peer video calls. Connect with people around the world — no downloads, no hassle, just genuine conversations.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 glow-primary px-8 h-12 text-base">
              <Link to="/chat">
                <Video className="w-5 h-5 mr-2" />
                Start Video Call
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-border hover:bg-muted h-12 text-base px-8">
              <Link to="/chat">
                <MessageSquare className="w-5 h-5 mr-2" />
                Text Chat
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Right: Video call collage */}
        <motion.div
          className="relative h-[500px] hidden lg:block"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Main video */}
          <div className="absolute top-8 left-8 w-64 h-80 rounded-2xl overflow-hidden shadow-2xl glow-primary border-2 border-primary/30">
            <img src={videoCall1} alt="Video call participant" className="w-full h-full object-cover" width={512} height={640} />
          </div>
          
          {/* Secondary video */}
          <div className="absolute top-0 right-4 w-52 h-64 rounded-2xl overflow-hidden shadow-2xl border border-border/50">
            <img src={videoCall2} alt="Video call participant" loading="lazy" className="w-full h-full object-cover" width={512} height={640} />
          </div>

          {/* Small videos */}
          <div className="absolute bottom-4 left-0 w-40 h-48 rounded-xl overflow-hidden shadow-xl border border-border/50">
            <img src={videoCall3} alt="Video call participant" loading="lazy" className="w-full h-full object-cover" width={512} height={640} />
          </div>
          <div className="absolute bottom-8 right-12 w-44 h-52 rounded-xl overflow-hidden shadow-xl border border-border/50">
            <img src={videoCall4} alt="Video call participant" loading="lazy" className="w-full h-full object-cover" width={512} height={640} />
          </div>

          {/* Floating UI elements */}
          <motion.div
            className="absolute top-4 left-48 card-glass px-4 py-2 flex items-center gap-2 shadow-lg"
            animate={{ y: [0, -8, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm text-foreground font-medium">Live</span>
          </motion.div>

          <motion.div
            className="absolute bottom-20 right-0 card-glass px-4 py-3 shadow-lg"
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          >
            <p className="text-xs text-muted-foreground">Connected with</p>
            <p className="text-sm font-semibold text-foreground">Sarah from London 🇬🇧</p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
