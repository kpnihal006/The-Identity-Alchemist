import React, { useState, useRef } from 'react';
import { synthesizeIdentity, generatePersonaImage } from './services/gemini';
import { PersonalRevisionManifest, AgentLog } from './types';
import { Terminal } from './components/Terminal';
import { Manifest } from './components/Manifest';
import { Upload, FileText, Sparkles, Loader2 } from 'lucide-react';

export default function App() {
  const [contextText, setContextText] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [manifest, setManifest] = useState<PersonalRevisionManifest | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [logs, setLogs] = useState<AgentLog[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addLog = (agent: string, message: string) => {
    setLogs((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(7), agent, message, timestamp: Date.now() },
    ]);
  };

  const handleSynthesize = async () => {
    setIsSynthesizing(true);
    setManifest(null);
    setImageUrl(undefined);
    setLogs([]);

    try {
      addLog('System', 'Initializing Identity Alchemist Pipeline...');
      await new Promise((r) => setTimeout(r, 800));

      addLog('Selection Agent', 'Scanning 13 Influence Nodes across 5 global cities.');
      await new Promise((r) => setTimeout(r, 1200));

      addLog('Random Info Agent', 'Generating chaotic seed parameters for irrelevancy match.');
      await new Promise((r) => setTimeout(r, 1000));

      addLog('Corroboration Agent', 'Bridging disparate nodes. Applying Inverted Capsule logic.');
      await new Promise((r) => setTimeout(r, 1500));

      addLog('Criticizer Agent', 'Evaluating synthesis for coherence and hyper-individualization.');
      await new Promise((r) => setTimeout(r, 1200));

      addLog('Constructor Agent', 'Finalizing Personal Revision Manifest. Awaiting Gemini synthesis.');

      const result = await synthesizeIdentity(contextText, imageFile);
      setManifest(result);

      addLog('System', 'Manifest generated successfully. Initiating visual synthesis.');

      try {
        const img = await generatePersonaImage(result.revampText);
        setImageUrl(img);
        addLog('System', 'Visual synthesis complete.');
      } catch (imgError) {
        console.error('Image generation failed', imgError);
        addLog('System', 'Visual synthesis failed. Proceeding with text manifest only.');
      }
    } catch (error) {
      console.error('Synthesis failed', error);
      addLog('System', 'ERROR: Pipeline collapse. Check API configuration.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-emerald-500/30">
      <div className="max-w-6xl mx-auto px-6 py-12 space-y-12">
        
        <header className="space-y-4">
          <h1 className="text-5xl font-serif text-zinc-100 tracking-tighter">The Identity Alchemist</h1>
          <p className="text-xl text-zinc-500 max-w-2xl leading-relaxed">
            Disrupt personal brand saturation. Map irrelevancies to synthesize your hyper-individualized lifestyle and fashion archetype.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6 bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800">
            <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-500" />
              Deep Personal History
            </h2>
            <p className="text-sm text-zinc-500">Provide context: past journals, favorite sports, recurring textures of your life.</p>
            <textarea
              value={contextText}
              onChange={(e) => setContextText(e.target.value)}
              placeholder="e.g., I grew up near the ocean, I love the smell of old paper, and my favorite sport is fencing."
              className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none"
            />

            <div className="pt-4 border-t border-zinc-800">
              <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2 mb-2">
                <Upload className="w-5 h-5 text-emerald-500" />
                Vibe-Check (Image Upload)
              </h2>
              <p className="text-sm text-zinc-500 mb-4">Upload an artifact, a chassis, or any visual anchor.</p>
              
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              />
              
              <div className="flex items-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors border border-zinc-700 hover:border-zinc-600"
                >
                  Choose File
                </button>
                <span className="text-sm text-zinc-500 truncate max-w-[200px]">
                  {imageFile ? imageFile.name : 'No file chosen'}
                </span>
              </div>
            </div>

            <button
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)]"
            >
              {isSynthesizing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Synthesizing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Initiate Synthesis Engine
                </>
              )}
            </button>
          </div>

          <div className="space-y-4 flex flex-col">
            <h2 className="text-xl font-semibold text-zinc-100 font-mono flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Pipeline Telemetry
            </h2>
            <div className="flex-1 min-h-[300px]">
              <Terminal logs={logs} />
            </div>
          </div>
        </div>

        {manifest && (
          <div className="pt-8 border-t border-zinc-800/50">
            <Manifest manifest={manifest} imageUrl={imageUrl} />
          </div>
        )}
      </div>
    </div>
  );
}
