import { createFeedback, getFeedbacksByUserId } from '../models/Feedback';

// 反馈分类映射
const VALID_CATEGORIES = [
  'stamina',     // 体力异常扣除
  'resource',    // 学习资源不存在
  'game',        // 游戏无法正常进行
  'monster',     // 怪兽数据异常
  'task',        // 任务系统问题
  'pomodoro',    // 专注计时问题
  'other',       // 其他问题
];

export class FeedbackService {
  /**
   * 提交反馈
   */
  static async submitFeedback(userId: number, category: string, content: string): Promise<{
    success: boolean;
    feedbackId: number;
  }> {
    // 校验分类
    if (!VALID_CATEGORIES.includes(category)) {
      throw new Error('无效的反馈分类');
    }

    // 校验内容
    if (!content.trim()) {
      throw new Error('反馈内容不能为空');
    }

    if (content.trim().length > 2000) {
      throw new Error('反馈内容不能超过2000字');
    }

    const feedbackId = await createFeedback({
      userId,
      category,
      content: content.trim(),
    });

    console.log(`[FeedbackService] 用户 ${userId} 提交反馈, ID: ${feedbackId}, 分类: ${category}`);
    return { success: true, feedbackId };
  }

  /**
   * 查询用户的反馈列表
   */
  static async getUserFeedbacks(userId: number): Promise<any[]> {
    const feedbacks = await getFeedbacksByUserId(userId);
    return feedbacks.map(f => ({
      id: f.id,
      category: f.category,
      content: f.content,
      status: f.status,
      adminReply: f.adminReply,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));
  }
}
