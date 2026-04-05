import { Star } from "lucide-react";
import { motion } from "framer-motion";

const testimonials = [
  {
    text: "I was looking for a safe video calling platform and this exceeded my expectations. The connection quality is amazing and I've made genuine friends from around the globe.",
    name: "User #2847",
    role: "Premium Member",
    rating: 5,
  },
  {
    text: "The peer-to-peer technology means zero lag. I've tried many alternatives and nothing comes close to how smooth and natural conversations feel here.",
    name: "User #1293",
    role: "Beta Tester",
    rating: 5,
  },
  {
    text: "Love the interest-based matching! I found people who share my hobbies and we now have regular video calls. The moderation keeps everything wholesome.",
    name: "User #4051",
    role: "Active User",
    rating: 5,
  },
  {
    text: "Simple, clean, and it just works. No downloads, no complicated setup. I was in a video call within 10 seconds of visiting the site. Incredible UX.",
    name: "User #3672",
    role: "New User",
    rating: 5,
  },
];

const Testimonials = () => {
  return (
    <section id="about" className="py-24 relative">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="text-sm font-medium text-accent uppercase tracking-widest mb-3">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Don't take our word for it
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Here's what our users have to say about their experience.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={i}
              className="card-glass p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-foreground/90 leading-relaxed mb-6 text-base italic">"{t.text}"</p>
              <div>
                <p className="font-semibold text-foreground font-display">{t.name}</p>
                <p className="text-sm text-muted-foreground">{t.role}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
