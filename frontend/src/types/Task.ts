export type TaskStatus = 'pending' | 'completed' | 'reviewed';

export interface Task {
  id: number;
  title: string;
  description: string;
  dueDate: string;
  xp: number;
  status: TaskStatus;
}
