export interface SelectedNode {
  category: string;
  value: string;
  city: string;
}

export interface PersonalRevisionManifest {
  id: string;
  timestamp: number;
  silhouette: string;
  aura: string;
  ethos: string;
  revampText: string;
  selectedNodes: SelectedNode[];
  imageUrl?: string;
}

export interface AgentLog {
  id: string;
  agent: string;
  message: string;
  timestamp: number;
}
