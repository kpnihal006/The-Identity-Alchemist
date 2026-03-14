import React, { useState, useRef, useEffect } from 'react';
import { synthesizeIdentity, generatePersonaImage, transcribeAudio, getEmbedding } from './services/gemini';
import { PersonalRevisionManifest, AgentLog } from './types';
import { Terminal } from './components/Terminal';
import { Manifest } from './components/Manifest';
import { SavedManifests } from './components/SavedManifests';
import { useAudioRecorder } from './hooks/useAudioRecorder';
import { INITIAL_NODES, INITIAL_CITIES } from './constants';
import { cosineSimilarity } from './utils/math';
import { Upload, FileText, Sparkles, Loader2, Mic, Square, Plus, X, Image as ImageIcon, Camera } from 'lucide-react';

export default function App() {
  const [contextText, setContextText] = useState('');
  const { isRecording, audioFile, startRecording, stopRecording, clearAudio } = useAudioRecorder();
  
  const [userPhoto, setUserPhoto] = useState<File | null>(null);
  const userPhotoInputRef = useRef<HTMLInputElement>(null);

  const [vibeImage, setVibeImage] = useState<File | null>(null);
  const vibeImageInputRef = useRef<HTMLInputElement>(null);

  const [bizarreness, setBizarreness] = useState(5);

  const [nodes, setNodes] = useState<string[]>(INITIAL_NODES);
  const [enabledNodes, setEnabledNodes] = useState<Set<string>>(new Set(INITIAL_NODES));
  const [newNodeName, setNewNodeName] = useState('');
  const [nodeImages, setNodeImages] = useState<Record<string, File>>({});
  const nodeImageInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const [cities, setCities] = useState<string[]>(INITIAL_CITIES);
  const [enabledCities, setEnabledCities] = useState<Set<string>>(new Set(INITIAL_CITIES));
  const [newCityName, setNewCityName] = useState('');

  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [manifest, setManifest] = useState<PersonalRevisionManifest | null>(null);
  const [imageUrl, setImageUrl] = useState<string | undefined>();
  const [logs, setLogs] = useState<AgentLog[]>([]);
  
  const [savedManifests, setSavedManifests] = useState<PersonalRevisionManifest[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('identity_manifests');
    if (saved) {
      setSavedManifests(JSON.parse(saved));
    }
  }, []);

  const saveManifestsToLocal = (manifests: PersonalRevisionManifest[]) => {
    localStorage.setItem('identity_manifests', JSON.stringify(manifests));
    setSavedManifests(manifests);
  };

  const addLog = (agent: string, message: string) => {
    setLogs((prev) => [
      ...prev,
      { id: Math.random().toString(36).substring(7), agent, message, timestamp: Date.now() },
    ]);
  };

  const toggleNode = (node: string) => {
    const next = new Set(enabledNodes);
    if (next.has(node)) next.delete(node);
    else next.add(node);
    setEnabledNodes(next);
  };

  const toggleCity = (city: string) => {
    const next = new Set(enabledCities);
    if (next.has(city)) next.delete(city);
    else next.add(city);
    setEnabledCities(next);
  };

  const handleNodeImageUpload = (node: string, file: File | null) => {
    if (file) {
      setNodeImages(prev => ({ ...prev, [node]: file }));
    } else {
      setNodeImages(prev => {
        const next = { ...prev };
        delete next[node];
        return next;
      });
    }
  };

  const handleSynthesize = async () => {
    if (enabledNodes.size === 0) {
      alert(`Please enable at least 1 influence node.`);
      return;
    }
    if (enabledCities.size === 0) {
      alert('Please enable at least 1 city.');
      return;
    }

    setIsSynthesizing(true);
    setManifest(null);
    setImageUrl(undefined);
    setLogs([]);

    try {
      addLog('System', 'Initializing Identity Alchemist Pipeline...');
      
      let combinedContext = contextText;
      
      if (audioFile) {
        addLog('Audio Agent', 'Transcribing deep personal history audio...');
        const transcript = await transcribeAudio(audioFile);
        combinedContext += `\n[Audio Transcript]: ${transcript}`;
        addLog('Audio Agent', 'Transcription complete and merged with context.');
      }

      addLog('Selection Agent', `Scanning ${enabledNodes.size} Influence Nodes across ${enabledCities.size} global cities.`);
      
      let selectedCategories: string[] = [];
      const enabledNodesArr: string[] = Array.from(enabledNodes);

      if (combinedContext.trim().length > 0) {
        addLog('Embedding Agent', 'Generating semantic embeddings for nuanced "Irrelevancy Match".');
        const contextEmbedding = await getEmbedding(combinedContext);
        
        addLog('Embedding Agent', 'Calculating cosine similarity across influence nodes.');
        const nodeEmbeddings = await Promise.all(
          enabledNodesArr.map(async (node) => {
            const emb = await getEmbedding(node);
            return { node, similarity: cosineSimilarity(contextEmbedding, emb) };
          })
        );

        nodeEmbeddings.sort((a, b) => b.similarity - a.similarity);
        
        // Nuanced selection: pick some highly similar, some highly dissimilar, some random
        const count = enabledNodes.size;
        const topCount = Math.ceil(count / 2);
        const bottomCount = Math.floor(count / 4);
        const randomCount = count - topCount - bottomCount;

        const topNodes = nodeEmbeddings.slice(0, topCount).map(n => n.node);
        const bottomNodes = nodeEmbeddings.slice(-bottomCount).map(n => n.node);
        
        const remainingNodes = enabledNodesArr.filter(n => !topNodes.includes(n) && !bottomNodes.includes(n));
        const randomNodes = remainingNodes.sort(() => 0.5 - Math.random()).slice(0, randomCount);

        selectedCategories = [...topNodes, ...bottomNodes, ...randomNodes];
        addLog('Selection Agent', `Nuanced selection complete. Nodes selected based on semantic resonance and dissonance.`);
      } else {
        addLog('Random Info Agent', 'No context provided. Generating chaotic seed parameters for strict irrelevancy match.');
        selectedCategories = enabledNodesArr.sort(() => 0.5 - Math.random());
      }

      addLog('Corroboration Agent', `Bridging disparate nodes: ${selectedCategories.join(', ')}.`);
      addLog('Criticizer Agent', 'Evaluating synthesis for coherence and hyper-individualization.');
      addLog('Wearability Review Agent', `Evaluating generated style against Bizarreness Threshold: ${bizarreness}/10.`);
      addLog('Constructor Agent', 'Finalizing Personal Revision Manifest. Awaiting Gemini synthesis.');

      const result = await synthesizeIdentity(
        combinedContext,
        selectedCategories,
        Array.from(enabledCities),
        nodeImages,
        vibeImage,
        bizarreness
      );
      setManifest(result);

      addLog('System', 'Manifest generated successfully. Initiating visual synthesis.');

      try {
        const img = await generatePersonaImage(result.revampText, userPhoto);
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

  const handleRegenerateImage = async (currentManifest: PersonalRevisionManifest) => {
    addLog('System', 'Regenerating visual synthesis based on updated manifest...');
    try {
      const img = await generatePersonaImage(currentManifest.revampText, userPhoto);
      setImageUrl(img);
      addLog('System', 'Visual synthesis complete.');
    } catch (imgError) {
      console.error('Image generation failed', imgError);
      addLog('System', 'Visual synthesis failed.');
    }
  };

  const handleSaveManifest = (manifestToSave: PersonalRevisionManifest) => {
    const existingIndex = savedManifests.findIndex(m => m.id === manifestToSave.id);
    let nextManifests;
    if (existingIndex >= 0) {
      nextManifests = [...savedManifests];
      nextManifests[existingIndex] = manifestToSave;
    } else {
      nextManifests = [manifestToSave, ...savedManifests];
    }
    saveManifestsToLocal(nextManifests);
  };

  const handleDeleteManifest = (id: string) => {
    saveManifestsToLocal(savedManifests.filter(m => m.id !== id));
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-emerald-500/30 pb-24">
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        
        <header className="space-y-4 text-center md:text-left">
          <h1 className="text-5xl md:text-7xl font-serif text-zinc-100 tracking-tighter">The Identity Alchemist</h1>
          <p className="text-xl text-zinc-500 max-w-3xl leading-relaxed">
            Disrupt personal brand saturation. Map irrelevancies and semantic resonance to synthesize your hyper-individualized lifestyle and fashion archetype.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Configuration */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Nodes Configuration */}
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center justify-between">
                <span>Influence Nodes</span>
                <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                  {enabledNodes.size} Active
                </span>
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => setEnabledNodes(new Set(nodes))} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">Select All</button>
                <button onClick={() => setEnabledNodes(new Set())} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">Deselect All</button>
                <button onClick={() => setEnabledNodes(new Set(nodes.filter(n => !enabledNodes.has(n))))} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">Inverse</button>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {nodes.map(node => (
                  <div key={node} className="flex items-center justify-between group">
                    <label className="flex items-center gap-3 cursor-pointer flex-1">
                      <input 
                        type="checkbox" 
                        checked={enabledNodes.has(node)}
                        onChange={() => toggleNode(node)}
                        className="w-4 h-4 rounded border-zinc-700 text-emerald-500 focus:ring-emerald-500/50 bg-zinc-950"
                      />
                      <span className={`text-sm ${enabledNodes.has(node) ? 'text-zinc-200' : 'text-zinc-600'}`}>
                        {node}
                      </span>
                    </label>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        ref={el => nodeImageInputRefs.current[node] = el}
                        onChange={(e) => handleNodeImageUpload(node, e.target.files?.[0] || null)}
                      />
                      {nodeImages[node] ? (
                        <button onClick={() => handleNodeImageUpload(node, null)} className="text-emerald-400 hover:text-emerald-300" title="Remove specific image">
                          <ImageIcon className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => nodeImageInputRefs.current[node]?.click()} className="text-zinc-500 hover:text-zinc-300" title="Upload specific image for this node">
                          <Upload className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                  placeholder="Add custom node..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newNodeName.trim()) {
                      setNodes([...nodes, newNodeName.trim()]);
                      setEnabledNodes(new Set(enabledNodes).add(newNodeName.trim()));
                      setNewNodeName('');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (newNodeName.trim()) {
                      setNodes([...nodes, newNodeName.trim()]);
                      setEnabledNodes(new Set(enabledNodes).add(newNodeName.trim()));
                      setNewNodeName('');
                    }
                  }}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Cities Configuration */}
            <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-100 mb-4 flex items-center justify-between">
                <span>Global Cities</span>
                <span className="text-xs font-mono text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">
                  {enabledCities.size} Active
                </span>
              </h2>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <button onClick={() => setEnabledCities(new Set(cities))} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">Select All</button>
                <button onClick={() => setEnabledCities(new Set())} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">Deselect All</button>
                <button onClick={() => setEnabledCities(new Set(cities.filter(c => !enabledCities.has(c))))} className="text-xs bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-2 py-1 rounded transition-colors">Inverse</button>
              </div>

              <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto custom-scrollbar">
                {cities.map(city => (
                  <button
                    key={city}
                    onClick={() => toggleCity(city)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                      enabledCities.has(city) 
                        ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-700'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>

              <div className="mt-4 flex gap-2">
                <input 
                  type="text" 
                  value={newCityName}
                  onChange={(e) => setNewCityName(e.target.value)}
                  placeholder="Add custom city..."
                  className="flex-1 bg-zinc-950 border border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-emerald-500"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && newCityName.trim()) {
                      setCities([...cities, newCityName.trim()]);
                      setEnabledCities(new Set(enabledCities).add(newCityName.trim()));
                      setNewCityName('');
                    }
                  }}
                />
                <button 
                  onClick={() => {
                    if (newCityName.trim()) {
                      setCities([...cities, newCityName.trim()]);
                      setEnabledCities(new Set(enabledCities).add(newCityName.trim()));
                      setNewCityName('');
                    }
                  }}
                  className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

          </div>

          {/* Right Column: Input & Pipeline */}
          <div className="lg:col-span-8 space-y-6">
            
            <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 space-y-6">
              
              <div>
                <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2 mb-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  Deep Personal History
                </h2>
                <p className="text-sm text-zinc-500 mb-4">Provide context: past journals, favorite sports, recurring textures of your life. This drives the semantic resonance engine.</p>
                
                <textarea
                  value={contextText}
                  onChange={(e) => setContextText(e.target.value)}
                  placeholder="e.g., I grew up near the ocean, I love the smell of old paper, and my favorite sport is fencing."
                  className="w-full h-32 bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-zinc-300 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all resize-none mb-4"
                />

                <div className="flex items-center gap-4">
                  {isRecording ? (
                    <button onClick={stopRecording} className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded-lg text-sm font-medium animate-pulse">
                      <Square className="w-4 h-4" /> Stop Recording
                    </button>
                  ) : (
                    <button onClick={startRecording} className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded-lg text-sm font-medium transition-colors">
                      <Mic className="w-4 h-4" /> Record Voice History
                    </button>
                  )}
                  
                  {audioFile && (
                    <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <span>Audio captured</span>
                      <button onClick={clearAudio} className="hover:text-emerald-300"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2 mb-2">
                  <Upload className="w-5 h-5 text-emerald-500" />
                  Vibe-Check (General Aesthetic Anchor) (Optional)
                </h2>
                <p className="text-sm text-zinc-500 mb-4">Upload an artifact, a chassis, or any visual anchor to influence the overall synthesis.</p>
                
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={vibeImageInputRef}
                  onChange={(e) => setVibeImage(e.target.files?.[0] || null)}
                />
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => vibeImageInputRef.current?.click()}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors border border-zinc-700 hover:border-zinc-600 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> Choose Vibe Image
                  </button>
                  {vibeImage && (
                    <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <span className="truncate max-w-[200px]">{vibeImage.name}</span>
                      <button onClick={() => setVibeImage(null)} className="hover:text-emerald-300"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2 mb-2">
                  <Sparkles className="w-5 h-5 text-emerald-500" />
                  Bizarreness Threshold: {bizarreness}/10
                </h2>
                <p className="text-sm text-zinc-500 mb-4">1 = Everyday realistic wear. 10 = Pure avant-garde conceptual art.</p>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={bizarreness}
                  onChange={(e) => setBizarreness(parseInt(e.target.value))}
                  className="w-full accent-emerald-500"
                />
              </div>

              <div className="pt-6 border-t border-zinc-800">
                <h2 className="text-xl font-semibold text-zinc-100 flex items-center gap-2 mb-2">
                  <Camera className="w-5 h-5 text-emerald-500" />
                  User Photo (Target Likeness) (Optional)
                </h2>
                <p className="text-sm text-zinc-500 mb-4">Upload a photo of yourself to apply the synthesized aesthetic directly to you in the final image.</p>
                
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  ref={userPhotoInputRef}
                  onChange={(e) => setUserPhoto(e.target.files?.[0] || null)}
                />
                
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => userPhotoInputRef.current?.click()}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg text-sm font-medium transition-colors border border-zinc-700 hover:border-zinc-600 flex items-center gap-2"
                  >
                    <Upload className="w-4 h-4" /> Choose Photo
                  </button>
                  {userPhoto && (
                    <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                      <span className="truncate max-w-[200px]">{userPhoto.name}</span>
                      <button onClick={() => setUserPhoto(null)} className="hover:text-emerald-300"><X className="w-4 h-4" /></button>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={handleSynthesize}
                disabled={isSynthesizing}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold tracking-wide transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:shadow-[0_0_30px_rgba(16,185,129,0.4)] mt-6"
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
              <div className="flex-1 min-h-[250px]">
                <Terminal logs={logs} />
              </div>
            </div>

          </div>
        </div>

        {manifest && (
          <div className="pt-12 border-t border-zinc-800/50">
            <Manifest 
              manifest={manifest} 
              imageUrl={imageUrl} 
              onSave={handleSaveManifest}
              onRegenerateImage={handleRegenerateImage}
            />
          </div>
        )}

        {savedManifests.length > 0 && (
          <div className="pt-12 border-t border-zinc-800/50">
            <SavedManifests 
              manifests={savedManifests} 
              onDelete={handleDeleteManifest}
              onSelect={(m) => {
                setManifest(m);
                setImageUrl(m.imageUrl);
                window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
              }}
            />
          </div>
        )}

      </div>
    </div>
  );
}
