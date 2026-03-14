export interface SelectedNode {
  category: string;
  value: string;
  city: string;
}

export interface PersonalRevisionManifest {
  silhouette: string;
  aura: string;
  ethos: string;
  revampText: string;
  selectedNodes: [SelectedNode, SelectedNode, SelectedNode];
}

export interface AgentLog {
  id: string;
  agent: string;
  message: string;
  timestamp: number;
}
