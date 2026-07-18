import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export default function Auth({ mode }: { mode: 'login' | 'register' }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: name } },
        });
        if (error) throw error;
        toast.success('Account created! You are now signed in.');
        navigate('/account');
      } else {
        if (email.trim().toLowerCase() === 'admin@amks.pk') {
          throw new Error('Administrators must log in via the Admin Portal at /admin.');
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Welcome back!');
        navigate('/account');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="section-padding py-20">
      <div className="max-w-md mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-10">
          <h1 className="font-display text-4xl font-light mb-2">{mode === 'login' ? 'Sign In' : 'Create Account'}</h1>
          <p className="text-sm text-ink-400">{mode === 'login' ? 'Welcome back to AMKS' : 'Join the AMKS circle'}</p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {mode === 'register' && (
            <div>
              <label className="text-xs tracking-widest uppercase font-medium block mb-2">Full Name</label>
              <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
            </div>
          )}
          <div>
            <label className="text-xs tracking-widest uppercase font-medium block mb-2">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="text-xs tracking-widest uppercase font-medium block mb-2">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="input-field" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-400 mt-6">
          {mode === 'login' ? (
            <>Don't have an account? <Link to="/register" className="text-ink-900 underline">Register</Link></>
          ) : (
            <>Already have an account? <Link to="/login" className="text-ink-900 underline">Sign In</Link></>
          )}
        </p>
      </div>
    </div>
  );
}
