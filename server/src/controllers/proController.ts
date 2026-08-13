import { Request, Response } from 'express';
import { ProService } from '../services/proService';

export class ProController {
  // 生成激活码（管理接口，后续可以加权限校验）
  static async generateCodes(req: Request, res: Response) {
    try {
      const { count = 1, planId, createdBy } = req.body;

      if (!planId || !['monthly', 'yearly', 'lifetime'].includes(planId)) {
        return res.status(400).json({ error: '请指定有效的套餐类型: monthly / yearly / lifetime' });
      }

      const codes = await ProService.generateCodes(count, planId, createdBy);
      res.json({ success: true, data: { codes, planId, count } });
    } catch (error) {
      res.status(500).json({ success: false, error: error instanceof Error ? error.message : '生成失败' });
    }
  }

  // 激活 Pro
  static async activateCode(req: Request, res: Response) {
    try {
      const { code, userId } = req.body;

      if (!code || !userId) {
        return res.status(400).json({ error: '激活码和用户ID不能为空' });
      }

      const result = await ProService.activateCode(code, userId);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '激活失败',
      });
    }
  }

  // 查询 Pro 状态
  static async getStatus(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      if (!userId) {
        return res.status(400).json({ error: '用户ID无效' });
      }

      const status = await ProService.getProStatus(userId);
      res.json({ success: true, data: status });
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : '查询失败',
      });
    }
  }
}
