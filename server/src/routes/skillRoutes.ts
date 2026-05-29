import express from 'express';
import { 
  generateSkillTree, 
  getSkillTreeList, 
  getSkillTreeById,
  saveUserSkillTree,
  getUserProgress,
  updateUserProgress,
  getStatistics,
  searchPopularDomains,
  getRecommendedPath,
  getUserLearningReport
} from '../controllers';

const router = express.Router();

// 技能树生成和管理
router.post('/generate', generateSkillTree);
router.get('/list', getSkillTreeList);
router.get('/:id', getSkillTreeById);

// 用户相关功能
router.post('/save', saveUserSkillTree);
router.get('/progress/:userId', getUserProgress);
router.put('/progress/:userId', updateUserProgress);

// 搜索和推荐功能
router.get('/search/domains', searchPopularDomains);
router.get('/recommendations/path', getRecommendedPath);

// 统计和学习报告
router.get('/stats/overview', getStatistics);
router.get('/report/:userId', getUserLearningReport);

export default router;