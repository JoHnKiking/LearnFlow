import { Request, Response } from 'express';
import { SkillTreeRequest } from '../types';
import { generateMockSkillTree } from '../services';

// 生成技能树
export const generateSkillTree = async (req: Request, res: Response) => {
  console.log('[SkillController] POST /skills/generate - 生成技能树');
  try {
    const { domain, level = 'beginner' }: SkillTreeRequest = req.body;
    
    if (!domain) {
      console.log('[SkillController] 参数验证失败 - 缺少领域');
      return res.status(400).json({ error: 'Domain is required' });
    }

    console.log(`[SkillController] 生成技能树 - 领域: ${domain}, 等级: ${level}`);
    const skillTree = await generateMockSkillTree(domain, level);
    
    console.log('[SkillController] 技能树生成成功');
    res.json({
      success: true,
      data: skillTree
    });
  } catch (error) {
    console.error('[SkillController] 生成技能树失败:', error);
    res.status(500).json({ 
      error: 'Failed to generate skill tree',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export default {
  generateSkillTree
};
