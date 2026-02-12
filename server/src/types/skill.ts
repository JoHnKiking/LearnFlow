export interface SkillNode {
  id: string;
  name: string;
  description: string;
  children?: SkillNode[];
  links?: SkillLink[];
}

export interface SkillLink {
  title: string;
  url: string;
  type: 'video' | 'article' | 'course' | 'documentation';
}

export interface SkillTreeRequest {
  domain: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export interface UserProgress {
  userId: string;
  skillTreeId: string;
  completedNodes: string[];
  completedLinks: string[];
  progress: number;
  lastUpdated: Date;
}

export interface SkillTreeListRequest {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
}

export interface SkillTreeStats {
  totalTrees: number;
  popularDomains: Array<{domain: string; count: number}>;
  averageProgress: number;
  totalUsers: number;
}

export interface SaveSkillTreeRequest {
  userId: string;
  skillTree: SkillNode;
  title?: string;
  tags?: string[];
}

export interface LearningReport {
  userId: string;
  period: string;
  summary: {
    totalLearningTime: string;
    completedSkills: number;
    averageProgress: number;
    streakDays: number;
  };
  weeklyProgress: Array<{week: string; progress: number}>;
  topSkills: string[];
  recommendations: string[];
}

export interface RecommendedPath {
  domain: string;
  currentLevel: string;
  targetLevel: string;
  path: Array<{step: number; topic: string; estimatedTime: string}>;
  totalEstimatedTime: string;
}