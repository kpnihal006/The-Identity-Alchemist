import React, { useState } from 'react';
import { PersonalRevisionManifest } from '../types';
import { motion } from 'framer-motion';
import { Save, Share2, RefreshCw, Edit2, Check } from 'lucide-react';

interface ManifestProps {
  manifest: PersonalRevisionManifest;
  imageUrl?: string;
  onSave?: (manifest: PersonalRevisionManifest) => void;
  onRegenerateImage?: (manifest: PersonalRevisionManifest) => void;
}

export const Manifest: React.FC<ManifestProps> = ({ manifest: initialManifest, imageUrl, onSave, onRegenerateImage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [manifest, setManifest] = useState(initialManifest);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    if (onSave) {
      onSave({ ...manifest, imageUrl });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleShare = async () => {
    const text = `My Identity Alchemist Persona:\n\nSilhouette: ${manifest.silhouette}\n\nAura: ${manifest.aura}\n\nEthos: ${manifest.ethos}\n\nRevamp: ${manifest.revampText}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Identity Alchemist Persona',
          text,
        });
      } catch (err) {
        console.error('Share failed', err);
      }
    } else {
      navigator.clipboard.writeText(text);
      alert('Copied to clipboard!');
    }
  };

  const handleChange = (field: keyof PersonalRevisionManifest, value: string) => {
    setManifest(prev => ({ ...prev, [field]: value }));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 shadow-2xl text-zinc-300 relative"
    >
      <div className="absolute top-6 right-6 flex gap-3">
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-400 transition-colors"
          title={isEditing ? "Finish Editing" : "Edit Manifest"}
        >
          {isEditing ? <Check className="w-5 h-5" /> : <Edit2 className="w-5 h-5" />}
        </button>
        {onRegenerateImage && (
          <button
            onClick={() => onRegenerateImage(manifest)}
            className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-400 transition-colors"
            title="Regenerate Image based on current text"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        )}
        <button
          onClick={handleShare}
          className="p-2 bg-zinc-900 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-emerald-400 transition-colors"
          title="Share"
        >
          <Share2 className="w-5 h-5" />
        </button>
        {onSave && (
          <button
            onClick={handleSave}
            className={`p-2 rounded-lg transition-colors flex items-center gap-2 ${isSaved ? 'bg-emerald-600 text-white' : 'bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-emerald-400'}`}
            title="Save Manifest"
          >
            <Save className="w-5 h-5" />
            {isSaved && <span className="text-xs font-bold pr-1">Saved</span>}
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row gap-8 mt-4">
        <div className="flex-1 space-y-8">
          <div>
            <h2 className="text-3xl font-serif text-zinc-100 mb-2 tracking-tight">Personal Revision Manifest</h2>
            <div className="h-px w-full bg-gradient-to-r from-zinc-700 to-transparent" />
          </div>

          <div className="space-y-6">
            <section>
              <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-3 font-semibold">The Silhouette</h3>
              {isEditing ? (
                <textarea
                  value={manifest.silhouette}
                  onChange={(e) => handleChange('silhouette', e.target.value)}
                  className="w-full h-24 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              ) : (
                <p className="text-lg leading-relaxed">{manifest.silhouette}</p>
              )}
            </section>

            <section>
              <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-3 font-semibold">The Aura</h3>
              {isEditing ? (
                <textarea
                  value={manifest.aura}
                  onChange={(e) => handleChange('aura', e.target.value)}
                  className="w-full h-24 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              ) : (
                <p className="text-lg leading-relaxed">{manifest.aura}</p>
              )}
            </section>

            <section>
              <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-3 font-semibold">The Ethos</h3>
              {isEditing ? (
                <textarea
                  value={manifest.ethos}
                  onChange={(e) => handleChange('ethos', e.target.value)}
                  className="w-full h-24 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-zinc-200 focus:outline-none focus:border-emerald-500"
                />
              ) : (
                <p className="text-lg leading-relaxed">{manifest.ethos}</p>
              )}
            </section>
          </div>

          <div className="bg-zinc-900/50 p-6 rounded-xl border border-zinc-800/50">
            <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-4 font-semibold">Corroboration Logic</h3>
            <div className="flex flex-wrap gap-3">
              {manifest.selectedNodes.map((node, i) => (
                <div key={i} className="bg-zinc-800 px-4 py-2 rounded-full text-sm flex items-center gap-2">
                  <span className="text-emerald-400 font-mono">{node.category}</span>
                  <span className="text-zinc-400">({node.city})</span>
                  <span className="text-zinc-200">{node.value}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-800">
            <h3 className="text-sm uppercase tracking-widest text-zinc-500 mb-3 font-semibold">The Revamp</h3>
            {isEditing ? (
              <textarea
                value={manifest.revampText}
                onChange={(e) => handleChange('revampText', e.target.value)}
                className="w-full h-32 bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-zinc-200 focus:outline-none focus:border-emerald-500 font-serif italic"
              />
            ) : (
              <p className="text-xl font-serif italic text-zinc-200 leading-relaxed border-l-4 border-emerald-500 pl-4 py-2">
                "{manifest.revampText}"
              </p>
            )}
          </div>
        </div>

        {imageUrl && (
          <div className="md:w-1/3 flex-shrink-0">
            <div className="sticky top-8">
              <div className="aspect-[3/4] rounded-xl overflow-hidden border border-zinc-800 relative group">
                <img
                  src={imageUrl}
                  alt="Generated Persona"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                  <span className="text-xs uppercase tracking-widest text-white font-mono">Visual Synthesis Complete</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
