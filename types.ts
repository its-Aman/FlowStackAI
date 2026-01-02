export interface FlowStep {
  id: string;
  title: string;
  duration: number; // in seconds
  description?: string;
}

export interface Flow {
  id: string;
  title: string;
  description: string;
  icon?: string; // Emoji or icon identifier
  color: string; // Tailwind color class specific (e.g., 'bg-blue-500')
  steps: FlowStep[];
  totalDuration: number;
  lastPlayed?: string; // ISO Date string
  tags: string[];
}

export interface FlowHistory {
  flowId: string;
  completedAt: string;
  durationSpent: number;
}

export enum AppRoute {
  DASHBOARD = '/',
  EDITOR = '/edit',
  PLAYER = '/play',
}
