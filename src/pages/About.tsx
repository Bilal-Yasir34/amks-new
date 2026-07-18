import { motion } from 'framer-motion';
import { Award, Sparkles, Heart, Layers } from 'lucide-react';

export default function About() {
  return (
    <div>
      {/* Hero */}
      <section className="relative h-[50vh] min-h-[350px] overflow-hidden">
<<<<<<< HEAD
        <img src="images/about3.png" alt="AMKS Heritage" className="w-full h-full object-cover" />
=======
        <img src="https://images.pexels.com/photos/631162/pexels-photo-631162.jpeg?auto=compress&cs=tinysrgb&w=1920" alt="AMKS Heritage" className="w-full h-full object-cover" />
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
        <div className="absolute inset-0 bg-ink-900/50" />
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center text-white px-4">
            <p className="text-xs tracking-[0.3em] uppercase mb-4 text-white/70">Our Story</p>
            <h1 className="font-display text-4xl md:text-6xl font-light">The AMKS Heritage</h1>
          </motion.div>
        </div>
      </section>

      {/* Story */}
      <section className="section-padding py-20">
        <div className="max-w-3xl mx-auto text-center">
          <motion.p initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="font-display text-2xl md:text-3xl font-light italic leading-relaxed mb-8">
            "Every thread tells a story. Every weave carries a legacy. At AMKS, we don't just craft shawls and fabric — we weave heritage into every piece."
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6, delay: 0.2 }} className="text-sm text-ink-500 leading-relaxed space-y-4 text-left">
            <p>Founded with a passion for preserving the ancient art of textile craftsmanship, AMKS began as a small atelier dedicated to bringing premium Kashmir shawls and authentic tweed fabric to discerning customers across Pakistan.</p>
            <p>Our journey started in the valleys of Kashmir, where master artisans have practiced the art of hand-weaving for centuries. We source only the finest Cashmere wool, premium Merino, and authentic tweed from the world's most renowned mills.</p>
            <p>Today, AMKS stands as a testament to the belief that luxury is not about excess — it's about quality, heritage, and the human touch that transforms raw materials into wearable art.</p>
          </motion.div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding py-20 bg-stone-light">
        <div className="text-center mb-16">
          <motion.p initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} className="text-xs tracking-[0.3em] uppercase text-ink-400 mb-3">What We Stand For</motion.p>
          <motion.h2 initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }} className="font-display text-4xl md:text-5xl font-light">Our Mission & Values</motion.h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-5xl mx-auto">
          {[
            { icon: Award, title: 'Uncompromising Quality', desc: 'Every product is inspected by hand. We accept nothing less than perfection.' },
            { icon: Sparkles, title: 'Premium Materials', desc: 'Only the finest wool, cashmere, and tweed make it into our collections.' },
            { icon: Heart, title: 'Artisan Craftsmanship', desc: 'We support traditional artisans and preserve centuries-old weaving techniques.' },
            { icon: Layers, title: 'Timeless Design', desc: 'Our pieces are designed to be treasured for generations, not seasons.' },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 mb-5 border border-ink-200">
                <item.icon className="w-7 h-7 text-ink-700" />
              </div>
              <h3 className="text-sm font-medium tracking-wider uppercase mb-3">{item.title}</h3>
              <p className="text-sm text-ink-500 leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Craftsmanship */}
      <section className="section-padding py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
<<<<<<< HEAD
            <img src="images/about2.png" alt="Craftsmanship" className="w-full aspect-[4/3] object-cover" />
=======
            <img src="https://images.pexels.com/photos/4467687/pexels-photo-4467687.jpeg?auto=compress&cs=tinysrgb&w=1200" alt="Craftsmanship" className="w-full aspect-[4/3] object-cover" />
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <p className="text-xs tracking-[0.3em] uppercase text-ink-400 mb-3">Craftsmanship</p>
            <h2 className="font-display text-3xl md:text-4xl font-light mb-6">The Art of the Hand</h2>
            <div className="text-sm text-ink-500 leading-relaxed space-y-4">
              <p>Each AMKS shawl passes through the hands of master weavers who have spent decades perfecting their craft. From selecting the raw fiber to the final fringe, every step is done with intention.</p>
              <p>Our tweed fabric is woven on traditional looms, combining time-honored techniques with modern precision to create fabric that is both durable and luxurious.</p>
              <p>This is not mass production. This is artistry. And it shows in every piece.</p>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
