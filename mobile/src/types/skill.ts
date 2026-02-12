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