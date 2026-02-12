export interface LearningRecord {
  id: number;
  userId: number;
  skillTreeId: number;
  nodeId: string;
  nodeName: string;
  completed: boolean;
  timeSpent: number;
  notes?: string;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateLearningRecordRequest {
  userId: number;
  skillTreeId: number;
  nodeId: string;
  nodeName: string;
  timeSpent: number;
  notes?: string;
}

export interface UpdateLearningRecordRequest {
  completed?: boolean;
  timeSpent?: number;
  notes?: string;
  completedAt?: Date;
}

export interface UserProgress {
  userId: number;
  skillTreeId: number;
  totalNodes: number;
  completedNodes: number;
  totalTimeSpent: number;
  overallProgress: number;
  lastUpdated: Date;
}