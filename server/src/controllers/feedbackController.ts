import { Request, Response } from 'express';
import { FeedbackService } from '../services/feedbackService';

export class FeedbackController {
  /**
   * 提交反馈
   */
  static async submitFeedback(req: Request, res: Response) {
    try {
      const { category, content } = req.body;
      const userId = req.user!.userId;

      if (!content) {
        return res.status(400).json({ error: '请输入问题描述' });
      }

      const result = await FeedbackService.submitFeedback(userId, category || 'other', content);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '提交反馈失败',
      });
    }
  }

  /**
   * 查询用户反馈列表
   */
  static async getUserFeedbacks(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const feedbacks = await FeedbackService.getUserFeedbacks(userId);
      res.json({ success: true, data: { feedbacks } });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '查询反馈失败',
      });
    }
  }
}
