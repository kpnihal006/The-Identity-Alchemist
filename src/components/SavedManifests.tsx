import React from 'react';
import { PersonalRevisionManifest } from '../types';
import { motion } from 'framer-motion';
import { Trash2 } from 'lucide-react';

interface SavedManifestsProps {
  manifests: PersonalRevisionManifest[];
  onDelete: (id: string) => void;
  onSelect: (manifest: PersonalRevisionManifest) => void;
}

export const SavedManifests: React.FC<SavedManifestsProps> = ({ manifests, onDelete, onSelect }) => {
  if (manifests.length === 0) return null;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif text-zinc-100 tracking-tight">Saved Archetypes</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {manifests.map((manifest) => (
          <motion.div
            key={manifest.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group cursor-pointer hover:border-emerald-500/50 transition-colors"
            onClick={() => onSelect(manifest)}
          >
            {manifest.imageUrl && (
              <div className="h-48 overflow-hidden relative">
                <img
                  src={manifest.imageUrl}
                  alt="Persona"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 to-transparent" />
              </div>
            )}
            <div className="p-5 relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(manifest.id);
                }}
                className="absolute top-4 right-4 p-2 bg-zinc-800/80 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="text-xs text-emerald-500 font-mono mb-2">
                {new Date(manifest.timestamp).toLocaleDateString()}
              </div>
              <p className="text-sm text-zinc-300 line-clamp-3 italic font-serif">
                "{manifest.revampText}"
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {manifest.selectedNodes.slice(0, 3).map((node, i) => (
                  <span key={i} className="text-[10px] uppercase tracking-wider bg-zinc-800 text-zinc-400 px-2 py-1 rounded">
                    {node.category}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
