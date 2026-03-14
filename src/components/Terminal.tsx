import React, { useEffect, useRef } from 'react';
import { AgentLog } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

interface TerminalProps {
  logs: AgentLog[];
}

export const Terminal: React.FC<TerminalProps> = ({ logs }) => {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black/90 border border-emerald-500/30 rounded-xl p-4 h-64 overflow-y-auto font-mono text-xs text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] relative">
      <div className="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-black/90 to-transparent pointer-events-none" />
      <AnimatePresence initial={false}>
        {logs.map((log) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-2"
          >
            <span className="text-emerald-600">[{new Date(log.timestamp).toISOString().split('T')[1].slice(0, -1)}]</span>{' '}
            <span className="text-emerald-300 font-bold">[{log.agent}]</span>{' '}
            <span className="text-emerald-100/80">{log.message}</span>
          </motion.div>
        ))}
      </AnimatePresence>
      <div ref={endRef} />
    </div>
  );
};
