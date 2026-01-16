export interface Task {
  id: string;
  category: string;
  title: string;
  description: string;
  steps: string[];
  state: 'ReadyForDev' | 'Done';
  progress: string | null;
  created_at: Date;
  updated_at: Date;
}
