export interface PRDItem {
  id: string;
  category: string;
  title: string;
  description: string;
  steps: string[];
  state: 'ReadyForDev' | 'Done';
  created_at: Date;
  updated_at: Date;
}
