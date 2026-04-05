import { Video, Users, Shield, Globe, Zap, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  {
    icon: Video,
    title: "HD Video Calls",
    description: "Crystal-clear peer-to-peer video with low latency. No servers in between — just you and your friend.",
  },
  {
    icon: Users,
    title: "Meet New People",
    description: "Get matched with strangers worldwide who share your interests. Every call is a new adventure.",
  },
  {
    icon: Shield,
    title: "Safe & Moderated",
    description: "Advanced AI moderation keeps conversations clean and safe for everyone.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Connect with people from 190+ countries. Filter by region or go fully random.",
  },
  {
    icon: Zap,
    title: "Instant Connect",
    description: "No sign-ups needed to start. Click a button and you're connected in seconds.",
  },
  {
    icon: MessageCircle,
    title: "Text & Voice",
    description: "Not in the mood for video? Switch to text chat or voice-only calls anytime.",
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 opacity-30" style={{ background: "var(--gradient-glow)" }} />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-medium text-accent uppercase tracking-widest mb-3">Features</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Everything you need to{" "}
            <span className="text-gradient-primary">connect</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built for seamless peer-to-peer video calling with powerful features to make every conversation memorable.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              className="card-glass p-8 hover:border-primary/30 transition-all duration-300 group"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-primary flex items-center justify-center mb-5 group-hover:glow-primary transition-shadow">
                <feature.icon className="w-6 h-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-display font-semibold mb-3 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
