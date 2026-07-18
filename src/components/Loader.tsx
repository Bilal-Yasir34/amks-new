import { motion } from 'framer-motion';

export default function Loader({ text = 'Loading' }: { text?: string }) {
  return (
    <div className="py-20 flex flex-col items-center justify-center min-h-[45vh] bg-white">
      <style>{`
        @keyframes loading-bar {
          0% { left: -50%; }
          100% { left: 100%; }
        }
      `}</style>
      <div className="flex flex-col items-center gap-4">
        <span className="font-display text-3xl tracking-[0.3em] text-ink-900 font-light select-none font-medium">AMKS</span>
        <div className="w-20 h-[1.5px] bg-ink-100 overflow-hidden relative">
          <div 
            className="absolute top-0 h-full bg-ink-900 w-1/2" 
            style={{
              animation: 'loading-bar 1.2s infinite ease-in-out',
            }}
          />
        </div>
        <p className="text-[10px] tracking-[0.2em] uppercase text-ink-400 font-medium select-none">{text}</p>
      </div>
    </div>
  );
}
