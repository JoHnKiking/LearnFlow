import { SkillNode } from '../types/skill';

export interface SkillTree {
  id: number;
  userId: number;
  domain: string;
  title: string;
  description?: string;
  nodes: SkillNode[];
  progress: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateSkillTreeRequest {
  userId: number;
  domain: string;
  title: string;
  description?: string;
  nodes: SkillNode[];
  isPublic?: boolean;
}

export interface UpdateSkillTreeRequest {
  title?: string;
  description?: string;
  nodes?: SkillNode[];
  progress?: number;
  isPublic?: boolean;
}

export interface SkillTreeListResponse {
  trees: SkillTree[];
  total: number;
  page: number;
  limit: number;
}