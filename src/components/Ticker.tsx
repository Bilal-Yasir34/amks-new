import { motion } from 'framer-motion';

export default function Ticker({ text }: { text: string }) {
  const repeated = Array(6).fill(text);
  return (
    <div className="bg-ink-900 text-white overflow-hidden py-2.5 relative">
      <motion.div
        className="flex whitespace-nowrap"
        animate={{ x: ['0%', '-50%'] }}
<<<<<<< HEAD
        transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
=======
        transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
>>>>>>> 258ebc843639e3c6d0e37f218826486742c6eb36
      >
        {repeated.map((t, i) => (
          <span key={i} className="mx-8 text-xs tracking-[0.25em] uppercase font-light flex items-center gap-8">
            {t}
            <span className="text-ink-500">/</span>
          </span>
        ))}
      </motion.div>
    </div>
  );
}
