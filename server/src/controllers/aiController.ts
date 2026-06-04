import { Request, Response } from 'express';
import { fillModule } from '../services/aiFillService';

/**
 * POST /api/ai/fill-module
 * AI 一键填充自定义模块内容
 * 降级策略：DeepSeek 不可用时返回 fallback 标记 + 友好提示
 */
export const fillModuleContent = async (req: Request, res: Response) => {
  const startTime = Date.now();

  try {
    const { moduleName } = req.body;

    // 校验模块名称
    if (!moduleName || typeof moduleName !== 'string' || !moduleName.trim()) {
      return res.status(400).json({
        code: 400,
        message: '模块名称不能为空',
        data: null,
      });
    }

    const trimmedName = moduleName.trim();
    console.log(`[AIController] 收到 AI 填充请求 - 模块: ${trimmedName}`);

    const result = await fillModule(trimmedName);

    const duration = Date.now() - startTime;

    // 降级响应：AI 不可用，返回友好提示而非 500 错误
    if (result.fallback) {
      console.warn(`[AIController] AI 降级 - 模块: ${trimmedName}, 耗时: ${duration}ms`);
      return res.json({
        code: 200,
        message: 'success',
        data: result,
      });
    }

    console.log(`[AIController] AI 填充成功 - 模块: ${trimmedName}, 耗时: ${duration}ms`);

    return res.json({
      code: 200,
      message: 'success',
      data: result,
    });
  } catch (error: any) {
    const duration = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : '未知错误';
    console.error(`[AIController] AI 填充失败 - 耗时: ${duration}ms, 错误: ${errorMessage}`);

    return res.status(500).json({
      code: 500,
      message: errorMessage || 'AI 生成失败，请重试',
      data: null,
    });
  }
};
