import { Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const Footer = () => {
  return (
    <footer className="relative">
      {/* CTA Section */}
      <section id="support" className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
              Ready to{" "}
              <span className="text-gradient-primary">connect</span>?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
              Join thousands of people making meaningful connections every day. Start your first video call in seconds.
            </p>
            <Button size="lg" className="bg-gradient-primary text-primary-foreground hover:opacity-90 glow-primary px-10 h-14 text-lg">
              <Video className="w-5 h-5 mr-2" />
              Start Free Video Call
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer links */}
      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-primary flex items-center justify-center">
                  <Video className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="text-lg font-display font-bold text-foreground">
                  Peer<span className="text-gradient-primary">Call</span>
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Peer-to-peer video calling platform. Connect with people worldwide.
              </p>
            </div>

            {[
              {
                title: "Product",
                links: ["Video Chat", "Text Chat", "Pricing", "Download"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Press"],
              },
              {
                title: "Legal",
                links: ["Privacy", "Terms", "Cookies", "Safety"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="font-display font-semibold text-foreground mb-4">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="border-t border-border mt-12 pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2026 PeerCall. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
