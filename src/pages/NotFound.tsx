import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function NotFound() {
  return (
    <div className="section-padding py-20 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="font-display text-8xl md:text-9xl font-light text-ink-900 mb-4">404</h1>
        <p className="text-sm text-ink-400 mb-8 max-w-md mx-auto">The page you are looking for does not exist or has been moved.</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </motion.div>
    </div>
  );
}
